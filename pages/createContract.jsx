import React, {Component} from "react";
import Link from "next/link";
import Form from "../components/form";

/* function to go back to previous page  */
const goBack = () => {
    window.history.back();
};

/* styling for menu */
const menuStyle = {
    position: "relative",
    float: "left",
    width: "25%",
    padding: "1%",
    height: "100vh",
    border: "solid"
};

/* styling for the display field of the tree*/
const treeDisplay = {
    position: "relative",
    height: "50%",
    border: "solid"
};

/* styling for the options display field*/
const optionsDisplay = {
    float: "left",
    width: "69%",
    padding: "1%",
    height: "100vh",
    border: "solid"
};
class App extends Component {
    /* user input data fields*/
    state = {
        fields: {}
    };

    /* note - dev item*/
    onSubmit = fields => {
        console.log("App got: ", fields);
    };
    render() {
        return (
            <div>
                <div style={menuStyle}>
                    <button onClick={goBack}> tillbaka knapp </button>
                    <Form onSubmit={fields => this.onSubmit(fields)} />

                    <div style={treeDisplay} />
                </div>
                <div style={optionsDisplay} />
            </div>
        );
    }
}

export default App;
