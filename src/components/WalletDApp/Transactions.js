import React, {Component} from 'react';
import WeiConverter from "../../utils/WeiConverter";
import AddressFormater from "../../utils/AddressFormater";
import {SUCCESS, IN_PROGRESS, CANCELED} from "../bo/Transaction";
import Explorers from "../../utils/Explorers";

class Transactions extends Component {
    
    renderSnipper(){
        return(
            <div className="spinner-grow text-primary" role="status" style={{maxWidth:25, maxHeight:25}}>
                <span className="visually-hidden">Loading...</span>
            </div>
        );
    }

    renderSuccessStatus(){
        return(
            <div className={"bg-success rounded-circle"} style={{width:25,height:25, marginLeft:"auto", marginRight:"auto"}}>

            </div>
        );
    }

    renderCancelStatus(){
        return(
            <div className={"bg-danger rounded-circle"} style={{width:25,height:25, marginLeft:"auto", marginRight:"auto"}}>

            </div>
        );
    }

    renderStatus(status){
        return (
            <div className={"text-center"}>
                {status === IN_PROGRESS ? this.renderSnipper() : ""}
                {status === SUCCESS ? this.renderSuccessStatus() : ""}
                {status === CANCELED ? this.renderCancelStatus() : ""}
            </div>
        );
    }


    renderTransaction(transaction, index) {

        const miniFrom = AddressFormater.minimizer(transaction.from);
        const miniTo = AddressFormater.minimizer(transaction.to);
        const eth = WeiConverter.weiToEth(transaction.value);
        const currency = this.props.currency ? this.props.currency : "ETH"

        return (
            <tr key={index}>
                <td>
                    {this.renderStatus(transaction.status)}
                </td>
                <td className={"text-start"}>
                    {miniFrom}
                    <Explorers account={transaction.from} chain={this.props.chain}/>
                </td>
                <td className={"text-start"}>
                    {miniTo}
                    <Explorers account={transaction.to} chain={this.props.chain}/>
                </td>
                <td>
                    {eth} {currency}
                </td>
            </tr>
        );
    }

    renderTransactions() {
        return this.props.transactions.map((transaction, index) => {
            return this.renderTransaction(transaction, index);
        });
    }

    render() {
        return (
            <table className={"table"}>
                <thead>
                <tr>
                    <th className={"text-start"} scope="col">
                        Status
                    </th>
                    <th className={"text-start"} scope="col">
                        From
                    </th>
                    <th className={"text-start"} scope="col">
                        To
                    </th>
                    <th scope="col">
                        Value
                    </th>
                </tr>
                </thead>
                <tbody>
                {this.renderTransactions()}
                </tbody>
            </table>
        );
    }
}

export default Transactions;
