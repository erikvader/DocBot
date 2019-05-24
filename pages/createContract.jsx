import React, {Component} from "react";
import Link from "next/link";
import AdminBackbutton from "../components/modal";
import Tree, {operations} from "../components/Tree";

// TODO: make the option fritext only be available if a question is
//       NOT a branching question
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tree: null, // the current tree
            focused: null, // the focused element in tree
            contractName: ""
        };

        // take all pure functions in Tree.operations and convert them
        // into version that modify this component's state
        this.operations = {};
        for (const [name, fun] of Object.entries(operations)) {
            this.operations[name] = (...args) =>
                this.setState((oldState, props) => {
                    const newTree = fun.call(null, oldState.tree, ...args);
                    return {
                        tree: newTree,
                        focused: newTree.find(x => x.focused)
                    };
                });
        }
        this.operations["onClickPlus"] = this.operations["addNodeLast"];
        this.operations["squareClick"] = node => {
            this.operations.setFocus(node);
        };
    }

    // returns the branch node of the focused one
    isFocusedBranch() {
        if (!this.state.focused) {
            return null;
        }
        return this.state.tree.getBranchParent(this.state.focused.slice());
    }
    // returns the Choice that comes after focused
    isFocusedPreChoice() {
        if (!this.state.focused) {
            return null;
        }
        return this.state.tree.isPreChoice(this.state.focused.slice());
    }

    // store/change data for the currently focused node
    handleNodeInput(event) {
        const value = event.target.value;
        const name = event.target.name;
        let focused = this.state.focused;

        if (!focused) {
            return;
        }
        this.operations.modifyNode(focused.slice(), {[name]: value});
    }

    // retreive input data from the currently focused node.
    getInputValue(name, node) {
        let path;
        if (node === undefined) {
            path = this.state.focused.slice();
        } else {
            path = this.state.tree.find(x => x === node);
        }
        return this.state.tree.get(path)[name];
    }

    onSave(e) {
        e.preventDefault();
        // NOTE: temporary debug print
        console.log(this.state.tree);
    }

    render() {
        // figure out what elements to include in .options
        let optionsBox = [];
        if (this.state.focused) {
            optionsBox.push(
                <div key="question">
                    Fråga:
                    <textarea
                        value={this.getInputValue("nodeQuestion")}
                        name="nodeQuestion"
                        onChange={this.handleNodeInput.bind(this)}
                    />
                </div>
            );
            optionsBox.push(
                <div key="expectedans">
                    Förväntat svar:
                    <select
                        onChange={this.handleNodeInput.bind(this)}
                        value={this.getInputValue("nodeQuestionType")}
                        name="nodeQuestionType">
                        <option value="yesno">Ja eller Nej</option>
                        <option value="number">Ett nummer</option>
                        <option value="text">Fritext</option>
                    </select>
                </div>
            );

            const focusedBranch = this.isFocusedBranch();
            if (focusedBranch) {
                const qtype = this.getInputValue(
                    "nodeQuestionType",
                    focusedBranch
                );
                if (qtype === "yesno") {
                    optionsBox.push(
                        <div key={qtype}>
                            Krav på föregående:
                            <br />
                            <input
                                type="radio"
                                name="prevYesNo"
                                onChange={this.handleNodeInput.bind(this)}
                                checked={
                                    this.getInputValue("prevYesNo") === "yes"
                                }
                                value="yes"
                            />
                            Ja
                            <br />
                            <input
                                type="radio"
                                name="prevYesNo"
                                onChange={this.handleNodeInput.bind(this)}
                                checked={
                                    this.getInputValue("prevYesNo") === "no"
                                }
                                value="no"
                            />
                            Nej
                            <br />
                        </div>
                    );
                } else if (qtype === "number") {
                    optionsBox.push(
                        <div key={qtype}>
                            Siffran från föregående ska vara:
                            <select
                                onChange={this.handleNodeInput.bind(this)}
                                value={this.getInputValue("prevNumberOperator")}
                                name="prevNumberOperator">
                                <option value="=">{"="}</option>
                                <option value=">=">{">="}</option>
                                <option value="<=">{"<="}</option>
                                <option value=">">{">"}</option>
                                <option value="<">{"<"}</option>
                                <option value="!=">{"!="}</option>
                                <option value="between">
                                    mellan (inklusive)
                                </option>
                            </select>
                            <input
                                type="number"
                                name="prevNumber1"
                                onChange={this.handleNodeInput.bind(this)}
                                value={this.getInputValue("prevNumber1")}
                            />
                            {this.getInputValue("prevNumberOperator") ===
                                "between" && (
                                <span>
                                    och
                                    <input
                                        type="number"
                                        name="prevNumber2"
                                        onChange={this.handleNodeInput.bind(
                                            this
                                        )}
                                        value={this.getInputValue(
                                            "prevNumber2"
                                        )}
                                    />
                                </span>
                            )}
                        </div>
                    );
                }
            }
        }
        return (
            <div className="root">
                <div className="menu">
                    <AdminBackbutton />
                    <input
                        name="contractName"
                        value={this.state.contractName}
                        onChange={e =>
                            this.setState({[e.target.name]: e.target.value})
                        }
                    />
                    <div className="tree">
                        <Tree
                            tree={this.state.tree}
                            handlers={this.operations}
                            popupContainer={".tree"}
                        />
                    </div>
                    <button onClick={this.onSave.bind(this)}>Spara</button>
                </div>
                <div className="options">{optionsBox}</div>
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
