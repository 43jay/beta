import React, { Component } from "react";
import { connect } from "react-redux";
import ReactTooltip from "react-tooltip";
import { Line } from "react-chartjs-2";
import axios from "axios";
import _ from "lodash";
import moment from "moment";
import neoLogo from "../images/neo.png";
import { Link } from "react-router";
import Assets from "./Assets";

// CryptoCompare API for ChartJS
const api = val => {
  return `https://min-api.cryptocompare.com/data/histohour?fsym=${
    val
  }&tsym=USD&limit=72&aggregate=3&e=CCCAGG`;
};

class Charts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      neoData: [],
      gasData: [],
      btcData: [],
      dashData: [],
      ltcData: [],
      ethData: [],
      rpxData: [],
      open: "--",
      high: "--",
      low: "--"
    };
  }

  async componentDidMount() {
    await this.getGasData();
    await this.getNeoData();
    await this.getBtcData();
    await this.getLtcData();
    await this.getDashData();
    await this.getEthData();
    await this.getRpxData();
  }

  async getGasData() {
    try {
      let req = await axios.get(api("GAS"));
      let data = req.data.Data;
      this.setState({ gasData: data });
    } catch (error) {
      console.log(error);
    }
  }
// NEO
  async getNeoData() {
    try {
      let req = await axios.get(api("NEO"));
      let data = req.data.Data;
      this.setState({ neoData: data });
      this.setState({ ...data[95] });
    } catch (error) {
      console.log(error);
    }
  }
// BTC
  async getBtcData() {
    try {
      let req = await axios.get(api("BTC"));
      let data = req.data.Data;
      this.setState({ btcData: data });
    } catch (error) {
      console.log(error);
    }
  }
// LTC
  async getLtcData() {
    try {
      let req = await axios.get(api("LTC"));
      let data = req.data.Data;
      this.setState({ ltcData: data });
    } catch (error) {
      console.log(error);
    }
  }
// ETH
  async getEthData() {
    try {
      let req = await axios.get(api("ETH"));
      let data = req.data.Data;
      this.setState({ ethData: data });
    } catch (error) {
      console.log(error);
    }
  }
// DASH
  async getDashData() {
    try {
      let req = await axios.get(api("DASH"));
      let data = req.data.Data;
      this.setState({ dashData: data });
    } catch (error) {
      console.log(error);
    }
  }
// RPX
  async getRpxData() {
    try {
      let req = await axios.get(api("RPX"));
      let data = req.data.Data;
      this.setState({ rpxData: data });
    } catch (error) {
      console.log(error);
    }
  }
// Chart Data
  render() {
    const neoPrices = _.map(this.state.neoData, "close");
    const neoHours = _.map(this.state.neoData, "time");

    const convertedTime = neoHours.map(val => moment.unix(val).format("LLL"));

    const ltcPrices = _.map(this.state.ltcData, "close");
    const btcPrices = _.map(this.state.btcData, "close");
    const dashPrices = _.map(this.state.dashData, "close");
    const ethPrices = _.map(this.state.ethData, "close");
    const rpxPrices = _.map(this.state.rpxData, "close");
    const gasPrices = _.map(this.state.gasData, "close");
// Chart Styling
    const data = canvas => {
      let ctx = canvas.getContext("2d");
      let gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
      gradientStroke.addColorStop(0, "#7ED321");
      gradientStroke.addColorStop(1, "#7ED321");

      let gradientFill = ctx.createLinearGradient(0, 0, 0, 260);
      gradientFill.addColorStop(0, "rgba(68,147,33,0.8)");
      gradientFill.addColorStop(1, "rgba(68,147,33,0)");
      const gradient = ctx.createLinearGradient(0, 0, 100, 0);

      let gasGradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
      gasGradientStroke.addColorStop(0, "#9013FE");
      gasGradientStroke.addColorStop(1, "#9013FE");

      let gasGradientFill = ctx.createLinearGradient(0, 0, 0, 260);
      gasGradientFill.addColorStop(0, "rgba(144,147,254, 1)");
      gasGradientFill.addColorStop(1, "rgba(144,147,254, 0)");

      let ltcGradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
      ltcGradientStroke.addColorStop(0, "#ececec");
      ltcGradientStroke.addColorStop(1, "#ececec");

      let ltcGradientFill = ctx.createLinearGradient(0, 0, 0, 260);
      ltcGradientFill.addColorStop(0, "rgba(255,255,255, 0.5)");
      ltcGradientFill.addColorStop(1, "rgba(255,255,255, 0)");

      let btcGradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
      btcGradientStroke.addColorStop(0, "#ffc000");
      btcGradientStroke.addColorStop(1, "#ffc000");

      let btcGradientFill = ctx.createLinearGradient(0, 0, 0, 260);
      btcGradientFill.addColorStop(0, "rgba(229,172,0, 0.5)");
      btcGradientFill.addColorStop(1, "rgba(229,172,0, 0)");

      let ethGradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
      ethGradientStroke.addColorStop(0, "#646464");
      ethGradientStroke.addColorStop(1, "#646464");

      let ethGradientFill = ctx.createLinearGradient(0, 0, 0, 260);
      ethGradientFill.addColorStop(0, "rgba(175,175,175, 0.5)");
      ethGradientFill.addColorStop(1, "rgba(175,175,175, 0)");

      let rpxGradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
      rpxGradientStroke.addColorStop(0, "#C60307");
      rpxGradientStroke.addColorStop(1, "#C60307");

      let rpxGradientFill = ctx.createLinearGradient(0, 0, 0, 260);
      rpxGradientFill.addColorStop(0, "rgba(169,3,41, 0.5)");
      rpxGradientFill.addColorStop(1, "rgba(169,3,41, 0)");

      let dashGradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
      dashGradientStroke.addColorStop(0, "#005aff");
      dashGradientStroke.addColorStop(1, "#005aff");

      let dashGradientFill = ctx.createLinearGradient(0, 0, 0, 260);
      dashGradientFill.addColorStop(0, "rgba(0,90,255, 0.5)");
      dashGradientFill.addColorStop(1, "rgba(0,90,255, 0)");
// Chart Content
      return {
        labels: convertedTime,
        datasets: [
          {
            label: "GAS",
            fill: true,
            lineTension: 0.25,
            backgroundColor: gasGradientFill,
            borderColor: gasGradientStroke,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderWidth: 1,
            pointHoverRadius: 3,
            pointHoverBorderWidth: 0,
            pointBorderColor: gasGradientStroke,
            pointBackgroundColor: gasGradientStroke,
            pointHoverBackgroundColor: gasGradientStroke,
            pointHoverBorderColor: gasGradientStroke,
            pointHitRadius: 3,
            pointRadius: 0,
            data: gasPrices
          },
          {
            label: "NEO",
            fill: true,
            lineTension: 0.25,
            backgroundColor: gradientFill,
            borderColor: gradientStroke,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderWidth: 1,
            pointHoverRadius: 3,
            pointHoverBorderWidth: 0,
            pointBorderColor: gradientStroke,
            pointBackgroundColor: gradientStroke,
            pointHoverBackgroundColor: gradientStroke,
            pointHoverBorderColor: gradientStroke,
            pointHitRadius: 3,
            pointRadius: 0,
            data: neoPrices
          },
          {
            label: "BTC",
            fill: true,
            hidden: true,
            lineTension: 0.25,
            backgroundColor: btcGradientFill,
            borderColor: btcGradientStroke,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderWidth: 1,
            pointHoverRadius: 3,
            pointHoverBorderWidth: 0,
            pointBorderColor: btcGradientStroke,
            pointBackgroundColor: btcGradientStroke,
            pointHoverBackgroundColor: btcGradientStroke,
            pointHoverBorderColor: btcGradientStroke,
            pointHitRadius: 3,
            pointRadius: 0,
            data: btcPrices
          },
          {
            label: "DASH",
            fill: true,
            hidden: true,
            lineTension: 0.25,
            backgroundColor: dashGradientFill,
            borderColor: dashGradientStroke,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderWidth: 1,
            pointHoverRadius: 3,
            pointHoverBorderWidth: 0,
            pointBorderColor: dashGradientStroke,
            pointBackgroundColor: dashGradientStroke,
            pointHoverBackgroundColor: dashGradientStroke,
            pointHoverBorderColor: dashGradientStroke,
            pointHitRadius: 3,
            pointRadius: 0,
            data: dashPrices
          },
          {
            label: "ETH",
            fill: true,
            hidden: true,
            lineTension: 0.25,
            backgroundColor: ethGradientFill,
            borderColor: ethGradientStroke,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderWidth: 1,
            pointHoverRadius: 3,
            pointHoverBorderWidth: 0,
            pointBorderColor: ethGradientStroke,
            pointBackgroundColor: ethGradientStroke,
            pointHoverBackgroundColor: ethGradientStroke,
            pointHoverBorderColor: ethGradientStroke,
            pointHitRadius: 3,
            pointRadius: 0,
            data: ethPrices
          },
          {
            label: "LTC",
            fill: true,
            hidden: true,
            lineTension: 0.25,
            backgroundColor: ltcGradientFill,
            borderColor: ltcGradientStroke,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderWidth: 1,
            pointHoverRadius: 3,
            pointHoverBorderWidth: 0,
            pointBorderColor: ltcGradientStroke,
            pointBackgroundColor: ltcGradientStroke,
            pointHoverBackgroundColor: ltcGradientStroke,
            pointHoverBorderColor: ltcGradientStroke,
            pointHitRadius: 3,
            pointRadius: 0,
            data: ltcPrices
          },
          {
            label: "RPX",
            fill: true,
            hidden: true,
            lineTension: 0.25,
            backgroundColor: rpxGradientFill,
            borderColor: rpxGradientStroke,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderWidth: 1,
            pointHoverRadius: 3,
            pointHoverBorderWidth: 0,
            pointBorderColor: rpxGradientStroke,
            pointBackgroundColor: rpxGradientStroke,
            pointHoverBackgroundColor: rpxGradientStroke,
            pointHoverBorderColor: rpxGradientStroke,
            pointHitRadius: 3,
            pointRadius: 0,
            data: rpxPrices
          }
        ]
      };
    };
    return (
      <div>
        <div className="dash-chart-panel">
          <div className="row">
            <div className="col-xs-12">
              <Line
                data={data}
                width={600}
                height={380}
                options={{
                  maintainAspectRatio: true,
                  layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
                  scales: {
                    xAxes: [
                      {
                        type: "time",
                        position: "bottom",
                        id: "x-axis-0",
                        categoryPercentage: 1,
                        barPercentage: 1,
                        gridLines: { color: "rgba(255, 255, 255, 0.04)" }
                      }
                    ],
                    yAxes: [
                      {
                        gridLines: { color: "rgba(255, 255, 255, 0.04)" }
                      }
                    ]
                  },
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 15,
                      padding: 20
                    }
                  }
                }}
              />
            </div>

          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  neo: state.wallet.Neo,
  gas: state.wallet.Gas,
  address: state.account.address,
  net: state.metadata.network,
  price: state.wallet.price
});

Charts = connect(mapStateToProps)(Charts);

export default Charts;
