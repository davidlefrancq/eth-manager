import React, {Component} from 'react';
import Web3 from "web3";
import jsonInterface from "./jsonInterface.json";
import Transactions from "../WalletDApp/Transactions";
import {CANCELED, SUCCESS, Transaction} from "../bo/Transaction";
import WeiConverter from "../../utils/WeiConverter";

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const contractAddress = "0x645A0c9957e35213D17f30f8cdE8230C0C9A029A";

class TokenDAppErc20 extends Component {

    contract;

    constructor(props) {
        super(props);
        this.state = {
            address: "",
            amount: "",
            balance: 0,
            decimals:0,
            symbol: null,
            transactionInProgress: false,
            errors: "",
            transactions: [],
        };
    }

    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.account != this.props.account) {
            this.init();
        }
    }

    init() {
        this.contract = new web3.eth.Contract(jsonInterface, contractAddress);
        this.initBalance();
        this.initSymbol();
        this.initDecimals();
    }

    setStateBalance = (balance) => {
        const state = {...this.state.balance};
        state.balance = balance;
        this.setState(state);
    }

    initBalance = () => {
        if (this.contract) {
            this.contract.methods.balanceOf(this.props.account).call({from: this.props.account}).then((result) => {
                this.setStateBalance(result);
            }).catch((error) => {
                this.setErrors(error.message)
            });
        }
    }

    initDecimals = () => {
        if (this.contract) {
            this.contract.methods.decimals().call({from: this.props.account}).then((result) => {
                this.setStateDecimals(Number.parseInt(result));
            }).catch((error) => {
                this.setErrors(error.message)
            });
        }
    }

    initSymbol = () => {
        if (this.contract) {
            this.contract.methods.symbol().call({from: this.props.account}).then((result) => {
                this.setStateSymbol(result);
            }).catch((error) => {
                this.setErrors(error.message)
            });
        }
    }

    setStateSymbol = (symbol) => {
        const state = {...this.state};
        state.symbol = symbol;
        this.setState(state);
    }

    setStateDecimals = (decimals) => {
        const state = {...this.state};
        state.decimals = decimals;
        this.setState(state);
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
        const value = (stateTmp.amount * (10 ** this.state.decimals)).toString();
        this.send(to, value);

        const state = {...this.state}
        state.address = "";
        state.amount = "";
        this.setState(state)
    }

    substractionStateBalance = (amount) => {
        const state = {...this.state};
        state.balance -= amount;
        this.setState(state);
    }

    send = (address, amount) => {

        this.setTransactionInProgress(true);

        // Si Web3 est connecté
        const {account} = this.props;
        if (account) {

            const transaction = this.addTransaction(account, address, amount);
            try {
                // Exécution d'une requete sur le Contract Solidity
                this.contract.methods.transfer(address, amount).send({from: account}).then((result) => {
                    transaction.status = SUCCESS;
                    this.substractionStateBalance(amount);
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
        const {balance} = this.state;
        return (
            <div className={"container mt-3 p-4 shadow"}>
                <h2 className={"text-start mb-4"}>
                    WCS Token
                </h2>

                <div className={"container-fluid p-3"} style={{position: "relative"}}>

                    <div className={"row"}>
                        <div className={"col-4 text-start"}>
                            Amount Ethers:
                        </div>
                        <div className={"col-8 row"}>
                            <div className={"col-10"}>
                                <input type={"text"} value={WeiConverter.weiToEth(balance)}
                                       className={"form-control disabled"} disabled/>
                            </div>
                            <div className={"col-2 text-start pt-1"}>
                                {this.state.symbol}
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
                                {this.state.symbol}
                            </div>

                        </div>
                    </div>

                    <div className={"text-start"}>
                        <button className={"btn btn-outline-primary"} onClick={this.sendHandle}>
                            Send
                        </button>
                    </div>

                    {this.renderErrors()}

                </div>
            </div>
        );
    }

    renderTransactions() {
        if (this.state.transactions && this.state.transactions.length > 0) {
            return (
                <div className={"transactions-animation"}>
                    <Transactions
                        transactions={this.state.transactions}
                        chain={this.props.chain}
                        currency={this.state.symbol}
                    />
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

export default TokenDAppErc20;
