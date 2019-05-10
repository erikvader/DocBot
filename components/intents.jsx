import React, {Component} from "react";

const listContainer = {
    margin: "auto",
    width: "50%",
    padding: "1%",
    height: "40vh",
    border: "solid"
};

const fieldContainer = {
    margin: "auto",
    textAlign: "center",
    width: "50%",
    padding: "1%",
    height: "20vh",
    border: "solid"
};

export default class Intent extends React.Component {
    /* State is our container with the required data */
    state = {
        intentName: "Avtalsnamn ",
        exampleAvswer: ""
    };

    /* changes the value in state datafield with matching name*/
    change = e => {
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
                        name="exampleAvswer"
                        value={this.state.exampleAvswer}
                        onChange={e => this.change(e)}
                    />
                    <button onClick={e => this.onSubmit(e)}>Lägg till</button>
                </div>{" "}
                <br />
                <div style={listContainer} />
            </form>
        );
    }
}
