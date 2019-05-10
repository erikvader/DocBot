import React, {Component} from "react";
import Link from "next/link";
import Intent from "../components/intents";

/* function to go back to previous page  */
const goBack = () => {
    location.href = "http://localhost:3000/admin";
};

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

class ConditionManager extends Component {
    state = {
        intentWindow: true,
        entityWindow: false
    };

    showEntity = () => {
        this.setState({
            intentWindow: false,
            entityWindow: true
        });
    };

    showIntent = () => {
        this.setState({
            intentWindow: true,
            entityWindow: false
        });
    };

    render() {
        return (
            <div>
                <div style={menuStyle}>
                    <button onClick={goBack}> tillbaka knappen </button>
                    <a> Villkorsskapare </a> <br />
                    <br />
                    <button onClick={this.showIntent}> Avsikt</button>
                    <button onClick={this.showEntity}> Entitet </button>
                    {this.state.intentWindow && (
                        /* Intents */
                        <div style={treeDisplay} />
                    )}
                    {this.state.entityWindow && (
                        /*Entity*/
                        <div style={treeDisplay}>avsikter</div>
                    )}
                </div>
                {this.state.intentWindow && (
                    <div style={optionsDisplay}>
                        <Intent />
                    </div>
                )}
                {this.state.entityWindow && <div style={optionsDisplay} />}
            </div>
        );
    }
}

export default ConditionManager;
