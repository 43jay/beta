// @flow
import { wallet } from "@cityofzion/neon-js";
import storage from "electron-json-storage";

import {
  showErrorNotification,
  showInfoNotification,
  hideNotification
} from "./notifications";

import commNode from "../modules/ledger/ledger-comm-node";
import { ledgerNanoSCreateSignatureAsync } from "../modules/ledger/ledgerNanoS";

import { validatePassphraseLength } from "../core/wallet";
import { BIP44_PATH, ROUTES, FINDING_LEDGER_NOTICE } from "../core/constants";
import asyncWrap from "../core/asyncHelper";

// Constants
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const SET_ACCOUNTS = "SET_ACCOUNTS";
export const HARDWARE_DEVICE_INFO = "HARDWARE_DEVICE_INFO";
export const HARDWARE_PUBLIC_KEY_INFO = "HARDWARE_PUBLIC_KEY_INFO";
export const HARDWARE_PUBLIC_KEY = "HARDWARE_PUBLIC_KEY";
export const HARDWARE_LOGIN = "HARDWARE_LOGIN";

// Actions
export function login(wif) {
  return {
    type: LOGIN,
    payload: { wif }
  };
}

export function ledgerNanoSGetLogin() {
  return {
    type: LOGIN,
    payload: { signingFunction: ledgerNanoSCreateSignatureAsync }
  };
}

export function logout() {
  return {
    type: LOGOUT
  };
}

export function setAccounts(accounts) {
  return {
    type: SET_ACCOUNTS,
    payload: { accounts }
  };
}

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

// Reducer that manages account state (account now = private key)

// State Getters
export const getWIF = (state: Object) => state.account.wif;
export const getAddress = (state: Object) => state.account.address;
export const getLoggedIn = (state: Object) => state.account.loggedIn;
export const getRedirectUrl = (state: Object) => state.account.redirectUrl;
export const getAccounts = (state: Object) => state.account.accounts;
export const getSigningFunction = (state: Object) =>
  state.account.signingFunction;
export const getPublicKey = (state: Object) => state.account.publicKey;
export const getHardwareDeviceInfo = (state: Object) =>
  state.account.hardwareDeviceInfo;
export const getHardwarePublicKeyInfo = (state: Object) =>
  state.account.hardwarePublicKeyInfo;
export const getIsHardwareLogin = (state: Object) =>
  state.account.isHardwareLogin;

const initialState = {
  wif: null,
  address: null,
  loggedIn: false,
  redirectUrl: null,
  accounts: [],
  signingFunction: null,
  publicKey: null,
  isHardwareLogin: false,
  hardwareDeviceInfo: null,
  hardwarePublicKeyInfo: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      const { signingFunction, wif } = action.payload;
      let loadAccount;
      try {
        if (signingFunction) {
          const publicKeyEncoded = wallet.getPublicKeyEncoded(state.publicKey);
          loadAccount = new wallet.Account(publicKeyEncoded);
        } else {
          loadAccount = new wallet.Account(wif);
        }
      } catch (e) {
        console.log(e.stack);
        loadAccount = -1;
      }
      if (typeof loadAccount !== "object") {
        return {
          ...state,
          wif,
          loggedIn: false
        };
      }
      return {
        ...state,
        wif,
        address: loadAccount.address,
        loggedIn: true,
        signingFunction
      };
    case LOGOUT:
      return {
        ...state,
        wif: null,
        address: null,
        loggedIn: false,
        signingFunction: null,
        publicKey: null,
        isHardwareLogin: false
      };
    case SET_ACCOUNTS:
      const { accounts } = action.payload;
      return {
        ...state,
        accounts
      };
    case HARDWARE_DEVICE_INFO:
      const { hardwareDeviceInfo } = action.payload;
      return {
        ...state,
        hardwareDeviceInfo
      };
    case HARDWARE_LOGIN:
      const { isHardwareLogin } = action.payload;
      return {
        ...state,
        isHardwareLogin
      };
    case HARDWARE_PUBLIC_KEY_INFO:
      const { hardwarePublicKeyInfo } = action.payload;
      return {
        ...state,
        hardwarePublicKeyInfo
      };
    case HARDWARE_PUBLIC_KEY:
      const { publicKey } = action.payload;
      return {
        ...state,
        publicKey
      };
    default:
      return state;
  }
};
