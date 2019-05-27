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

/*Placement for Yes button*/
const style_yes_button = {
    padding: "4%",
    float: "left"
};

const style_no_button = {
    padding: "4%",
    paddingLeft: "30%",
    float: "right"
};
/* A modal component is implemented using

<AdminModal
    modalName = string parameter connected to the display button of the modal
    yesText = string parameter connected to yes condition
    noText =  string parameter connected to no condition
    textModal = string parameter connected what message the modal want to deliver
    funcToYes= function to be run on yes, is implemented in calling file, example is {this.onYes}
/>

No always closes the window no action taken.

 */
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
                <button onClick={this.openModal}>{this.props.modalName}</button>

                <Modal
                    ariaHideApp={false}
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal}
                    style={customStyles}>
                    <div>
                        <div>{this.props.textModal}</div>

                        <div style={style_yes_button}>
                            <a
                                id="Yes"
                                className="buttonStyle"
                                onClick={() => this.props.funcToYes()}>
                                {this.props.yesText}
                            </a>
                        </div>
                        <div style={style_no_button}>
                            <button
                                id="No"
                                className="buttonStyle"
                                onClick={this.closeModal}>
                                {this.props.noText}
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
