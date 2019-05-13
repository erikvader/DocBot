import Link from "next/link";
import Menu from "../components/Layout";
import ScrollMenu from "../components/scrollMenu";
import React, {Component} from "react";

/* styling for ScrollMenu*/
const scrollStyle = {
    overflow: "scroll",
    float: "right",
    width: "69%",

    height: "90vh",
    border: "solid"
};

/* Styling of scrol menu overhead*/
const headerStyling = {
    float: "right",
    position: "relative",
    top: 0,
    width: "69%",
    border: "solid red"
};
/*styling for individual column */
const header_1 = {
    float: "left",
    display: "block",
    paddingRight: "3%",
    paddingLeft: "6%"
};

/*styling for individual column */
const header_2 = {
    float: "left",
    display: "block",
    paddingLeft: "25%"
};
/*styling for individual column */
const header_3 = {
    float: "left",
    display: "block",
    paddingLeft: "12%"
};

class Admin extends Component {
    /* Some dummy test name */
    state = {
        info: [
            {name: "hello", dateChanged: "2018-01-22"},
            {name: "World", dateChanged: "2019-07-31"}
        ]
    };

    deleteContract = (index, e) => {
        const info = Object.assign([], this.state.info);
        info.splice(index, 1);
        this.setState({info: info});
    };

    render() {
        return (
            <div>
                <div>
                    <Menu />
                </div>

                <div>
                    <div style={headerStyling}>
                        <div>
                            <h3 style={header_1}> Namn</h3>

                            <h3 style={header_2}> Senast ändrad</h3>
                            <h3 style={header_3}> Senast editerad av</h3>
                        </div>
                    </div>
                    <div style={scrollStyle}>
                        <ul>
                            {this.state.info.map((info, index) => {
                                console.log(this.state.count);
                                this.getId;
                                return (
                                    <ScrollMenu
                                        key={index}
                                        dateChanged={info.dateChanged}
                                        delContract={this.deleteContract.bind(
                                            this,
                                            index
                                        )}>
                                        {info.name}{" "}
                                    </ScrollMenu>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default Admin;
