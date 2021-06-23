// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthManager {

    function send(address _receiver) payable {
        _receiver.send(msg.value);
    }
}
