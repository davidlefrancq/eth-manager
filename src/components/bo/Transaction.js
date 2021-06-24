const IN_PROGRESS = "IN_PROGRESS";
const SUCCESS = "SUCCESS";
const CANCELED = "CANCELED";

class Transaction {
    status;
    from;
    to;
    value;

    constructor(from, to, value) {
        this.status = IN_PROGRESS;
        this.from = from;
        this.to = to;
        this.value = value;
    }
}

export {Transaction, IN_PROGRESS, SUCCESS, CANCELED};
