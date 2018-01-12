import { getAccountsFromWIFKey } from "neon-js";
import { ledgerNanoSCreateSignatureAsync } from "../modules/ledger/ledgerNanoS";

// Constants
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const SET_ADDRESS = "SET_ADDRESS";
export const SET_DECRYPTING = "SET_DECRYPTING";
export const SET_KEYS = "SET_KEYS";
export const FINDING_LEDGER_NOTICE =
  "Looking for USB Devices. Please plugin your device and login.";
export const BIP44_PATH =
  "8000002C" + "80000378" + "80000000" + "00000000" + "00000000";

export function hardwareDeviceInfo(hardwareDeviceInfo) {
  return {
    type: HARDWARE_DEVICE_INFO,
    payload: { hardwareDeviceInfo }
  };
}

export function hardwarePublicKeyInfo(hardwarePublicKeyInfo) {
  return {
    type: HARDWARE_PUBLIC_KEY_INFO,
    payload: { hardwarePublicKeyInfo }
  };
}

export function hardwarePublicKey(publicKey) {
  return {
    type: HARDWARE_PUBLIC_KEY,
    payload: { publicKey }
  };
}

export function isHardwareLogin(isHardwareLogin) {
  return {
    type: HARDWARE_LOGIN,
    payload: { isHardwareLogin }
  };
}

export function ledgerNanoSGetLogin() {
  return {
    type: LOGIN,
    payload: { signingFunction: ledgerNanoSCreateSignatureAsync }
  };
}

export const ledgerNanoSGetInfoAsync = () => async dispatch => {
  const dispatchError = (message, deviceInfoMsg) => {
    dispatch(isHardwareLogin(false));
    dispatch(hardwarePublicKey(null));
    if (deviceInfoMsg) {
      dispatch(hardwarePublicKeyInfo(null));
      return dispatch(hardwareDeviceInfo(message));
    } else {
      return dispatch(hardwarePublicKeyInfo(message));
    }
  };
  dispatch(hardwareDeviceInfo(FINDING_LEDGER_NOTICE));
  let [err, result] = await asyncWrap(commNode.list_async());
  if (err) {
    return dispatchError(`Finding USB Error: ${err}. ${FINDING_LEDGER_NOTICE}`);
  }
  if (result.length === 0) {
    return dispatchError(
      `USB Failure: No device found. ${FINDING_LEDGER_NOTICE}`
    );
  } else {
    let [err, comm] = await asyncWrap(commNode.create_async());
    if (err) {
      return dispatchError(
        `Finding USB Error: ${err}. ${FINDING_LEDGER_NOTICE}`
      );
    }

    const deviceInfo = comm.device.getDeviceInfo();
    comm.device.close();
    dispatch(
      hardwareDeviceInfo(
        `Found USB ${deviceInfo.manufacturer} ${deviceInfo.product}`
      )
    );
  }
  [err, result] = await asyncWrap(commNode.list_async());
  if (result.length === 0) {
    return dispatchError(
      "Hardware Device Error. Login to NEO App and try again",
      false
    );
  } else {
    let [err, comm] = await asyncWrap(commNode.create_async());
    if (err) {
      console.log(`Public Key Comm Init Error: ${err}`);
      return dispatchError(
        "Hardware Device Error. Login to NEO App and try again",
        false
      );
    }

    let message = Buffer.from(`8004000000${BIP44_PATH}`, "hex");
    const validStatus = [0x9000];
    let [error, response] = await asyncWrap(
      comm.exchange(message.toString("hex"), validStatus)
    );
    if (error) {
      comm.device.close(); // NOTE: do we need this close here - what about the other errors that do not have it at the moment
      if (error === "Invalid status 28160") {
        return dispatchError(
          "NEO App does not appear to be open, request for private key returned error 28160.",
          false
        );
      } else {
        console.log(`Public Key Comm Messaging Error: ${error}`);
        return dispatchError(
          "Hardware Device Error. Login to NEO App and try again",
          false
        );
      }
    }
    comm.device.close();
    dispatch(isHardwareLogin(true));
    dispatch(hardwarePublicKey(response.substring(0, 130)));
    return dispatch(
      hardwarePublicKeyInfo(
        "Success. NEO App Found on Hardware Device. Click Button Above to Login"
      )
    );
  }
};

// Actions
export function login(wif) {
  return {
    type: LOGIN,
    wif: wif
  };
}

export function logout() {
  return {
    type: LOGOUT
  };
}

export function decrypting(bool) {
  return {
    type: SET_DECRYPTING,
    state: bool
  };
}

export function setKeys(keys) {
  return {
    type: SET_KEYS,
    keys
  };
}

export function setAddress(address) {
  return {
    type: SET_ADDRESS,
    address: address
  };
}

// Reducer that manages account state (account now = private key)
export default (
  state = {
    wif: null,
    address: null,
    loggedIn: false,
    redirectUrl: null,
    decrypting: false,
    accountKeys: []
  },
  action
) => {
  switch (action.type) {
    case LOGIN:
      let loadAccount;
      try {
        loadAccount = getAccountsFromWIFKey(action.wif)[0];
      } catch (e) {
        loadAccount = -1;
      }
      if (
        loadAccount === -1 ||
        loadAccount === -2 ||
        loadAccount === undefined
      ) {
        return { ...state, wif: action.wif, loggedIn: false };
      }
      return {
        ...state,
        wif: action.wif,
        address: loadAccount.address,
        loggedIn: true,
        decrypting: false
      };
    case LOGOUT:
      return {
        ...state,
        wif: null,
        address: null,
        loggedIn: false,
        decrypting: false
      };
    case SET_ADDRESS:
      return {
        ...state,
        wif: null,
        address: action.address
      };
    case SET_DECRYPTING:
      return { ...state, decrypting: action.state };
    case SET_KEYS:
      return { ...state, accountKeys: action.keys };
    default:
      return state;
  }
};
