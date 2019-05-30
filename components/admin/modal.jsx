import React from "react";
import Modal from "react-modal";

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

/* A confirmation modal component.

  This component wraps the whole page and is used like this:

  <ConfirmationModal>
    {openModal => <MainPage />}
  </ConfirmationModal>

  where `openModal` is a function on this class that opens this modal.

 */
export default class ConfirmationModal extends React.Component {
    constructor() {
        super();

        this.state = {
            modalIsOpen: false,
            textModal: "",
            onYes: undefined,
            yesText: "",
            noText: ""
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    // this function opens the modal. `text` is the text to display,
    // `onYes` is a function with no parameters that is run when the
    // yes option is pressed and `options` is an object with various
    // options.
    openModal(text, onYes, options) {
        const {yesText, noText} = Object.assign(
            {yesText: "Ja", noText: "Nej"},
            options
        );
        this.setState({
            modalIsOpen: true,
            textModal: text,
            onYes,
            yesText,
            noText
        });
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    render() {
        return (
            <div>
                {this.props.children(this.openModal)}
                <Modal
                    ariaHideApp={false}
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal}
                    style={customStyles}>
                    <div>
                        <div>{this.state.textModal}</div>

                        <div style={style_yes_button}>
                            <a
                                id="Yes"
                                className="buttonStyle"
                                onClick={() => {
                                    this.state.onYes && this.state.onYes();
                                    this.closeModal();
                                }}>
                                {this.state.yesText}
                            </a>
                        </div>
                        <div style={style_no_button}>
                            <button
                                id="No"
                                className="buttonStyle"
                                onClick={this.closeModal}>
                                {this.state.noText}
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
