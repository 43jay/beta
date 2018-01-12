import React, { Component } from "react";
import { connect } from "react-redux";
import { syncTransactionHistory } from "../components/NetworkSwitch";
import { shell } from "electron";
import Copy from "react-icons/lib/md/content-copy";
import { clipboard } from "electron";
import Claim from "./Claim";
import TopBar from "./TopBar";
import { initiateGetBalance, intervals } from "../components/NetworkSwitch";
import { sendEvent, clearTransactionEvent } from "../modules/transactions";

// TODO: make this a user setting
const getExplorerLink = (net, explorer, txid) => {
  let base;
  if (explorer === "Neotracker") {
    if (net === "MainNet") {
      base = "https://neotracker.io/tx/";
    } else {
      base = "https://testnet.neotracker.io/tx/";
    }
  } else {
    if (net === "MainNet") {
      base = "http://antcha.in/tx/hash/";
    } else {
      base = "http://testnet.antcha.in/tx/hash/";
    }
  }
  return base + txid;
};

// helper to open an external web link
const openExplorer = srcLink => {
  shell.openExternal(srcLink);
};

const refreshBalance = (dispatch, net, address) => {
  dispatch(sendEvent(true, "Refreshing..."));
  initiateGetBalance(dispatch, net, address).then(response => {
    dispatch(sendEvent(true, "Received latest blockchain information."));
    setTimeout(() => dispatch(clearTransactionEvent()), 1000);
  });
};

class TransactionHistory extends Component {
  componentDidMount = () => {
    syncTransactionHistory(
      this.props.dispatch,
      this.props.net,
      this.props.address
    );
  };

  render = () => (
    <div id="send">
      <TopBar />
      <div className="dash-panel fadeInDown">
        <div className="row">
          <div className="col-xs-9">
            <h2>Transaction History</h2>
          </div>
          <div
            className="col-xs-3 center top-10 send-info"
            onClick={() =>
              refreshBalance(
                this.props.dispatch,
                this.props.net,
                this.props.address
              )
            }
          >
            <span className="glyphicon glyphicon-refresh marg-right-5" /> Block:{" "}
            {this.props.blockHeight}
          </div>
          <div className="col-xs-12">
            <hr className="dash-hr-wide" />
          </div>
          <ul id="transactionList">
            {this.props.transactions.map(t => {
              const formatGas = gas =>
                Math.floor(parseFloat(gas) * 10000) / 10000;
              let formatAmount =
                t.type === "NEO" ? parseInt(t.amount) : formatGas(t.amount);
              return (
                <li key={t.txid}>
                  <div
                    className="col-xs-9 support-qs"
                    onClick={() =>
                      openExplorer(
                        getExplorerLink(
                          this.props.net,
                          this.props.explorer,
                          t.txid
                        )
                      )
                    }
                  >
                    <span className="glyphicon glyphicon-link marg-right-5" />
                    {t.txid.substring(0, 64)}{" "}
                  </div>
                  <div className="col-xs-3 center font-16">
                    {formatAmount} {t.type}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  blockHeight: state.metadata.blockHeight,
  address: state.account.address,
  net: state.metadata.network,
  neo: state.wallet.Neo,
  gas: state.wallet.Gas,
  price: state.wallet.price,
  transactions: state.wallet.transactions,
  explorer: state.metadata.blockExplorer
});

TransactionHistory = connect(mapStateToProps)(TransactionHistory);

export default TransactionHistory;
