import React, {Component} from "react";

/* comments and design thoughts, this form will fill the data of a single contract so:
- 1 form for the overall required meta data for the createContract
- 1 form that answears and corresponds to root nodes
- 1 form that answears and corresponds to child nodes

each of these will be separate components

*/

const saveButtonStyle = {
    position: "absolute",
    left: "1%",
    bottom: "2%"
};

const upperLeftCorner = {
    display: "inline-block",
    position: "absolute",
    padding: "1%",
    right: "1%",
    top: "1%"
};
export default class Form extends React.Component {
    /* State is our container with the required data */
    state = {
        contractName: "Avtalsnamn "
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
                <div style={upperLeftCorner}>
                    <input
                        name="contractName"
                        value={this.state.contractName}
                        onChange={e => this.change(e)}
                    />
                </div>
                <button style={saveButtonStyle} onClick={e => this.onSubmit(e)}>
                    Spara
                </button>
            </form>
        );
    }
}
