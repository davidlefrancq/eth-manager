class WeiConverter{

    static weiToEth(wei){
        const balanceEth = wei * Math.pow(10, -18);
        const balanceEthRounded = Math.floor((balanceEth * 1000000000)) / 1000000000;
        return balanceEthRounded;
    }

}

export default WeiConverter;
