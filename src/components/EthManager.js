import React, {Component} from 'react';
import Chains from "./Chains/Chains";
import Explorers from "../utils/Explorers";
import WalletDApp from "./WalletDApp/WalletDApp";
import Web3 from "web3";
import WeiConverter from "../utils/WeiConverter";
import AddressFormater from "../utils/AddressFormater";
import TokenDAppErc20 from "./TokenDApp/TokenDAppERC20";

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

class EthManager extends Component {

    chains;

    constructor(props) {
        super(props);
        this.state = {
            w3Connected: false,
            chain: null,
            account: null,
            accounts: null,
            balance: null,
            errors: "",
        }
    }

    setAccount = (account, chainId, balance) => {
        const state = {...this.state};
        state.w3Connected = true;
        state.account = account;
        state.chain = Chains.getChain(chainId);
        state.balance = balance;
        this.setState(state);
    }

    getBalance = (account) => {
        return web3.eth.getBalance(account);
    }

    web3ProcessData = async (data) => {

        // Id de la Blockchain
        const chainId = await window.ethereum.request({method: 'eth_chainId'});
        // Lorsque la Blockchain change
        window.ethereum.on('chainChanged', () => {
            this.connectToWeb3();
        });

        // S'il y a des "data"
        if (data.length > 0) {
            this.getBalance(data[0]).then((balance) => {
                this.setAccount(data[0], chainId, balance);
            });
        }
    }

    connectToWeb3 = () => {
        if (window.ethereum) {
            window.ethereum.request({method: 'eth_requestAccounts'}).then((result) => {

                window.ethereum.on('accountsChanged', (accounts) => {
                    this.web3ProcessData(accounts);
                });

                this.web3ProcessData(result);

            }).catch((error) => {
                this.setErrors(error.message);
            });
        } else {
            const state = {...this.state};
            state.errors = "Install Metamask";
            this.setState(state);
        }
    }


    balanceToEth = () => {
        let result = 0;
        if (this.state.w3Connected) {
            result = WeiConverter.weiToEth(this.state.balance);
        }
        return result;
    }

    renderConnexionW3Button() {
        if (!this.state.w3Connected) {
            return (
                <button className={"btn btn-outline-primary m-1"} onClick={this.connectToWeb3}>
                    Connect to Web3
                </button>
            );
        }
    }

    renderAccount() {
        if (this.state.account) {
            return (
                <div className={"mt-3 p-4 text-center border-start border-end border-dark "}>
                    <h2 className={"mb-4"}>Account</h2>
                    <div className={"d-flex justify-content-center"}>
                        <div className={"d-inline rounded p-1 shadow"}>{AddressFormater.minimizer(this.state.account)}</div>
                        <div>
                            <Explorers account={this.state.account} chain={this.state.chain} shadow={"shadow"}/>
                        </div>
                    </div>
                </div>
            );
        }
    }

    renderBalance() {
        if (this.state.balance) {
            const balance = this.balanceToEth();
            return (
                <div style={{fontWeight: "bold"}}>
                    {balance} ETH
                </div>
            );
        }
    }

    renderChainInfo() {
        const name = Chains.getName(this.state.chain);
        if (name) {
            return (
                <div className={"d-block text-center bg-dark text-white border-top border-white p-1 mb-3"}>
                    <h1>{name}</h1>
                </div>
            );
        }
    }


    setErrors(errors) {
        const state = {...this.state}
        state.errors = errors;
        this.setState(state);
    }

    renderErrors() {
        if (this.state.errors && this.state.errors != "") {
            return (
                <div className={"alert alert-danger"}>
                    {this.state.errors}
                </div>
            );
        }
    }

    renderWalletDApp() {
        if (this.state.w3Connected) {
            return (
                <div className={"mb-5"}>
                    <WalletDApp account={this.state.account} balanceToEth={this.balanceToEth} chain={this.state.chain}/>
                </div>
            );
        }
    }

    renderTokenDAppERC10() {
        if (this.state.w3Connected) {
            return (
                <div className={"mb-5"}>
                    <TokenDAppErc20
                        account={this.state.account}
                        chain={this.state.chain}
                    />
                </div>
            );
        }
    }

    render() {

        return (
            <div className={"container-fluid m-0 p-0"}>

                {this.renderChainInfo()}

                <div className={"container-fluid"}>
                    <div className={"row"}>

                        <div className={"col-12 col-xl-2"}>
                            {this.renderAccount()}
                        </div>

                        <div className={"col-12 col-xl-4"}>
                            {this.renderWalletDApp()}
                        </div>

                        <div className={"col-12 col-xl-4"}>
                            {this.renderTokenDAppERC10()}
                        </div>

                        <div className={"col-12 col-xl-2 text-end"}>
                            {this.renderConnexionW3Button()}
                            {this.renderErrors()}
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default EthManager;
