import Link from "next/link";
import React from "react";

const column_1 = {
    float: "left",
    width: "40%"
};
const column_2 = {
    float: "left",
    width: "25%"
};
const column_3 = {
    float: "left",
    width: "25%"
};
const column_4 = {
    float: "left",
    width: "10%"
};
const row = {
    content: "",
    display: "table",
    clear: "both",
    width: "100%"
};

/* function for scroll window */
const ScrollMenu = props => {
    return (
        <div style={row}>
            <div style={column_1}> {props.children}</div>
            <div style={column_2}> {props.dateChanged} </div>
            <div style={column_3}> Jur Ist </div>
            <div style={column_4}>
                <button onClick={props.delContract}> Delete </button>
            </div>
        </div>
    );
};

export default ScrollMenu;
