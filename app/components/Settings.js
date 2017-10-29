import React, { Component } from "react";
import { Link } from "react-router";
import { connect } from "react-redux";
import { setBlockExplorer } from "../modules/metadata";
import { setKeys } from "../modules/account";
import Delete from "react-icons/lib/md/delete";
import _ from "lodash";
import fs from "fs";
import storage from "electron-json-storage";
import Logo from "./Brand/LogoBlank";
import NeoLogo from "./Brand/Neo";
import Claim from "./Claim";
import { NetworkSwitch } from "../components/NetworkSwitch";
import { clipboard } from "electron";
import Copy from "react-icons/lib/md/content-copy";
import ReactTooltip from "react-tooltip";

let explorer_select;

const { dialog } = require("electron").remote;
const saveKeyRecovery = keys => {
  const content = JSON.stringify(keys);
  dialog.showSaveDialog(
    {
      filters: [
        {
          name: "JSON",
          extensions: ["json"]
        }
      ]
    },
    fileName => {
      if (fileName === undefined) {
        console.log("File failed to save...");
        return;
      }
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, content, err => {
        if (err) {
          alert("An error ocurred creating the file " + err.message);
        }
        alert("The file has been succesfully saved");
      });
    }
  );
};

const loadKeyRecovery = dispatch => {
  dialog.showOpenDialog(fileNames => {
    // fileNames is an array that contains all the selected
    if (fileNames === undefined) {
      console.log("No file selected");
      return;
    }
    const filepath = fileNames[0];
    fs.readFile(filepath, "utf-8", (err, data) => {
      if (err) {
        alert("An error ocurred reading the file :" + err.message);
        return;
      }
      const keys = JSON.parse(data);
      storage.get("keys", (error, data) => {
        _.each(keys, (value, key) => {
          data[key] = value;
        });
        dispatch(setKeys(data));
        storage.set("keys", data);
      });
      // dispatch(setKeys(keys));
      // storage.set('keys', keys);
    });
  });
};

const saveSettings = settings => {
  storage.set("settings", settings);
};

const loadSettings = dispatch => {
  storage.get("settings", (error, settings) => {
    if (
      settings.blockExplorer !== null &&
      settings.blockExplorer !== undefined
    ) {
      dispatch(setBlockExplorer(settings.blockExplorer));
    }
  });
};

const updateSettings = dispatch => {
  saveSettings({ blockExplorer: explorer_select.value });
  dispatch(setBlockExplorer(explorer_select.value));
};

const deleteWallet = (dispatch, key) => {
  storage.get("keys", (error, data) => {
    delete data[key];
    storage.set("keys", data);
    dispatch(setKeys(data));
  });
};

class Settings extends Component {
  componentDidMount = () => {
    storage.get("keys", (error, data) => {
      this.props.dispatch(setKeys(data));
    });
    loadSettings(this.props.dispatch);
  };

  render = () => (
    <div id="send">
    <div className="row">
      <div className="header">
        <div className="col-xs-4">
          <p className="neo-balance">Available Neo</p>
          <p className="neo-text">
            {this.props.neo} <span>NEO</span>{" "}
          </p>
        </div>
        <div className="col-xs-4">{<Claim />}</div>
        <div className="col-xs-4">
          <p className="neo-balance">Available GAS</p>
          <p className="gas-text">
            {Math.floor(this.props.gas * 1000000) / 1000000}{" "}
            <span>GAS</span>
          </p>
        </div>
      </div>
    </div>
    <div className="settings-panel">
    <div className="description">
      <h2 className="center">Manage your Morpheus Settings</h2>
      <div className="row top-20">
      <div className="col-xs-2 col-xs-offset-1 center">
      <div className="dash-icon-bar">
      <div className="icon-border">
        <span className="glyphicon glyphicon-lock" />
      </div>
      Enable Two Factor Authorization
      </div>
      </div>
      <div className="col-xs-2 center">
      <div className="dash-icon-bar">
      <div className="icon-border">
        <span className="glyphicon glyphicon-check" />
      </div>
      Edit Authorized Addresses
      </div>
      </div>
      <div className="col-xs-2 center">
      <NetworkSwitch />
      </div>
  <div className="col-xs-2 center">
  <Link to="/create"><div className="dash-icon-bar">
  <div className="icon-border">
    <span className="glyphicon glyphicon-plus" />
  </div>
  Create New Address
  </div></Link>
</div>
<div className="col-xs-2 center">
<Link to="/LoginLocalStorage">
<div className="dash-icon-bar">
  <div className="icon-border">
    <span className="glyphicon glyphicon-user" />
  </div>
  Open a Saved Wallet
</div>
</Link>
</div>
    </div>
    </div>
    <div className="clearboth"></div>
      <div className="row top-50">
      <div className="col-xs-8 col-xs-offset-2">
      <div className="settingsForm row">
        <div className="settingsItem">
          <select
            name="select-profession"
            id="select-profession grey-bk"
            className="trans-form sett-form"
          >
            <option selected="selected" disabled="disabled">
              Select a saved Morpheus wallet to edit
            </option>
            {_.map(this.props.wallets, (value, key) => (
              <option value={value}>{key.slice(0, 20)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
    <div className="col-xs-3">
    </div>
    </div>
    <div className="row top-20">
    <div className="col-xs-2 col-xs-offset-1 center">
    <div className="dash-icon-bar" onClick={() => print()} >
      <div className="icon-border">
        <span className="glyphicon glyphicon-print" />
      </div>
      Print Paper Wallet
    </div>
    </div>
    <div className="col-xs-2 center">
    <Link to="/encryptKey"><div className="dash-icon-bar">
    <div className="icon-border">
      <span className="glyphicon glyphicon-qrcode" />
    </div>
    Encrypt a Private Key
    </div></Link>
  </div>
    <div className="col-xs-2 center">
    <div className="dash-icon-bar" onClick={() => saveKeyRecovery(this.props.wallets)} >
      <div className="icon-border">
        <span className="glyphicon glyphicon-arrow-down" />
      </div>
      Export Encrypted Keys
    </div>
    </div>
    <div className="col-xs-2 center">
    <div className="dash-icon-bar">
      <div className="icon-border">
        <span className="glyphicon glyphicon-link" />
      </div>
      View On Blockchain
    </div>
    </div>
    <div className="col-xs-2 center">
    <div className="dash-icon-bar" onClick={() => deleteWallet(this.props.dispatch, key)} >
      <div className="icon-border">
        <span className="glyphicon glyphicon-trash" />
      </div>
      Delete Seleted Wallet
    </div>
    </div>
    </div>
    <div className="clearboth"></div>
    </div>
<div className="clearboth"></div>
    </div>
  );
}

const mapStateToProps = state => ({
  explorer: state.metadata.blockExplorer,
  wallets: state.account.accountKeys,
  blockHeight: state.metadata.blockHeight,
  address: state.account.address,
  net: state.metadata.network,
  neo: state.wallet.Neo,
  gas: state.wallet.Gas,
  transactions: state.wallet.transactions
});

Settings = connect(mapStateToProps)(Settings);

export default Settings;
