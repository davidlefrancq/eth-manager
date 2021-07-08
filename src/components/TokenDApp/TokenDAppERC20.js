import React, {Component} from 'react';
import Web3 from "web3";
import jsonInterface from "./jsonInterface.json";
import Transactions from "../WalletDApp/Transactions";
import {CANCELED, SUCCESS, Transaction} from "../bo/Transaction";
import WeiConverter from "../../utils/WeiConverter";
import Error from "../Error";

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
            decimals: 0,
            symbol: null,
            transactionInProgress: false,
            errors: [],
            transactions: [],
            contractAddress: "",
            addressErc20ClassCss: "is-invalid",
        };
    }

    setErc20Valid = () => {
        const state = {...this.state};
        state.addressErc20ClassCss = "is-valid"
        this.setState(state);
    }

    setErc20Invalid = () => {
        const state = {...this.state};
        state.addressErc20ClassCss = "is-invalid"
        this.setState(state);
    }

    initContract = () => {
        try {
            this.contract = new web3.eth.Contract(jsonInterface, this.state.contractAddress);
            this.initBalance();
            this.initSymbol();
            this.initDecimals();
            this.setErc20Valid();
        } catch (error) {
            this.setErc20Invalid();
        }
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
                this.addError(error.message)
            });
        }
    }

    initDecimals = () => {
        if (this.contract) {
            this.contract.methods.decimals().call({from: this.props.account}).then((result) => {
                this.setStateDecimals(Number.parseInt(result));
            }).catch((error) => {
                this.addError(error.message)
            });
        }
    }

    initSymbol = () => {
        if (this.contract) {
            this.contract.methods.symbol().call({from: this.props.account}).then((result) => {
                this.setStateSymbol(result);
            }).catch((error) => {
                this.addError(error.message)
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

    addError = (error) => {
        const state = {...this.state}
        state.errors.push(error);
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
        if (this.state.errors && this.state.errors.length > 0) {
            return this.state.errors.map((error, index) => {
                return <Error key={index} id={index} error={error} removeError={this.removeError}/>;
            });
        }
    }

    setContractAddress = (event) => {
        return new Promise((resolve, reject) => {
            try {
                const state = {...this.state};
                state.contractAddress = event.target.value;
                this.setState(state);
                resolve();
            } catch (error) {
                reject(error);
            }

        });
    }

    erc20Handle = (event) => {
        event.preventDefault();
        this.setContractAddress(event).then(()=>{
            this.initContract();
        }).catch((error)=>{
            this.addError(error.message);
        })
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
                            Contract ERC20 :
                        </div>
                        <div className={"col-8 row"}>
                            <div className={"col-10"}>
                                <input
                                    className={`form-control ${this.state.addressErc20ClassCss}`}
                                    type={"text"}
                                    value={this.state.contractAddress}
                                    onChange={this.erc20Handle}
                                />
                            </div>
                            <div className={"col-2 text-start"}>
                            </div>
                        </div>
                    </div>

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

                    <div className={"text-end"}>
                        <button className={"btn btn-primary"} onClick={this.sendHandle}>
                            Submit
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
