import React from 'react';
import Chains from "./ChainIds/Chains";
import {BsArrowUpRight, BsClipboard} from "react-icons/all";

const Explorers = (props) => {

    const {chain, account} = props;
    const size = 18;

    const copyToClipboard = (text) => {
        navigator.permissions.query({name: "clipboard-write"}).then(result => {
            if (result.state == "granted" || result.state == "prompt") {

                navigator.clipboard.writeText(text).then(function () {
                    /* clipboard successfully set */
                }, function () {
                    console.error("Error to copy in clipboard");
                });

            }
        }).catch((error) => {
            console.error(error);
        });
    }

    const renderClipboardButton = () => {
        return (
            <a href={"#"}
               className={"shadow p-1 rounded-3 h-100"}
               style={{marginLeft: 5}}
               onClick={(event) => {
                   event.preventDefault();
                   copyToClipboard(account);
               }}
            >
                <BsClipboard/>
            </a>

        );
    }

    const renderExplorer = (explorer, index) => {
        return (
            <div key={index} className={"d-inline h-100"}>

                {renderClipboardButton()}

                <a href={`${explorer.url}/address/${account}`}
                   className={"shadow p-1 rounded-3 h-100"}
                   style={{marginLeft: 5}}
                   target={"_blank"}
                >
                    <BsArrowUpRight size={size}/>
                </a>
            </div>
        );
    }

    const renderExplorers = () => {
        let explorers = [];

        if (chain) {
            explorers = Chains.getExplorers(chain);
        }

        if (explorers.length > 0) {

            return explorers.map((explorer, index) => {
                return renderExplorer(explorer, index);
            });

        } else {
            const testnet = Chains.getTestnet(chain);
            return (
                <div className={"d-inline h-100"}>

                    {renderClipboardButton()}

                    <a
                        href={`https://${testnet}.etherscan.io/address/${account}`}
                        className={"shadow p-1 rounded-3 h-100"}
                        style={{marginLeft: 5}}
                        target={"_blank"}
                    >
                        <BsArrowUpRight size={size}/>
                    </a>
                </div>
            );

        }
    }

    return renderExplorers();
};

export default Explorers;
