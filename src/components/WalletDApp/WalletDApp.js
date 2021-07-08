import React, {Component} from 'react';
import Web3 from "web3";
import jsonInterface from "./jsonInterface.json";
import Transactions from "./Transactions";
import {CANCELED, SUCCESS, Transaction} from "../bo/Transaction";
import Error from "../Error";

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const contractAddress = "0xA7026E17A0679a96136F7F94a17D286eAc31BF8c";


class WalletDApp extends Component {

    contract;

    constructor(props) {
        super(props);
        this.state = {
            address: "",
            amount: "",
            balance: 0,
            transactionInProgress: false,
            errors: [],
            transactions: [],
        };
    }

    componentDidMount() {
        this.init()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.account !== this.props.account) {
            this.initBalance();
        }
    }

    init() {
        this.contract = new web3.eth.Contract(jsonInterface, contractAddress);
        this.initBalance();
    }

    initBalance = () => {
        const state = {...this.state};
        state.balance = this.props.balanceToEth();
        this.setState(state);
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
        const value = (Number.parseFloat(stateTmp.amount) * Math.pow(10, 18));
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
                    this.addError(error.message)
                    this.setTransactionInProgress(false);
                });
            } catch (error) {
                transaction.status = CANCELED;
                this.addError(error.message)
                this.setTransactionInProgress(false);
            }
        }
    }

    addError = (errors) => {
        const state = {...this.state}
        state.errors.push(errors);
        this.setState(state);
    }

    removeError = (index) => {
        const state = {...this.state}
        state.errors.splice(index, 1);
        this.setState(state);
    }

    resetErrors = () => {
        const state = {...this.state}
        state.errors = [];
        this.setState(state);
    }

    resetForm = () => {
        const state = {...this.state};
        state.address = "";
        state.amount = "";
        state.transactionInProgress = false;
        this.setState(state);
    }

    renderErrors() {
        if (this.state.errors && this.state.errors.length > 0) {
            return this.state.errors.map((error, index) => {
                return <Error key={index} id={index} error={error} removeError={this.removeError}/>;
            });
        }
    }

    renderForm() {
        const {balance} = this.state;
        return (
            <div className={"container mt-3 p-4 shadow"} style={{minHeight: 400}}>
                <h2 className={"text-start mb-4"}>Wallet dApp</h2>

                <div className={"container-fluid p-3"} style={{position: "relative"}}>

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
                        <div className={"col-8 row text-start"}>
                            <div className={"col-10"}>
                                <input
                                    className={"form-control"}
                                    type={"text"}
                                    value={this.state.address}
                                    onChange={this.addressHandle}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={"row"}>
                        <div className={"col-4 text-start"}>
                            Amount:
                        </div>
                        <div className={"col-8 row text-start"}>
                            <div className={"col-10"}>
                                <input
                                    className={"form-control"}
                                    type={"number"}
                                    value={this.state.amount}
                                    onChange={this.amountHandle}
                                />
                            </div>
                            <div className={"col-2 text-start pt-1"}>
                                ETH
                            </div>
                        </div>
                    </div>

                    <div className={"text-end pt-2 mt-4 border-top"}>
                        <button className={"btn btn-primary"} onClick={this.sendHandle}>
                            Submit
                        </button>
                    </div>

                    <div className={"mt-3"}>
                        {this.renderErrors()}
                    </div>

                </div>
            </div>
        );
    }

    renderTransactions() {
        if (this.state.transactions && this.state.transactions.length > 0) {
            return (
                <div className={"transactions-animation mt-3"}>
                    <Transactions transactions={this.state.transactions} chain={this.props.chain}/>
                </div>
            );
        }
    }

    render() {
        return (
            <>
                {this.renderForm()}
                {this.renderTransactions()}
            </>
        );
    }
}

export default WalletDApp;
