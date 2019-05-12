import React, {Component} from "react";
import Link from "next/link";
import Form from "../components/form";
import AdminBackbutton from "../components/modal";
import Tree, {operations} from "../components/Tree";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            infos: {},
            tree: null
        };

        // take all pure functions in Tree.operations and convert them
        // into version that modify this component's state
        this.operations = {};
        for (const [name, fun] of Object.entries(operations)) {
            this.operations[name] = (...args) =>
                this.setState((oldState, props) => ({
                    tree: fun.call(null, oldState.tree, ...args)
                }));
        }
        this.operations["onClickPlus"] = this.operations["addNodeLast"];
        this.operations["squareClick"] = node => {
            this.operations.setFocus(node);
        };
    }

    handleInput(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    render() {
        // TODO: memoize this
        const focused = this.state.tree && this.state.tree.find(x => x.focused);
        return (
            <div className="root">
                <div className="menu">
                    <AdminBackbutton />
                    <div className="tree">
                        <Tree
                            tree={this.state.tree}
                            handlers={this.operations}
                            popupContainer={".tree"}
                        />
                    </div>
                </div>
                <div className="options">
                    {focused && (
                        <div>
                            Question:{" "}
                            <input
                                value={this.state.value}
                                name="nodeQuestion"
                                type="text"
                                onChange={this.handleInput.bind(this)}
                            />
                        </div>
                    )}
                </div>
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
