import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import axios from "axios";
import Modal from "react-bootstrap-modal";
import QRCode from "qrcode.react";
import { clipboard, shell } from "electron";
import SplitPane from "react-split-pane";
import numeral from "numeral";
import ReactTooltip from "react-tooltip";

import { doSendAsset, verifyAddress, getTransactionHistory } from "neon-js";
import Neon, { wallet, api } from "@cityofzion/neon-js";

import {
  initiateGetBalance,
  intervals,
  syncTransactionHistory
} from "../components/NetworkSwitch";
import {
  resetPrice,
  setMarketPrice,
  setCombinedBalance
} from "../modules/wallet";
import { log } from "../util/Logs";
import ClaimLedgerGas from "./ClaimLedgerGas.js";
import Dashlogo from "../components/Brand/Dashlogo";
import { togglePane } from "../modules/dashboard";
import {
  sendEvent,
  clearTransactionEvent,
  toggleAsset
} from "../modules/transactions";
import commNode from "../modules/ledger/ledger-comm-node";

const BIP44_PATH =
  "8000002C" + "80000378" + "80000000" + "00000000" + "00000000";

let sendAddress, sendAmount, confirmButton;

const apiURL = val => {
  return `https://min-api.cryptocompare.com/data/price?fsym=${val}&tsyms=USD`;
};

// form validators for input fields
const validateForm = (dispatch, ledgerBalanceNeo, ledgerBalanceGAS, asset) => {
  // check for valid address
  try {
    if (
      verifyAddress(sendAddress.value) !== true ||
      sendAddress.value.charAt(0) !== "A"
    ) {
      dispatch(sendEvent(false, "The address you entered was not valid."));
      setTimeout(() => dispatch(clearTransactionEvent()), 1500);
      return false;
    }
  } catch (e) {
    dispatch(sendEvent(false, "The address you entered was not valid."));
    setTimeout(() => dispatch(clearTransactionEvent()), 1500);
    return false;
  }
  // check for fractional neo
  if (
    asset === "Neo" &&
    parseFloat(sendAmount.value) !== parseInt(sendAmount.value)
  ) {
    dispatch(sendEvent(false, "You cannot send fractional amounts of Neo."));
    setTimeout(() => dispatch(clearTransactionEvent()), 1500);
    return false;
  } else if (asset === "Neo" && parseInt(sendAmount.value) > ledgerBalanceNeo) {
    // check for value greater than account balance
    dispatch(sendEvent(false, "You do not have enough NEO to send."));
    setTimeout(() => dispatch(clearTransactionEvent()), 1500);
    return false;
  } else if (
    asset === "Gas" &&
    parseFloat(sendAmount.value) > ledgerBalanceGAS
  ) {
    dispatch(sendEvent(false, "You do not have enough GAS to send."));
    setTimeout(() => dispatch(clearTransactionEvent()), 1500);
    return false;
  } else if (parseFloat(sendAmount.value) < 0) {
    // check for negative asset
    dispatch(sendEvent(false, "You cannot send negative amounts of an asset."));
    setTimeout(() => dispatch(clearTransactionEvent()), 1500);
    return false;
  }
  return true;
};

// open confirm pane and validate fields
const openAndValidate = (
  dispatch,
  ledgerBalanceNeo,
  ledgerBalanceGAS,
  asset
) => {
  if (
    validateForm(dispatch, ledgerBalanceNeo, ledgerBalanceGAS, asset) === true
  ) {
    dispatch(togglePane("confirmPane"));
  }
};

// perform send transaction
const sendTransaction = (
  dispatch,
  net,
  LedgerAddress,
  wif,
  asset,
  ledgerBalanceNeo,
  ledgerBalanceGAS
) => {
  // validate fields again for good measure (might have changed?)
  if (
    validateForm(dispatch, ledgerBalanceNeo, ledgerBalanceGAS, asset) === true
  ) {
    dispatch(sendEvent(true, "Processing..."));
    log(net, "SEND", LedgerAddress, {
      to: sendAddress.value,
      asset: asset,
      amount: sendAmount.value
    });
    doSendAsset(net, sendAddress.value, wif, asset, sendAmount.value)
      .then(response => {
        if (response.result === undefined || response.result === false) {
          dispatch(sendEvent(false, "Transaction failed!"));
        } else {
          dispatch(
            sendEvent(
              true,
              "Transaction complete! Your balance will automatically update when the blockchain has processed it."
            )
          );
        }
        setTimeout(() => dispatch(clearTransactionEvent()), 1000);
      })
      .catch(e => {
        dispatch(sendEvent(false, "Transaction failed!"));
        setTimeout(() => dispatch(clearTransactionEvent()), 1000);
      });
  }
  // close confirm pane and clear fields
  dispatch(togglePane("confirmPane"));
  sendAddress.value = "";
  sendAmount.value = "";
  confirmButton.blur();
};

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

class LoginLedgerNanoS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      gas: 0,
      neo: 0,
      neo_usd: 0,
      gas_usd: 0,
      gasPrice: 0,
      value: 0,
      inputEnabled: true,
      ledgerAddress: "No Address Found. Click to Refresh",
      ledgerBalanceNeo: 0,
      ledgerBalanceGas: 0,
      ledgerNEOUSD: 0,
      ledgerGASUSD: 0,
      ledgerAvailable: false
    };
    this.handleChangeNeo = this.handleChangeNeo.bind(this);
    this.handleChangeGas = this.handleChangeGas.bind(this);
    this.handleChangeUSD = this.handleChangeUSD.bind(this);
  }

  async componentDidMount() {
    let neo = await axios.get(apiURL("NEO"));
    let gas = await axios.get(apiURL("GAS"));
    neo = neo.data.USD;
    gas = gas.data.USD;
    this.setState({ neo: neo, gas: gas });
  }

  async getLedgerAddress() {
    try {
      let result = await commNode.list_async();

      let message = Buffer.from(`8004000000${BIP44_PATH}`, "hex");
      let comm = await commNode.create_async();

      const validStatus = [0x9000];
      let response = await comm.exchange(message.toString("hex"), validStatus);

      let publicKeyEncoded = await wallet.getPublicKeyEncoded(
        response.substring(0, 130)
      );

      let loadAccount = new wallet.Account(publicKeyEncoded);

      this.setState({
        ledgerAddress: loadAccount.address,
        ledgerAvailable: true
      });

      this.getLedgerBalance(loadAccount.address, this.props.net);
      initiateGetBalance(
        this.props.dispatch,
        this.props.net,
        loadAccount.address
      );

      return loadAccount.address;
    } catch (error) {
      console.log(error);
      this.props.dispatch(
        sendEvent(
          false,
          "Please ensure that your Ledger Nano S is plugged in, unlocked and has the NEO app installed and open"
        )
      );
      setTimeout(() => this.props.dispatch(clearTransactionEvent()), 5000);

      if (error === "Invalid status 6e00") {
        this.props.dispatch(
          sendEvent(
            false,
            "Neo app on Ledger not open, Please open and try again"
          )
        );
        setTimeout(() => this.props.dispatch(clearTransactionEvent()), 5000);
      }
    }
  }

  async getLedgerBalance(address, net) {
    const filledBalance = await api.getBalanceFrom(
      { net: net, address: address },
      api.neonDB
    );
    this.setState({
      ledgerBalanceNeo: filledBalance.balance.NEO.balance,
      ledgerBalanceGas: filledBalance.balance.GAS.balance
    });

    this.getPrice(
      filledBalance.balance.NEO.balance,
      filledBalance.balance.GAS.balance
    );
  }

  handleChangeNeo(event) {
    this.setState({ value: event.target.value }, (sendAmount = value));
    const value = event.target.value * this.state.neo;
    this.setState({ neo_usd: value });
  }

  async getPrice(neo, gas) {
    let ledgerNEOUSD, ledgerGASUSD;
    try {
      let neoPrice = await axios.get(
        `https://min-api.cryptocompare.com/data/price?fsym=NEO&tsyms=USD`
      );

      let gasPrice = await axios.get(
        `https://min-api.cryptocompare.com/data/price?fsym=GAS&tsyms=USD`
      );

      ledgerGASUSD = gasPrice.data.USD * gas;
      ledgerNEOUSD = neoPrice.data.USD * neo;

      this.setState({ ledgerGASUSD, ledgerNEOUSD });
    } catch (error) {
      console.log(error);
    }
  }

  handleChangeGas(event) {
    this.setState({ value: event.target.value }, (sendAmount = value));
    const value = event.target.value * this.state.gas;
    this.setState({ gas_usd: value });
  }

  async handleChangeUSD(event) {
    this.setState({ gas_usd: event.target.value });
    let gas = await axios.get(apiURL("GAS"));
    gas = gas.data.USD;
    this.setState({ gas: gas });
    console.log("done");
    const value = this.state.gas_usd / this.state.gas;
    this.setState({ value: value }, (sendAmount = value));
  }

  render() {
    const {
      dispatch,
      wif,
      address,
      status,
      neo,
      gas,
      net,
      confirmPane,
      selectedAsset
    } = this.props;

    let btnClass;
    let formClass;
    let priceUSD = 0;
    let gasEnabled = false;
    let inputEnabled = true;
    let convertFunction = this.handleChangeNeo;
    if (selectedAsset === "Neo") {
      btnClass = "btn-send";
      convertFunction = this.handleChangeNeo;
      formClass = "form-send-neo";
      priceUSD = this.state.neo_usd;
      inputEnabled = true;
    } else if (selectedAsset === "Gas") {
      gasEnabled = true;
      inputEnabled = false;
      btnClass = "btn-send-gas";
      formClass = "form-send-gas";
      priceUSD = this.state.gas_usd;
      convertFunction = this.handleChangeGas;
    }

    const { ledgerAvailable } = this.state;

    return (
      <div>
        <div id="mainNav" className="main-nav">
          <div className="navbar navbar-inverse">
            <div className="navbar-header">
              <div className="logoContainer">
                <Dashlogo width={85} />
              </div>
              <div id="balance">
                {numeral(this.props.combined).format("$0,0.00")}
                <span className="bal-usd">USD</span>
                <span className="comb-bal">Available Balance</span>
              </div>
            </div>
            <div className="clearfix" />
            <hr className="dash-hr" />
            <div className="navbar-collapse collapse">
              <ul className="nav navbar-nav">
                <li>
                  <Link to={"/LoginLedgerNanoS"} activeClassName="active">
                    <span className="glyphicon glyphicon-th-large" /> Ledger
                    Nano S
                  </Link>
                </li>
                <li>
                  <Link to={"/TransactionLedger"} activeClassName="active">
                    <span className="glyphicon glyphicon-list-alt" /> History
                  </Link>
                </li>
                <li>
                  <Link to={"/"} activeClassName="active">
                    <span className="glyphicon glyphicon-question-sign" /> Help
                  </Link>
                </li>
                <li>
                  <Link to={"/"} activeClassName="active">
                    <span className="glyphicon glyphicon-circle-arrow-left" />{" "}
                    Return to Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <span className="dashnetwork">Network: {this.props.net}</span>
          <div className="copyright">&copy; Copyright 2018 Morpheus</div>
        </div>

        <div className="ledger-dash-layout">
          <div className="ledger-header">
            <div className="col-xs-5">
              <p className="market-price center">
                NEO {numeral(this.props.marketNeoPrice).format("$0,0.00")}
              </p>
              <p className="neo-text">
                {this.state.ledgerBalanceNeo} <span>NEO</span>
              </p>
              <hr className="dash-hr" />
              <p className="neo-balance">
                {numeral(this.state.ledgerNEOUSD).format("$0,0.00")} US
              </p>
            </div>

            <div className="col-xs-2">{<ClaimLedgerGas />}</div>

            <div className="col-xs-5 top-5">
              <p className="market-price center">
                GAS {numeral(this.props.marketGasPrice).format("$0,0.00")}
              </p>
              <p className="gas-text">
                {Math.floor(this.state.ledgerBalanceGas * 10000000) / 10000000}{" "}
                <span>GAS</span>
              </p>
              <hr className="dash-hr" />
              <p className="neo-balance">
                {" "}
                {numeral(this.state.ledgerGASUSD).format("$0,0.00")} USD
              </p>
            </div>
          </div>

          <div
            onClick={() => {
              this.getLedgerAddress();
            }}
            data-tip
            data-for="refreshTip"
            className="ledger-nanos animated fadeInUp"
          />

          <ReactTooltip
            className="solidTip"
            id="refreshTip"
            place="top"
            type="light"
            effect="solid"
          >
            <span>Click to Load Ledger Nano S</span>
          </ReactTooltip>

          <div className="row ledger-login-panel fadeInDown">
            Ledger Nano S Transaction Hisotry
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
}

const mapStateToProps = state => ({
  ledgerNanoSGetInfoAsync: state.account.ledgerNanoSGetInfoAsync,
  address: state.account.ledgerAddress,
  net: state.metadata.network,
  neo: state.wallet.Neo,
  gas: state.wallet.Gas,
  selectedAsset: state.transactions.selectedAsset,
  confirmPane: state.dashboard.confirmPane,
  price: state.wallet.price,
  gasPrice: state.wallet.gasPrice,
  marketGASPrice: state.wallet.marketGASPrice,
  marketNEOPrice: state.wallet.marketNEOPrice,
  combined: state.wallet.combined,
  explorer: state.metadata.blockExplorer,
  blockHeight: state.metadata.blockHeight,
  transactions: state.wallet.transactions
});

LoginLedgerNanoS = connect(mapStateToProps)(LoginLedgerNanoS);

export default LoginLedgerNanoS;
