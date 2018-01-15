import React, { Component } from "react";

import { ROUTES, FINDING_LEDGER_NOTICE } from "../../core/constants";
import commNode from "../../modules/ledger/ledger-comm-node";
import { ledgerNanoSCreateSignatureAsync } from "../../modules/ledger/ledgerNanoS";
import asyncWrap from "../../core/asyncHelper";
import { BIP44_PATH } from "../../core/constants";
import { error } from "util";

export default class LoginLedgerNanoS extends Component {
  state = {
    intervalId: null
  };

  ledgerNanoSGetInfoAsync = async () => {
    const {
      hardwareDeviceInfo,
      isHardwareLogin,
      hardwarePublicKeyInfo,
      hardwarePublicKey
    } = this.props;
    console.log("yooooooooo");
    this.props.dispatch(hardwareDeviceInfo(FINDING_LEDGER_NOTICE));
    let [err, result] = await asyncWrap(commNode.list_async());
    console.log(err);
    if (result.length === 0) {
      console.log(`USB Failure: No device found. ${FINDING_LEDGER_NOTICE}`);
    } else {
      let [err, comm] = await asyncWrap(commNode.create_async());
      console.log(err);

      const deviceInfo = comm.device.getDeviceInfo();
      comm.device.close();
      this.props.dispatch(
        hardwareDeviceInfo(
          `Found USB ${deviceInfo.manufacturer} ${deviceInfo.product}`
        )
      );
    }
    [err, result] = await asyncWrap(commNode.list_async());
    if (result.length === 0) {
      console.log("Hardware Device Error. Login to NEO App and try again");
    } else {
      let [err, comm] = await asyncWrap(commNode.create_async());
      if (err) {
        console.log(`Public Key Comm Init Error: ${err}`);
        console.log("Hardware Device Error. Login to NEO App and try again");
      }

      let message = Buffer.from(`8004000000${BIP44_PATH}`, "hex");
      const validStatus = [0x9000];
      let [error, response] = await asyncWrap(
        comm.exchange(message.toString("hex"), validStatus)
      );
      if (error) {
        comm.device.close(); // NOTE: do we need this close here - what about the other errors that do not have it at the moment
        if (error === "Invalid status 28160") {
          console.log(
            "NEO App does not appear to be open, request for private key returned error 28160"
          );
        } else {
          console.log(`Public Key Comm Messaging Error: ${error}`);
          console.log("Hardware Device Error. Login to NEO App and try again");
        }
      }
      comm.device.close();
      this.props.dispatch(isHardwareLogin(true));
      this.props.dispatch(hardwarePublicKey(response.substring(0, 130)));
      this.props.dispatch(
        hardwarePublicKeyInfo(
          "Success. NEO App Found on Hardware Device. Click Button Above to Login"
        )
      );
    }
  };

  async componentDidMount() {
    // console.log("yooooooooo");
    // console.log(this.props);
    console.log("started");
    console.log(this.props);
    await this.ledgerNanoSGetInfoAsync();

    console.log("end");

    // const intervalId = setInterval(async () => {
    //   await this.ledgerNanoSGetInfoAsync();
    // }, 1000);

    // this.setState({ intervalId });
  }

  shouldComponentUpdate(nextProps) {
    const { publicKey, hardwarePublicKeyInfo, hardwareDeviceInfo } = this.props;
    if (
      nextProps.publicKey !== publicKey ||
      nextProps.hardwarePublicKeyInfo !== hardwarePublicKeyInfo ||
      (nextProps.hardwareDeviceInfo === FINDING_LEDGER_NOTICE &&
        hardwareDeviceInfo === null)
    )
      return true;
    return false;
  }

  componentWillUnmount() {
    const { intervalId } = this.state;
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  onLedgerNanoSChange = () => {
    const { ledgerNanoSGetLogin, publicKey, history } = this.props;
    if (publicKey) {
      ledgerNanoSGetLogin();
      console.log(publicKey);
      // co
      // history.push(ROUTES.DASHBOARD);
    }
  };

  render() {
    const { hardwareDeviceInfo, hardwarePublicKeyInfo, publicKey } = this.props;

    console.log(publicKey);
    return (
      <div id="loginPage">
        <div>Login using the Ledger Nano S:</div>
        <div>
          <div>
            <button onClick={this.onLedgerNanoSChange}>
              Use Ledger Nano S
            </button>
          </div>
          <p style={{ color: "white", fontSize: 100 }}>{hardwareDeviceInfo}</p>
          <p>{hardwarePublicKeyInfo}</p>
        </div>
      </div>
    );
  }
}
