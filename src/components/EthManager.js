import React, {Component} from 'react';
import Web3 from "web3";
import Chains from "./ChainIds/Chains";
import Explorers from "./Explorers";
import jsonInterface from "./jsonInterface.json";

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const contractAddress = "0xA7026E17A0679a96136F7F94a17D286eAc31BF8c";

class EthManager extends Component {

    chains;
    contract;

    constructor(props) {
        super(props);
        this.state = {
            w3Connected: false,
            chain: null,
            account: null,
            accounts: null,
            balance: null,
            errors: "",
            walletDApp: {
                address: "",
                amount: "",
            },
        }
        this.contract = new web3.eth.Contract(jsonInterface, contractAddress);
    }

    setAccount = (account, chainId, balance) => {
        const state = {...this.state};
        state.w3Connected = true;
        state.account = account;
        state.chain = Chains.getChain(chainId);
        state.balance = balance;
        this.setState(state);
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
                console.error(error);
            });
        } else {
            const state = {...this.state};
            state.errors = "Install Metamask";
            this.setState(state);
        }
    }

    getAccounts = () => {
        return web3.eth.getAccounts();
    }

    getBalance = (account) => {
        return web3.eth.getBalance(account);
    }

    balanceToEth() {
        let result = 0;
        if (this.state.w3Connected) {
            const balanceEth = this.state.balance * Math.pow(10, -18);
            const balanceEthRounded = Math.floor((balanceEth * 1000000)) / 1000000;
            result = balanceEthRounded;
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
                <div>
                    <div className={"d-inline shadow p-1 rounded"}>{this.state.account}</div>
                    <Explorers account={this.state.account} chain={this.state.chain}/>
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
                <div className={"d-block text-center"}>
                    <h1>{name}</h1>
                </div>
            );
        }
    }

    wDAppAddressHandle = (event) => {
        console.log("Address", event.target.value);
        const state = {...this.state};
        state.walletDApp.address = event.target.value;
        this.setState(state);
    }

    wDAppAmountHandle = (event) => {
        console.log("Amount", event.target.value);
        const state = {...this.state};
        state.walletDApp.amount = event.target.value;
        this.setState(state);
    }

    sendHandle = () => {
        const {address, amount} = this.state.walletDApp;
        console.log("sendHandle", address, amount);
        this.send(address, amount);
    }

    send = (address, amount) => {

        // Si Web3 est connecté
        const {account} = this.state;
        if (account) {

            try {
                // Exécution d'une requete sur le Contract Solidity
                this.contract.methods.send(address).send({from: account, value: amount}).then((result) => {

                    console.log(result);
                    this.resetWalletDAppForm();

                }).catch((error) => {
                    console.error(error);
                    this.setErrors(error.message)
                });
            } catch (error) {
                console.error(error.message);
                this.setErrors(error.message)
            }
        }
    }

    setErrors(errors){
        const state = {...this.state}
        state.errors = errors;
        this.setState(state);
    }

    resetWalletDAppForm = () => {
        const state = {...this.state};
        state.walletDApp.address = "";
        state.walletDApp.amount = "";
        this.setState(state);
    }

    renderWalletDApp() {
        if (this.state.w3Connected) {
            const balance = this.balanceToEth();
            return (
                <div className={"container"}>
                    <h2 className={"text-start"}>Wallet dApp</h2>

                    <div className={"row"}>
                        <div className={"col-4 text-start"}>
                            Amount Ethers:
                        </div>
                        <div className={"col-8 row"}>
                            <div className={"col-10"}>
                                <input type={"text"} value={balance} className={"form-control disabled"} disabled/>
                            </div>
                            <div className={"col-2 text-start pt-1"}>
                                ETH
                            </div>
                        </div>
                    </div>

                    <div className={"row"}>
                        <div className={"col-4 text-start"}>
                            Address:
                        </div>
                        <div className={"col-8 text-start"}>
                            <input
                                className={"form-control"}
                                type={"text"}
                                value={this.state.walletDApp.address}
                                onChange={this.wDAppAddressHandle}
                            />
                        </div>
                    </div>

                    <div className={"row"}>
                        <div className={"col-4 text-start"}>
                            Amount:
                        </div>
                        <div className={"col-8 text-start"}>
                            <input
                                className={"form-control"}
                                type={"number"}
                                value={this.state.walletDApp.amount}
                                onChange={this.wDAppAmountHandle}
                            />
                        </div>
                    </div>

                    <div className={"text-start"}>
                        <button className={"btn btn-outline-primary"} onClick={this.sendHandle}>
                            Send
                        </button>
                    </div>
                </div>
            );
        }
    }

    render() {

        return (
            <div className={"container"}>
                {this.renderChainInfo()}


                <div className={"row"}>

                    <div className={"col-6"}>
                        {this.renderWalletDApp()}
                    </div>

                    <div className={"col-6 text-end"}>
                        {this.renderConnexionW3Button()}
                        {this.renderAccount()}
                        <div className={"alert alert-danger"}>
                        {this.state.errors}
                        </div>
                    </div>

                </div>

            </div>
        );
    }
}

export default EthManager;
