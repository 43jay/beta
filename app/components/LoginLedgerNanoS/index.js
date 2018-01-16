import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  ledgerNanoSGetLogin,
  getPublicKey,
  getHardwareDeviceInfo,
  hardwareDeviceInfo,
  getHardwarePublicKeyInfo,
  hardwarePublicKeyInfo,
  isHardwareLogin,
  hardwarePublicKey
} from "../../modules/accountLedger";

import LoginLedgerNanoS from "./LoginLedgerNanoS";

const mapStateToProps = state => ({
  hardwareDeviceInfo: getHardwareDeviceInfo(state),
  hardwarePublicKeyInfo: hardwarePublicKeyInfo,
  isHardwareLogin: isHardwareLogin,
  hardwarePublicKey: hardwarePublicKey,
  ledgerNanoSGetLogin: ledgerNanoSGetLogin
});

export default connect(mapStateToProps)(LoginLedgerNanoS);
