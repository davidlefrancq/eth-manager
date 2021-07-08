import React from 'react';

const Error = (props) => {

    const {error, id, removeError} = props;

    const errorClose = () => {
        removeError(id);
    }

    return (
        <div className="mt-1 alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={errorClose}></button>
        </div>
    );
};

export default Error;
