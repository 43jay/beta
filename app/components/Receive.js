import React, { Component } from "react";
import { connect } from "react-redux";
import QRCode from "qrcode.react";
import { clipboard } from "electron";
import { shell } from "electron";
import neoLogo from "../img/neo.png";
import copyIcon from "../images/copy-icon.png";
import printIcon from "../images/print-icon.png";
import emailIcon from "../images/email-icon.png";
import linkIcon from "../images/link-icon.png";
import TopBar from "./TopBar";
import Assets from "./Assets";
import ReactTooltip from "react-tooltip";

const getLink = (net, address) => {
  let base;
  if (net === "MainNet") {
    base = "https://neotracker.io/address/";
  } else {
    base = "https://testnet.neotracker.io/address/";
  }
  return base + address;
};

const openExplorer = srcLink => {
  shell.openExternal(srcLink);
};

class Receive extends Component {
  render() {
    console.log(this.props.net);
    return (
      <div id="send" className="">
        <TopBar />
        <div className="dash-chart-panel">
        <div className="row">
        <div className="col-xs-12">
        <img
          src={neoLogo}
          alt=""
          width="38"
          className="neo-logo logobounce"
        />
        <h3 className="rec-h3">
          Receive NEO/GAS and other NEP tokens</h3>
        </div>
        <hr className="dash-hr-wide" />
        <div className="clearboth" />
          <div className="col-xs-4 top-20">
          <div
            className="addressBox-send center animated fadeInDown pointer"
            data-tip
            data-for="qraddTip"
            onClick={() => clipboard.writeText(this.props.address)}
          >
            <QRCode size={140} value={this.props.address} />
            <ReactTooltip
              className="solidTip"
              id="qraddTip"
              place="top"
              type="light"
              effect="solid"
            >
              <span>Click to copy your NEO Address</span>
            </ReactTooltip>
          </div>
          </div>

          <div className="col-xs-8">
          <h5>Your Public Address</h5>
          <input
            className="ledger-address top-10"
            onClick={() => clipboard.writeText(this.props.address)}
            id="center"
            placeholder={this.props.address}
            value={this.props.address}
          />

            <div className="dash-bar top-30">
              <div
                className="dash-icon-bar animated "
                onClick={() => clipboard.writeText(this.props.address)}
              >
                <div className="icon-border">
                  <span className="glyphicon glyphicon-duplicate" />
                </div>
                Copy Public Address
              </div>

              <div
                className="dash-icon-bar animated "
                onClick={() => print()}
              >
                <div className="icon-border">
                  <span className="glyphicon glyphicon-print" />
                </div>
                Print Public Address
              </div>

              <div
                className="dash-icon-bar animated "
                onClick={() =>
                  openExplorer(getLink(this.props.net, this.props.address))
                }
              >
                <div className="icon-border">
                  <span className="glyphicon glyphicon-link" />
                </div>
                View On Blockchain
              </div>

              <div
                className="dash-icon-bar animated "
              >
                <div className="icon-border">
                  <span className="glyphicon glyphicon-save" />
                </div>
                Download Encrypted Key
              </div>


            </div>



          </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  blockHeight: state.metadata.blockHeight,
  net: state.metadata.network,
  address: state.account.address,
  neo: state.wallet.Neo,
  price: state.wallet.price,
  gas: state.wallet.Gas
});

Receive = connect(mapStateToProps)(Receive);
export default Receive;
