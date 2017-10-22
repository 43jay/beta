import React, { Component } from "react";
import { Link } from "react-router";
import QRCode from "qrcode";
import { clipboard } from "electron";
import Copy from "react-icons/lib/md/content-copy";
import ReactTooltip from "react-tooltip";
import storage from "electron-json-storage";
import { resetKey } from "../modules/generateWallet";
import { connect } from "react-redux";
import { sendEvent, clearTransactionEvent } from "../modules/transactions";
import { login } from "../modules/account";
import { getWIFFromPrivateKey } from "neon-js";
import { encrypt_wif, decrypt_wif } from "neon-js";
import { getAccountsFromWIFKey } from "neon-js";
import Logo from "./Brand/LogoBlank";
import NeoLogo from "./Brand/Neo";

let key_name;
let wif;

const saveKey = async (dispatch, encWifValue, history) => {
  await storage.get("keys", async (error, data) => {
    data[key_name.value] = encWifValue;
    dispatch(sendEvent(true, "Saved key as " + key_name.value));
    await storage.set("keys", data);
    await setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    setTimeout(() => history.push("/loginLocalStorage"), 5000);
  });
};

const resetGeneratedKey = dispatch => {
  dispatch(resetKey());
};

class DisplayWalletKeys extends Component {
  componentDidMount = () => {
    console.log(this.props.history);
    QRCode.toCanvas(
      this.publicCanvas,
      this.props.address,
      { version: 5 },
      err => {
        if (err) console.log(err);
      }
    );
    QRCode.toCanvas(
      this.privateCanvas,
      this.props.passphraseKey,
      { version: 5 },
      err => {
        if (err) console.log(err);
      }
    );
  };

  render = () => (
    <div className="displayWalletKeys">
    <div className="row send-neo-wide">
    <div className="center neoLogo up-20">
      <NeoLogo width={115} />
    </div>
          <div className="row">
            <div className="col-xs-12">
              <div className="row">
                <div className="col-xs-3">
                <canvas
                  id="publicCanvas"
                  style={{
                    border: "10px solid #D3D3D3",
                    borderRadius: 30
                  }}
                  ref={node => (this.publicCanvas = node)}
                />
                <p style={{ textAlign: "center" }}>
                  Public QR Address
                </p>
                </div>

                <div className="col-xs-6 top-20">
                <div className="keyList">
                  {/* public address */}
                  <div className="keyListItem">
                    <p className="key-label">
                      Your Public NEO Address:
                    </p>
                    <input
                      type="text"
                      onClick={() =>
                        clipboard.writeText(this.props.address)}
                      className="form-control pubicAddress"
                      contentEditable={false}
                      readOnly={true}
                      value={this.props.address}
                      data-tip
                      data-for="copyPublicKeyTip"
                    />
                  </div>
                  {/* public address */}
                  {/* secrect phrase */}
                  <div className="keyListItem">
                    <p className="key-label">Your Password:</p>
                    <input
                      type="text"
                      onClick={() =>
                        clipboard.writeText(this.props.passphrase)}
                      className="form-control"
                      contentEditable={false}
                      readOnly={true}
                      value={this.props.passphrase}
                      data-tip
                      data-for="copyPassphraseTip"
                      onClick={() =>
                        clipboard.writeText(this.props.passphrase)}
                    />
                  </div>
                  {/* secrect phrase */}
                </div>

                <ReactTooltip
                  className="solidTip"
                  id="copyPublicKeyTip"
                  place="bottom"
                  type="dark"
                  effect="solid"
                >
                  <span>Copy Public Key</span>
                </ReactTooltip>
                <ReactTooltip
                  className="solidTip"
                  id="copyPrivateKeyTip"
                  place="bottom"
                  type="dark"
                  effect="solid"
                >
                  <span>Copy Private Key</span>
                </ReactTooltip>
                <ReactTooltip
                  className="solidTip"
                  id="copyPassphraseTip"
                  place="bottom"
                  type="dark"
                  effect="solid"
                >
                  <span>Copy Password</span>
                </ReactTooltip>
                <ReactTooltip
                  className="solidTip"
                  id="copyPassphraseKeyTip"
                  place="bottom"
                  type="dark"
                  effect="solid"
                >
                  <span>Copy Password Encrypted Key</span>
                </ReactTooltip>
                </div>

                      <div className="col-xs-3">
                        <div className="addressBox">
                          <canvas
                            id="privateCanvas"
                            height={160}
                            width={160}
                            style={{
                              border: "10px solid #D3D3D3",
                              borderRadius: 30,
                              height: "160px !important",
                              width: "160px !important"
                            }}
                            ref={node => (this.privateCanvas = node)}
                          />

                          <p style={{ textAlign: "center" }}>
                            Encrypted Private Key
                          </p>
                        </div>
                </div>
              </div>
            </div>

            <div className="private">
              <div className="keyList">

              {/* Your Encrypted Private Key*/}
              <div className="col-xs-6">
                <p className="key-label">Your Private Key:</p>
                <input
                  type="text"
                  onClick={() => clipboard.writeText(this.props.wif)}
                  className="form-control"
                  contentEditable={false}
                  readOnly={true}
                  value={this.props.wif}
                  data-tip
                  data-for="copyPrivateKeyTip"
                />
              </div>

                {/* Your Encrypted Private Key*/}
                <div className="col-xs-6">
                  <p className="key-label">Your Encrypted Private Key:</p>
                  <input
                    type="text"
                    onClick={() => clipboard.writeText(this.props.address)}
                    className="form-control"
                    contentEditable={false}
                    readOnly={true}
                    value={this.props.passphraseKey}
                    data-tip
                    data-for="copyPassphraseKeyTip"
                  />
                </div>
                  <div className="col-xs-9 top-20">
                    <input
                      type="text"
                      className="form-control saveKey"
                      ref={node => (key_name = node)}
                      placeholder="Name your saved wallet"
                      data-tip
                    />
                  </div>
                  <div className="col-xs-3 top-20">
                    <button
                      onClick={() =>
                        saveKey(
                          this.props.dispatch,
                          this.props.passphraseKey,
                          this.props.history
                        )}
                      className="btn-send"
                    >
                      Save Wallet
                    </button>

                    {this.props.decrypting === true ? (
                      <div className="decrypting">Decrypting keys...</div>
                    ) : (
                      <div />
                    )}
                  </div>
                  <div className="col-xs-8">
                  <label className="checkbox-inline" style={{ color: "white" }}>
                    I have backed up my private data
                  </label>
                  <input
                    id="checkbox"
                    name="isChecked"
                    type="checkbox"
                    className="pull-left"
                  />
                  </div>
              </div>
            </div>
          </div>
    </div>

    <div className="dash-bar">

    <div className="dash-icon-bar" onClick={() => print()} >
      <div className="icon-border">
        <span className="glyphicon glyphicon-print"></span>
      </div>
      Print Wallet Data
    </div>

    <div className="dash-icon-bar">
      <div className="icon-border">
        <span className="glyphicon glyphicon-download-alt"></span>
      </div>
      Download Recovery File
    </div>

    <Link to="/">
    <div className="dash-icon-bar">
      <div className="icon-border">
        <span className="glyphicon glyphicon-qrcode"></span>
      </div>
      Login Via Private Key
    </div>
    </Link>

    <Link to="/">
    <div className="dash-icon-bar">
      <div className="icon-border">
        <span className="glyphicon glyphicon-lock"></span>
      </div>
      Login Via Encrypted Key
    </div>
    </Link>

    </div>
    </div>
  );
}
const mapStateToProps = state => ({});

DisplayWalletKeys = connect(mapStateToProps)(DisplayWalletKeys);

export default DisplayWalletKeys;
