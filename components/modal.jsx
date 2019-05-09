import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import Link from "next/link";

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

const placementStyle = {
    padding: "4%",
    paddingLeft: "30%",
    float: "left"
};

class AdminModal extends React.Component {
    constructor() {
        super();

        this.state = {
            modalIsOpen: false
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
                <button onClick={this.openModal}>Open Modal</button>

                <Modal
                    ariaHideApp={false}
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal}
                    style={customStyles}>
                    <div>
                        <div>
                            Är du säker på att du vill lämna vyn? Alla osparade
                            ändringar kommer gå förlorade.
                        </div>

                        <div style={placementStyle}>
                            <Link href="/admin">
                                <a id="Yes" className="buttonStyle">
                                    {" "}
                                    JA
                                </a>
                            </Link>
                        </div>
                        <div style={placementStyle}>
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
                        }
                          .buttonStyle#Yes {
                                background-color: green;
                        }
                          `}
                    </style>
                </Modal>
            </div>
        );
    }
}

export default AdminModal;
