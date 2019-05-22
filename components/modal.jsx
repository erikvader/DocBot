import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import Link from "next/link";
import Router from "next/router";

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        padding: "10%"
    }
};

const placementStyle_1 = {
    padding: "4%",
    float: "left"
};

const placementStyle_2 = {
    padding: "4%",
    paddingLeft: "30%",
    float: "right"
};

class AdminModal extends React.Component {
    constructor() {
        super();

        this.state = {
            modalIsOpen: false,
            textMessage: "det här är en text som är bra"
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    render() {
        return (
            <div>
                <button onClick={this.openModal}>Tillbaka</button>

                <Modal
                    ariaHideApp={false}
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal}
                    style={customStyles}>
                    <div>
                        <div>{this.props.textModal}</div>

                        <div style={placementStyle_1}>
                            <a
                                id="Yes"
                                className="buttonStyle"
                                onClick={() => this.props.funcToYes()}>
                                JA
                            </a>
                        </div>
                        <div style={placementStyle_2}>
                            <button
                                id="No"
                                className="buttonStyle"
                                onClick={this.closeModal}>
                                NEJ
                            </button>
                        </div>
                    </div>
                    <style jsx>
                        {` .buttonStyle {

                                background-color: #4CAF50;
                                border: none;
                                color: white;
                                padding: 10px 12px;
                                text-align: center;
                                text-decoration: none;
                                display: inline-block;
                                font-size: 16px;
                                margin: 4px 2px;
                                cursor: pointer;
                        }
                        }
                          .buttonStyle#No {
                                background-color: red;
                                float: left;
                        }
                          .buttonStyle#Yes {
                                background-color: green;
                                float: right;
                        }
                          `}
                    </style>
                </Modal>
            </div>
        );
    }
}

export default AdminModal;
