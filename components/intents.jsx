import React, {Component} from "react";
import Link from "next/link";

const listContainer = {
    margin: "auto",
    width: "50%",
    padding: "1%",
    height: "40vh",
    border: "solid"
};

const saveButtonStyle = {
    position: "absolute",
    left: "1%",
    bottom: "7%"
};

const fieldContainer = {
    margin: "auto",
    textAlign: "center",
    width: "50%",
    padding: "1%",
    height: "20vh",
    border: "solid"
};

/* function for scroll window */
const ListOfIntents = props => {
    return (
        <div>
            <button onClick={props.delContract}> Delete </button>
        </div>
    );
};

export default class Intent extends React.Component {
    constructor(props) {
        super(props);
    }
    /* State is our container with the required data */
    state = {
        intentName: "Avtalsnamn ",
        exampleAnswer: "",
        info: [{exampleAnswer: "jag vill flytta ihop med min kille."}]
    };

    /* changes the value in state datafield with matching name*/
    change = e => {
        this.props.onSubmit(this.state);
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    /* Function that collects the data that is entered*/
    onSubmit = e => {
        e.preventDefault();
        this.props.onSubmit(this.state);

        /* here communication should be made with backend so that
      - the contract is stored on the database
      - the list of created contract is updated
    */
    };
    render() {
        return (
            <form>
                <br />
                <div style={fieldContainer}>
                    <input
                        style={{border: "solid"}}
                        name="intentName"
                        value={this.state.intentName}
                        onChange={e => this.change(e)}
                    />{" "}
                    <br /> <br />
                    <input
                        style={{border: "solid"}}
                        name="exampleAnswer"
                        value={this.state.exampleAnswer}
                        onChange={e => this.change(e)}
                    />
                    <button onClick={e => this.onSubmit(e)}>Lägg till</button>
                </div>{" "}
                <br />
                <div style={listContainer}>
                    <ul>
                        {this.state.info.map((info, index) => {
                            return (
                                <ListOfIntents key={index}>
                                    {this.props.children}{" "}
                                </ListOfIntents>
                            );
                        })}
                    </ul>
                </div>
                <button style={saveButtonStyle} onClick={e => this.onSubmit(e)}>
                    Spara
                </button>
            </form>
        );
    }
}
