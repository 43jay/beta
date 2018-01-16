import React, { Component } from "react";
import { connect } from "react-redux";
import { setClaimRequest, disableClaim } from "../modules/claim";
import { sendEvent, clearTransactionEvent } from "../modules/transactions";
import { doClaimAllGas, doSendAsset } from "neon-js";
import ReactTooltip from "react-tooltip";
import { log } from "../util/Logs";
import { getIsHardwareLogin } from "../modules/account";

// wrap claiming with notifications

const doClaimNotify = (dispatch, net, selfAddress, wif) => {
  log(net, "CLAIM", selfAddress, { info: "claim all gas" });
  doClaimAllGas(net, wif).then(response => {
    if (response.result === true) {
      dispatch(
        sendEvent(
          true,
          "Your GAS claim was successful! Your balance will update once the blockchain has processed it."
        )
      );
      setTimeout(() => dispatch(disableClaim(false)), 3000);
    } else {
      dispatch(sendEvent(false, "Sorry. Claim failed. Please try again."));
    }
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
  });
};

const doGasClaimLedger = () => async dispatch => {
  const address = getAddress(state);
  const net = getNetwork(state);
  const signingFunction = getSigningFunction(state);
  const publicKey = getPublicKey(state);
  const isHardwareClaim = getIsHardwareLogin(state);

  // if no NEO in account, no need to send to self first
  if (NEO === 0) {
    return dispatch(doClaimNotify());
  } else {
    dispatch(
      sendEvent(
        true,
        "Sign transaction 1 of 2 to claim GAS on your hardware device (sending NEO to yourself)"
      )
    );
    let sendAssetFn;

    dispatch(sendEvent(true, "Sending 0 Neo in order to claim your GAS..."));
    sendAssetFn = () =>
      api.neonDB.doSendAsset(
        net,
        address,
        publicKey,
        { [ASSETS.NEO]: "NEO" },
        signingFunction
      );

    const [err, response] = await asyncWrap(sendAssetFn());
    if (err || response.result === undefined || response.result === false) {
      return dispatch(
        sendEvent(false, "Oops! Transaction failed. Please try again.")
      );
    } else {
      dispatch(sendEvent(true, "Waiting for the transaction to clear..."));
      dispatch(setClaimRequest(true));
      return dispatch(disableClaim(true));
    }
  }
};

// To initiate claim, first send zero Neo to own address, the set claimRequest state
// When new claims are available, this will trigger the claim
const doGasClaim = (dispatch, net, wif, selfAddress, ans) => {
  // if no neo in account, no need to send to self first
  if (ans === 0) {
    doClaimNotify(dispatch, net, selfAddress, wif);
  } else {
    dispatch(
      sendEvent(
        true,
        "Sign transaction 1 of 2 to claim GAS on your hardware device (sending NEO to yourself)"
      )
    );
    log(net, "SEND", selfAddress, {
      to: selfAddress,
      amount: ans,
      asset: "NEO"
    });
    doSendAsset(net, selfAddress, wif, "Neo", ans).then(response => {
      if (response.result === undefined || response.result === false) {
        dispatch(
          sendEvent(false, "Oops! Transaction failed. Please try again.")
        );
      } else {
        dispatch(sendEvent(true, "Waiting for the transaction to clear..."));
        dispatch(setClaimRequest(true));
        dispatch(disableClaim(true));
      }
    });
  }
};

class ClaimLedgerGas extends Component {
  componentDidUpdate = () => {
    if (
      this.props.claimRequest === true &&
      this.props.claimWasUpdated == true
    ) {
      this.props.dispatch(setClaimRequest(false));
      doClaimNotify(
        this.props.dispatch,
        this.props.net,
        this.props.address,
        this.props.wif
      );
    }
  };

  render = () => {
    let renderButton;
    const doClaim = () =>
      doGasClaim(
        this.props.dispatch,
        this.props.net,
        this.props.wif,
        this.props.address,
        this.props.neo
      );
    if (this.props.disableClaimButton === false) {
      renderButton = (
        <div id="gas-button" onClick={doClaim}>
          <span className="gas-claim">
            Claim Gas<br />
            {this.props.claimAmount}
          </span>
        </div>
      );
    } else {
      renderButton = (
        <div>
          <div id="ledger-gas-button" data-tip data-for="claimTip" className="">
            <span className="gas-claim">
              Claim Gas<br />
              {this.props.claimAmount}
            </span>
          </div>
          <div id="gas-loader" />
          <ReactTooltip
            className="solidTip"
            id="claimTip"
            place="bottom"
            type="light"
            effect="solid"
          >
            <span>You can claim GAS once every 5 minutes</span>
          </ReactTooltip>
        </div>
      );
    }
    return <div id="claim">{renderButton}</div>;
  };
}

const mapStateToProps = state => ({
  claimAmount: state.claim.claimAmount,
  claimRequest: state.claim.claimRequest,
  claimWasUpdated: state.claim.claimWasUpdated,
  disableClaimButton: state.claim.disableClaimButton,
  wif: state.account.wif,
  address: state.account.address,
  net: state.metadata.network,
  neo: state.wallet.Neo
});

ClaimLedgerGas = connect(mapStateToProps)(ClaimLedgerGas);

export default ClaimLedgerGas;
