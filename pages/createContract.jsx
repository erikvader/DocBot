import React, {Component} from "react";
import Link from "next/link";
import Form from "../components/form";
import AdminBackbutton from "../components/modal";
import Tree from "../components/Tree";

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
            <div className="root">
                <div className="menu">
                    <AdminBackbutton />
                    <div className="tree">
                        <Tree />
                    </div>
                </div>
                <div className="options" />
                <style jsx>
                    {`
                        :global(body) {
                            padding: 0;
                            margin: 0;
                        }
                        * {
                            box-sizing: border-box;
                        }
                        .root {
                            height: 100vh;
                            width: 100vw;
                            padding: 0.5%;
                        }
                        .menu {
                            position: relative;
                            float: left;
                            width: 50%;
                            padding: 1%;
                            height: 100%;
                            border: solid;
                            display: flex;
                            flex-direction: column;
                        }
                        .tree {
                            position: relative;
                            height: 100%;
                            border: solid;
                            padding: 0.5%;
                            overflow-x: auto;
                            overflow-y: scroll;
                        }
                        .options {
                            float: left;
                            width: 50%;
                            padding: 1%;
                            height: 100%;
                            border: solid;
                        }
                    `}
                </style>
            </div>
        );
    }
}

export default App;
