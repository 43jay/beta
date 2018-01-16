import React from "react";
import { Route, Router, IndexRoute, browserHistory } from "react-router";
import App from "./components/App";
import LoginNep2 from "./components/LoginNep2";
import LoginPrivateKey from "./components/LoginPrivateKey";
import Settings from "./components/Settings";
import Exchange from "./components/Exchange";
import ExchangeAddress from "./components/ExchangeAddress";
import LoginLocalStorage from "./components/LoginLocalStorage";
import LoginLedgerNanoS from "./components/LoginLedgerNanoS";
import TransactionLedger from "./components/TransactionLedger";
import TransactionHistory from "./components/TransactionHistory";
import DisplayWalletKeys from "./components/DisplayWalletKeys";
import CreateWallet from "./components/CreateWallet";
import EncryptKey from "./components/EncryptKey";
import Send from "./components/Send";
import Dashboard from "./containers/Dashboard";
import Receive from "./components/Receive";
import Support from "./components/Support";
import Ledger from "./components/Ledger";
import Tokens from "./components/Tokens";
import Sale from "./components/Sale";
import SendRPX from "./components/SendRPX";
import SendDBC from "./components/SendDBC";
import SendQLC from "./components/SendQLC";
import SendHP from "./components/SendHP";

export default (
  <Route path="/" component={App}>
    <Route path="/dashboard" component={Dashboard}>
      <Route path="/send" component={Send} />
      <Route path="/sendRPX" component={SendRPX} />
      <Route path="/sendDBC" component={SendDBC} />
      <Route path="/sendQLC" component={SendQLC} />
      <Route path="/sendHP" component={SendHP} />
      <Route path="/receive" component={Receive} />
      <Route path="/settings" component={Settings} />
      <Route path="/exchange" component={Exchange} />
      <Route path="/exchangeAddress" component={ExchangeAddress} />
      <Route path="/ledger" component={Ledger} />
      <Route path="/transactionHistory" component={TransactionHistory} />
      <Route path="/support" component={Support} />
      <Route path="/tokens" component={Tokens} />
      <Route path="/sale" component={Sale} />
    </Route>
    <Route path="/create" component={CreateWallet} />
    <Route path="/encryptKey" component={EncryptKey} />
    <Route path="/DisplayWalletKeys" component={DisplayWalletKeys} />
    <Route path="/LoginNep2" component={LoginNep2} />
    <IndexRoute component={LoginLocalStorage} />
    <Route path="/LoginPrivateKey" component={LoginPrivateKey} />
    <Route path="/LoginLedgerNanoS" component={LoginLedgerNanoS} />
    <Route path="/TransactionLedger" component={TransactionLedger} />
    <Route path="/LoginEncrypted" component={LoginNep2} />
    {/* <Route path="/settings" component={Settings} /> */}
    <Route path="/settingsw" component={Settings} />
  </Route>
);
