import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getBalance,
  getTransactionHistory,
  getClaimAmounts,
  getWalletDBHeight,
  getAPIEndpoint
} from "neon-js";
import { setClaim } from "../modules/claim";
import { setBlockHeight, setNetwork } from "../modules/metadata";
import {
  setBalance,
  setMarketPrice,
  resetPrice,
  setTransactionHistory
} from "../modules/wallet";
import { version } from "../../package.json";
import { sendEvent, clearTransactionEvent } from "../modules/transactions";
import axios from "axios";

let intervals = {};

let netSelect;

// https://bittrex.com/api/v1.1/public/getmarkethistory?market=BTC-NEO

// putting this back in wallet, does not belong in neon-js
export const getMarketPriceUSD = amount => {
  return axios
    .get("https://bittrex.com/api/v1.1/public/getticker?market=USDT-NEO")
    .then(response => {
      let lastUSDNEO = Number(response.data.result.Last);
      return lastUSDNEO * amount;
    });
};

const getGasPrice = async gasVal => {
  try {
    let gas = await axios.get("https://api.coinmarketcap.com/v1/ticker/gas/");
    gas = gas.data[0].price_usd;
    const value = gasVal * gas;
    return value;
  } catch (error) {
    console.log(error);
  }
};

const getMarketPrice = async () => {
  try {
    let marketPrices = await axios.get(
      "https://min-api.cryptocompare.com/data/pricemulti?fsyms=NEO,GAS,RPX,DBC,QLC&tsyms=USD"
    );
    return marketPrices;
  } catch (error) {
    console.log(error);
  }
};

// TODO: this is being imported by Balance.js, maybe refactor to helper file/

const initiateGetBalance = (dispatch, net, address) => {
  syncTransactionHistory(dispatch, net, address);
  syncAvailableClaim(dispatch, net, address);
  syncBlockHeight(dispatch, net);
  return getBalance(net, address)
    .then(resultBalance => {
      return getMarketPriceUSD(resultBalance.Neo)
        .then(async resultPrice => {
          if (resultPrice === undefined || resultPrice === null) {
            dispatch(setBalance(resultBalance.Neo, resultBalance.Gas, "--"));
          } else {
            let gasPrice = await getGasPrice(resultBalance.Gas);
            let marketPrices = await getMarketPrice();
            let combinedPrice = gasPrice + resultPrice;
            dispatch(
              setBalance(
                resultBalance.Neo,
                resultBalance.Gas,
                resultPrice,
                combinedPrice,
                gasPrice,
                marketPrices.data.NEO.USD,
                marketPrices.data.GAS.USD,
                marketPrices.data.RPX.USD,
                marketPrices.data.DBC.USD,
                marketPrices.data.QLC.USD
              )
            );
          }
          return true;
        })
        .catch(e => {
          dispatch(setBalance(resultBalance.Neo, resultBalance.Gas, "--"));
        });
    })
    .catch(result => {
      // If API dies, still display balance
    });
};

const syncAvailableClaim = (dispatch, net, address) => {
  getClaimAmounts(net, address).then(result => {
    //claimAmount / 100000000
    dispatch(setClaim(result.available, result.unavailable));
  });
};

const syncBlockHeight = (dispatch, net) => {
  getWalletDBHeight(net).then(blockHeight => {
    dispatch(setBlockHeight(blockHeight));
  });
};

const syncTransactionHistory = (dispatch, net, address) => {
  getTransactionHistory(net, address).then(transactions => {
    let txs = [];
    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].neo_sent === true) {
        txs = txs.concat([
          {
            type: "NEO",
            amount: transactions[i].NEO,
            txid: transactions[i].txid,
            block_index: transactions[i].block_index
          }
        ]);
      }
      if (transactions[i].gas_sent === true) {
        txs = txs.concat([
          {
            type: "GAS",
            amount: transactions[i].GAS,
            txid: transactions[i].txid,
            block_index: transactions[i].block_index
          }
        ]);
      }
    }
    dispatch(setTransactionHistory(txs));
  });
};

const resetBalanceSync = (dispatch, net, address) => {
  if (intervals.balance !== undefined) {
    clearInterval(intervals.balance);
  }
  intervals.balance = setInterval(() => {
    initiateGetBalance(dispatch, net, address);
  }, 30000);
};

const toggleNet = (dispatch, net, address) => {
  let newNet;
  if (net === "MainNet") {
    newNet = "TestNet";
  } else {
    newNet = "MainNet";
  }
  dispatch(setNetwork(newNet));
  resetBalanceSync(dispatch, newNet, address);
  if (address !== null) {
    initiateGetBalance(dispatch, newNet, address);
  }
};

class NetworkSwitch extends Component {
  componentDidMount = () => {
    resetBalanceSync(this.props.dispatch, this.props.net, this.props.address);
  };
  render = () => (
    <div
      id="network"
      onClick={() =>
        toggleNet(this.props.dispatch, this.props.net, this.props.address)
      }
    >
      <div className="dash-icon-bar">
        <div className="icon-border">
          <span className="glyphicon glyphicon-exclamation-sign" />
        </div>
        <span className="transparent">Running on </span>
        <span className="netName">{this.props.net}</span>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  net: state.metadata.network,
  address: state.account.address
});

NetworkSwitch = connect(mapStateToProps)(NetworkSwitch);

export {
  NetworkSwitch,
  initiateGetBalance,
  syncTransactionHistory,
  intervals,
  resetBalanceSync
};
