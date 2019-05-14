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
            tree: null,
            focused: null
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

    // search and find the currently focused node and save it in
    // state.
    updateFocusedNode() {
        if (!this.state.tree) {
            this.setState({focused: null});
        } else {
            const path = this.state.tree.find(x => x.focused);
            if (path) {
                this.setState({focused: path[path.length - 1]});
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.tree !== this.state.tree) {
            this.updateFocusedNode();
        }
    }

    componentDidMount() {
        this.updateFocusedNode();
    }

    // store/change data for the currently focused node
    handleInput(event) {
        const value = event.target.value;
        const name = event.target.name;
        const focused = this.state.focused;

        if (!focused) {
            return;
        }

        let old;
        if (focused in this.state.infos) {
            old = Object.assign({}, this.state.infos[focused]);
        } else {
            old = {};
        }

        old[name] = value;

        this.setState((state, props) => ({
            infos: Object.assign({}, state.infos, {[focused]: old})
        }));
    }

    // retreive input data from the currently focused node.
    getInputValue(name) {
        if (this.state.focused in this.state.infos) {
            const cur = this.state.infos[this.state.focused];
            if (name in cur) {
                return cur[name];
            }
        }
        return "";
    }

    render() {
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
                    {this.state.focused && (
                        <div>
                            Question:{" "}
                            <input
                                value={this.getInputValue("nodeQuestion")}
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
