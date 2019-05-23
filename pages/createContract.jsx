import React, {Component} from "react";
import Link from "next/link";
import AdminModal from "../components/modal";
import Router from "next/router";
import Tree, {operations} from "../components/Tree";

// TODO: make the option fritext only be available if a question is
//       NOT a branching question
// TODO: some input data in infos are still present even if they don't
//       apply anymore (for example if a node isn't after a branch question anymore)
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            infos: {}, // the value of all input fields for all nodes
            tree: null, // the current tree
            focused: null, // the focused element in tree
            focusedBranch: null, // the parent question node if focused is the beginning of a branch
            focusedPreChoice: null, //the Choice node (if there is one) following focused
            contractName: "Avtalsnamn"
        };

        this.infosDefaults = {
            nodeQuestion: "",
            nodeQuestionType: "text",
            prevYesNo: "yes",
            prevNumber1: 0,
            prevNumber2: 0,
            prevNumberOperator: "="
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

    // function to run everytime tree in state changes
    treeUpdateHook() {
        // update node text to match input field
        const oldFocused = this.state.focused;
        if (oldFocused) {
            const curQuestion = this.getInputValue("nodeQuestion");
            if (oldFocused.text !== curQuestion) {
                this.operations.setTextOn(oldFocused, curQuestion);
                this.setState({focused: null});
                return;
            }
        }

        // search and find the currently focused node and save it in
        // state.
        let newFocused = null;
        let focusedBranch = null;
        let focusedPreChoice = null;
        if (this.state.tree) {
            let path = this.state.tree.find(x => x.focused);
            if (path) {
                newFocused = path[path.length - 1];
                focusedBranch = this.state.tree.getBranchParent(path.slice());
                focusedPreChoice = this.state.tree.isPreChoice(path.slice());
            }
        }
        this.setState({
            focused: newFocused,
            focusedBranch,
            focusedPreChoice
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.tree !== this.state.tree) {
            this.treeUpdateHook();
        }
    }

    componentDidMount() {
        this.treeUpdateHook();
    }

    // store/change data for the currently focused node
    handleNodeInput(event) {
        const value = event.target.value;
        const name = event.target.name;
        let focused = this.state.focused;

        if (!focused) {
            return;
        }
        focused = focused.id;

        let old;
        if (focused in this.state.infos) {
            old = Object.assign({}, this.state.infos[focused]);
        } else {
            old = {};
        }

        old[name] = value;

        this.setState((state, props) => {
            const res = Object.assign({}, state.infos, {[focused]: old});
            console.log(res);
            return {infos: res};
        });
    }

    // retreive input data from the currently focused node.
    getInputValue(name, node) {
        if (node === undefined) {
            node = this.state.focused;
        }
        if (node && node.id in this.state.infos) {
            const cur = this.state.infos[node.id];
            if (name in cur) {
                return cur[name];
            }
        }
        return this.infosDefaults[name];
    }

    onSave(e) {
        e.preventDefault();
        // NOTE: temporary debug print
        console.log(this.state.tree);
    }

    onYes = () => {
        Router.push("/admin");
    };

    render() {
        let boxClass = ["optionsClass"];
        if (this.state.focused) {
            console.log("fokuserad");
            boxClass.push("active");
        }
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

            if (this.state.focusedBranch) {
                const qtype = this.getInputValue(
                    "nodeQuestionType",
                    this.state.focusedBranch
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
                                "between" && [
                                "och",
                                <input
                                    type="number"
                                    name="prevNumber2"
                                    onChange={this.handleNodeInput.bind(this)}
                                    value={this.getInputValue("prevNumber2")}
                                />
                            ]}
                        </div>
                    );
                }
            }
        }

        return (
            <div className="root">
                <div className="menu">
                    <AdminModal
                        textModal="Är du säker på att du vill lämna den här vyn? Alla osparade ändringar kommer gå förlorade."
                        funcToYes={this.onYes}
                    />
                    <input
                        className="upperLeftCorner"
                        name="contractName"
                        value={this.state.contractName}
                        onChange={e =>
                            this.setState({[e.target.name]: e.target.value})
                        }
                    />
                    <br />
                    <div className="tree">
                        <Tree
                            tree={this.state.tree}
                            handlers={this.operations}
                            popupContainer={".tree"}
                        />
                    </div>
                    <div>
                        <button
                            className="saveButtonStyle"
                            onClick={this.onSave.bind(this)}>
                            Spara
                        </button>
                    </div>
                </div>
                <div className={boxClass.join(" ")}>{optionsBox}</div>
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
                            background-image: linear-gradient(
                                -45deg,
                                rgb(135, 206, 250, 0.5),
                                white
                            );
                        }
                        .menu {
                            position: relative;
                            float: left;
                            width: 50%;
                            padding: 1%;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                        }
                        .tree {
                            position: relative;
                            height: 90%;
                            border-style: inset;
                            border: 2px solid F0EFEF;
                            border-radius: 25px;
                            padding: 0.5%;
                            overflow-x: auto;
                            overflow-y: scroll;
                        }
                        .optionsClass {
                            float: left;
                            width: 50%;
                            padding: 1%;
                            height: 100%;
                            background-color: transparent;
                            border-radius: 10px 10px 10px 1000px;
                        }

                        .optionsClass.active {
                            background-image: linear-gradient(
                                -45deg,
                                skyblue,
                                white
                            );
                        }
                        .upperLeftCorner {
                            display: inline-block;
                            position: absolute;
                            padding: 1%;
                            right: 1%;
                            top: 1%;
                        }

                        .saveButtonStyle {
                            position: absolute;
                            left: 1%;
                            bottom: 2%;
                        }
                        .input:hover {
                            border: #ccc;
                        }
                    `}
                </style>
            </div>
        );
    }
}

export default App;
