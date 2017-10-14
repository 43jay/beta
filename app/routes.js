import React from "react";
import { Route, Router, IndexRoute, browserHistory } from "react-router";
import App from "./components/App";
import LoginNep2 from "./components/LoginNep2";
import LoginPrivateKey from "./components/LoginPrivateKey";
import Home from "./components/Home";
import Settings from "./components/Settings";
import LoginLocalStorage from "./components/LoginLocalStorage";
import CreateWallet from "./components/CreateWallet";
import EncryptKey from "./components/EncryptKey";
import Send from "./components/Send";
import Dashboard from "./containers/Dashboard";
import Receive from "./components/Receive";

export default (
  <Route path="/" component={App}>
    <Route component={Home} />
    <Route path="/dashboard" component={Dashboard}>
      <Route path="/send" component={Send} />
      <Route path="/receive" component={Receive} />
      <Route path="/settings" component={Settings} />
    </Route>
    <Route path="/create" component={CreateWallet} />
    <Route path="/encryptKey" component={EncryptKey} />
    <IndexRoute component={LoginPrivateKey} />
    <Route path="/loginLocalStorage" component={LoginLocalStorage} />
    <Route path="/LoginEncrypted" component={LoginNep2} />
    {/* <Route path="/settings" component={Settings} /> */}
    <Route path="/settingsw" component={Settings} />
  </Route>
);
