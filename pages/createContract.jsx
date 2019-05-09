import React, {Component} from "react";
import Link from "next/link";
import Form from "../components/form";
import AdminModal from "../components/modal";

/* function to go back to previous page  */
const goBack = () => {};

/* styling for menu */
const menuStyle = {
    position: "relative",
    float: "left",
    width: "25%",
    padding: "1%",
    height: "90vh",
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
    height: "90vh",
    border: "solid"
};

class App extends Component {
    /* user input data fields*/
    state = {
        sShowing: false,
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
                    <AdminModal />
                    <Form onSubmit={fields => this.onSubmit(fields)} />
                    <br />
                    <div style={treeDisplay} />
                </div>
                <div style={optionsDisplay} />
            </div>
        );
    }
}

export default App;
