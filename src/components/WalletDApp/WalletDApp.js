import React, {Component} from 'react';
import Web3 from "web3";
import jsonInterface from "./jsonInterface.json";
import Transactions from "./Transactions";
import {CANCELED, SUCCESS, Transaction} from "../bo/Transaction";

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const contractAddress = "0xA7026E17A0679a96136F7F94a17D286eAc31BF8c";


class WalletDApp extends Component {

    contract;

    constructor(props) {
        super(props);
        this.state = {
            address: "",
            amount: "",
            transactionInProgress: false,
            errors: "",
            transactions: [],
        };
        this.init();
    }

    init() {
        this.contract = new web3.eth.Contract(jsonInterface, contractAddress);
    }

    getAccounts = () => {
        return web3.eth.getAccounts();
    }

    getBalance = (account) => {
        return web3.eth.getBalance(account);
    }

    addressHandle = (event) => {
        const state = {...this.state};
        state.address = event.target.value;
        this.setState(state);
    }

    amountHandle = (event) => {
        const state = {...this.state};
        state.amount = event.target.value;
        this.setState(state);
    }

    setTransactionInProgress = (value) => {
        if (value === true || value === false) {
            const state = {...this.state};
            state.transactionInProgress = value;
            this.setState(state);
        }
    }

    addTransaction(from, to, value) {
        const transaction = new Transaction(from, to, value);
        const state = {...this.state};
        state.transactions.push(transaction);
        this.setState(transaction);
        return transaction;
    }

    sendHandle = () => {
        const stateTmp = {...this.state}
        const to = stateTmp.address;
        const value = stateTmp.amount;
        this.send(to, value);

        const state = {...this.state}
        state.address = "";
        state.amount = "";
        this.setState(state)
    }

    send = (address, amount) => {

        this.setTransactionInProgress(true);

        // Si Web3 est connecté
        const {account} = this.props;
        if (account) {

            const transaction = this.addTransaction(account, address, amount);
            try {
                // Exécution d'une requete sur le Contract Solidity
                this.contract.methods.send(address).send({from: account, value: amount}).then((result) => {
                    transaction.status = SUCCESS;
                    this.resetForm();

                }).catch((error) => {
                    transaction.status = CANCELED;
                    this.setErrors(error.message)
                    this.setTransactionInProgress(false);
                });
            } catch (error) {
                transaction.status = CANCELED;
                this.setErrors(error.message)
                this.setTransactionInProgress(false);
            }
        }
    }

    setErrors(errors) {
        const state = {...this.state}
        state.errors = errors;
        this.setState(state);
    }

    resetForm = () => {
        const state = {...this.state};
        state.address = "";
        state.amount = "";
        state.transactionInProgress = false;
        state.errors = "";
        this.setState(state);
    }

    renderErrors() {
        if (this.state.errors && this.state.errors != "") {
            return (
                <div className={"alert alert-danger h-100 w-100 text-center rounded shadow"}
                     style={{
                         position: "absolute",
                         top: 0,
                         left: 0,
                         backgroundColor: "rgb(255,255,255,0.95)",
                         zIndex: "999"
                     }}
                >
                    <div style={{position: "relative p-5"}}>
                        <div className={"fw-bold mt-5"} style={{fontSize: 20}}>
                            {this.state.errors}
                        </div>

                        <button
                            className={"btn btn-danger m-3"}
                            onClick={() => {
                                this.setErrors("")
                            }}
                        >
                            Close
                        </button>
                    </div>

                </div>
            );
        }
    }

    renderForm() {
        const balance = this.props.balanceToEth();
        return (
            <div className={"container p-5"} style={{position: "relative"}}>
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
                            value={this.state.address}
                            onChange={this.addressHandle}
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
                            value={this.state.amount}
                            onChange={this.amountHandle}
                        />
                    </div>
                </div>

                <div className={"text-start"}>
                    <button className={"btn btn-outline-primary"} onClick={this.sendHandle}>
                        Send
                    </button>
                </div>

                {this.renderErrors()}

            </div>
        );
    }

    renderTransactions() {
        if (this.state.transactions && this.state.transactions.length > 0) {
            return (
                <div className={"transactions-animation"}>
                    <Transactions transactions={this.state.transactions} chain={this.props.chain}/>
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                {this.renderForm()}
                {this.renderTransactions()}
            </div>
        );
    }
}

export default WalletDApp;
