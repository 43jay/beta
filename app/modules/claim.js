// Constants
export const SET_CLAIM = "SET_CLAIM";
export const SET_CLAIM_REQUEST = "SET_CLAIM_REQUEST";
export const DISABLE_CLAIM = "DISABLE_CLAIM";

// Actions
export function setClaim(available, unavailable) {
  return {
    type: SET_CLAIM,
    available,
    unavailable
  };
}

export function setClaimRequest(status) {
  return {
    type: SET_CLAIM_REQUEST,
    status
  };
}

export function disableClaim(status) {
  return {
    type: DISABLE_CLAIM,
    status
  };
}

export const doGasClaim = () => async (dispatch, getState) => {
  const state = getState();
  const wif = getWIF(state);
  const address = getAddress(state);
  const net = getNetwork(state);
  const NEO = getNEO(state);
  const signingFunction = getSigningFunction(state);
  const publicKey = getPublicKey(state);
  const isHardwareClaim = getIsHardwareLogin(state);

  // if no NEO in account, no need to send to self first
  if (NEO === 0) {
    return dispatch(doClaimNotify());
  } else {
    dispatch(
      showInfoNotification({
        message: "Sending NEO to Yourself...",
        autoDismiss: 0
      })
    );
    log(net, "SEND", address, { to: address, amount: NEO, asset: ASSETS.NEO });

    let sendAssetFn;
    if (isHardwareClaim) {
      dispatch(
        showInfoNotification({
          message:
            "Sign transaction 1 of 2 to claim GAS on your hardware device (sending NEO to yourself)",
          autoDismiss: 0
        })
      );
      sendAssetFn = () =>
        api.neonDB.doSendAsset(
          net,
          address,
          publicKey,
          { [ASSETS.NEO]: NEO },
          signingFunction
        );
    } else {
      sendAssetFn = () =>
        api.neonDB.doSendAsset(net, address, wif, { [ASSETS.NEO]: NEO }, null);
    }

    const [err, response] = await asyncWrap(sendAssetFn());
    if (err || response.result === undefined || response.result === false) {
      return dispatch(
        showErrorNotification({ message: "Transaction failed!" })
      );
    } else {
      dispatch(
        showInfoNotification({
          message: "Waiting for transaction to clear...",
          autoDismiss: 0
        })
      );
      dispatch(setClaimRequest(true));
      return dispatch(disableClaim(true));
    }
  }
};

// Reducer for managing claims data
export default (
  state = {
    claimRequest: false,
    claimAmount: 0,
    claimAvailable: 0,
    claimUnavailable: 0,
    claimWasUpdated: false,
    disableClaimButton: false
  },
  action
) => {
  switch (action.type) {
    case SET_CLAIM_REQUEST:
      return { ...state, claimRequest: action.status };
    case SET_CLAIM:
      let claimWasUpdated = false;
      if (
        action.available > state.claimAvailable &&
        state.claimRequest === true
      ) {
        claimWasUpdated = true;
      }
      return {
        ...state,
        claimAmount: (action.available + action.unavailable) / 100000000,
        claimAvailable: action.available,
        claimUnavailable: action.unavailable,
        claimWasUpdated
      };
    case DISABLE_CLAIM:
      return { ...state, disableClaimButton: action.status };
    default:
      return state;
  }
};
