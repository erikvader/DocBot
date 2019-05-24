import {Layer, Stage, Line} from "react-konva";
import Popup from "reactjs-popup";

// global variable to make sure all tree nodes have unique ids
let global_id = 0;

// create a shallow copy of a object with the correct prototype and
// stuff
function clone(obj) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

// run funname if it exists in obj. funname will receive funargs as
// arguments.
function runIfExists(obj, funname, ...funargs) {
    if (funname in obj) {
        return obj[funname](...funargs);
    }
    return null;
}

// ==================
// tree datastructure
// ==================
// the leaf nodes of the tree. This is the thing that contains all
// data from the backend including what question to ask.
export class Node {
    constructor() {
        this.id = global_id;
        global_id++;
        this.focused = false;
        this.nodeQuestion = "";
        this.nodeQuestionType = "text";
        this.prevYesNo = "yes";
        this.prevNumber1 = 0;
        this.prevNumber2 = 0;
        this.prevNumberOperator = "=";
    }
    // see Sequence.getHeight
    getHeight() {
        return 1;
    }
    // see Sequence.find
    find(pred) {
        if (pred(this)) {
            return [this];
        }
        return null;
    }
    // see Sequence.deleteNode
    deleteNode(path) {
        path.shift();
        return [];
    }
    // see Sequence.modifyNode
    modifyNode(path, mods) {
        path.shift();
        let copy = clone(this);
        for (const [k, v] of Object.entries(mods)) {
            copy[k] = v;
        }
        return copy;
    }
    // see Sequence.getBranchParent
    getBranchParent(path) {
        path.shift();
        return null;
    }
    get(path) {
        path.shift();
        return this;
    }
}

// A vertical immutable list of either Node or Choice.
// This is the order in which questions are asked.
export class Sequence {
    constructor() {
        this.id = global_id;
        global_id++;
        this.list = [];
    }
    // adds node to this sequence by modifying it
    addNode(node) {
        this.list.push(node);
        return this;
    }
    // get the first Node in this sequence
    getFirst() {
        const f = this.list[0];
        if (!f instanceof Node) {
            throw new Error("getFirst did not return a Node");
        }
        return f;
    }
    // returns all nodes that terminate any branch
    getEnds() {
        const l = this.list[this.list.length - 1];
        if (l instanceof Choice) {
            return l.getLeaving();
        }
        return [l]; // must be a Node
    }
    // returns the height of this tree
    getHeight() {
        return this.list.map(x => x.getHeight()).reduce((a, b) => a + b, 0);
    }
    // returns an object with all nodes that should be connected with a line.
    // the object is on the form {from1: [to1, to2], from2: ...}
    getLines() {
        let res = [];
        let last = null;
        for (const x of this.list) {
            if (!last) {
                last = x;
                continue;
            }

            if (last instanceof Node) {
                if (x instanceof Node) {
                    res.push({from: last.id, to: [x.id]});
                } else {
                    //Choice
                    res.push({
                        from: last.id,
                        to: x.getEntering().map(x => x.id)
                    });
                }
            } else {
                // last = Choice, x = Node
                res.push({from: x.id, to: last.getLeaving().map(x => x.id)});
            }

            if (x instanceof Choice) {
                res = res.concat(x.getLines());
            }

            last = x;
        }
        return res;
    }
    // searches for the first node/sequence/choice that satisfies the
    // predicate pred. pred is a function that takes the node to check
    // as it's only argument. The return value is a list with nodes
    // describing the path to take.
    find(pred) {
        if (pred(this)) {
            return [this];
        }
        for (const c of this.list) {
            let path = c.find(pred);
            if (path != null) {
                path.unshift(this);
                return path;
            }
        }
        return null;
    }
    // returns the node id of the last node, if there is one.
    getIdOfLast() {
        if (this.list.length === 0) {
            throw "list is empty";
        }
        return this.list[this.list.length - 1].id;
    }
    // returns a list of nodes this should be replaced by to remove
    // the node from following path. path gets modified.
    // This returns an empty list if everything got removed.
    // If there still are things left, this returns a list with one
    // element. That element is a copy of this node but modified to
    // have the node described by path removed.
    deleteNode(path) {
        path.shift();
        if (path.length === 0) {
            return [];
        }
        const ind = this.list.findIndex(x => path[0] === x);
        const rem = this.list[ind].deleteNode(path);
        let copy = clone(this);
        copy.list = this.list.slice();
        copy.list.splice(ind, 1, ...rem);
        if (copy.list.length === 0) {
            return [];
        } else {
            return [copy];
        }
    }
    // returns a copy of this node but modified to have node inserted
    // after the node described in path. If above is true, then the
    // node is added before instead of after.
    insertNode(path, node, above) {
        path.shift();
        const ind = this.list.findIndex(x => path[0] === x);
        let copy = clone(this);
        copy.list = this.list.slice();
        if (path.length === 1) {
            // we found the node to add after
            if (above) {
                copy.list.splice(ind, 0, node);
            } else {
                copy.list.splice(ind + 1, 0, node);
            }
        } else {
            const add = this.list[ind].insertNode(path, node, above);
            copy.list.splice(ind, 1, add);
        }
        return copy;
    }
    // follows path to modify a node by applying each key-value pair
    // in mods to node.
    modifyNode(path, mods) {
        path.shift();
        const ind = this.list.findIndex(x => path[0] === x);
        let copy = clone(this);
        copy.list = this.list.slice();
        copy.list[ind] = this.list[ind].modifyNode(path, mods);
        return copy;
    }
    // returns the Choice node that comes after node, if there is one,
    // null otherwise.
    isPreChoice(path) {
        path.shift();
        const ind = this.list.findIndex(x => path[0] === x);
        if (path.length === 1) {
            if (
                ind + 1 < this.list.length &&
                this.list[ind + 1] instanceof Choice
            ) {
                return this.list[ind + 1];
            } else {
                return null;
            }
        }
        return this.list[ind].isPreChoice(path);
    }
    // returns the node that comes before a Choice. Path should refer
    // to one of the first nodes in any sequence inside a Choice.
    getBranchParent(path) {
        path.shift();
        const ind = this.list.findIndex(x => path[0] === x);
        if (
            path.length === 3 &&
            this.list[ind] instanceof Choice &&
            this.list[ind].isBranch(path[path.length - 1])
        ) {
            return this.list[ind - 1];
        }
        return this.list[ind].getBranchParent(path);
    }
    get(path) {
        path.shift();
        const ind = this.list.findIndex(x => path[0] === x);
        return this.list[ind].get(path);
    }
}

// a horizontal list of Sequences. A Choice must be preceded by a Node.
export class Choice extends Sequence {
    // synonym to make more sense
    addBranch = this.addNode;
    // returns a list of all nodes beginning an answer alternative
    getEntering() {
        return this.list.map(x => x.getFirst());
    }
    // returns a list of all nodes ending an answer alternative
    getLeaving() {
        return this.list.flatMap(x => x.getEnds());
    }
    getHeight() {
        return Math.max(...this.list.map(x => x.getHeight()));
    }
    getLines() {
        return Array.prototype.concat(...this.list.map(x => x.getLines()));
    }
    // same as Sequence.deleteNode except that this also checks
    // whether the current Choice only contains one Sequence. If it
    // does it removes itself and the Sequence
    deleteNode(path) {
        const rem = super.deleteNode(path);
        if (rem.length > 0 && rem[0].list.length === 1) {
            return rem[0].list[0].list;
        }
        return rem;
    }
    // is node a branching question on this choice?
    isBranch(node) {
        for (const seq of this.list) {
            if (seq.getFirst() === node) {
                return true;
            }
        }
        return false;
    }
}

// ================================
// React representation of the tree
// ================================

// react compontent for Choice
class HoriList extends React.Component {
    render() {
        return (
            <div>
                {this.props.choice.list.map(x => (
                    <List
                        key={x.id}
                        sequ={x}
                        handlers={this.props.handlers}
                        popupContainer={this.props.popupContainer}
                    />
                ))}
                <style jsx>{`
                    div {
                        display: flex;
                        flex-direction: row;
                    }
                `}</style>
            </div>
        );
    }
}

// react component for Sequence
class List extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const children = [];

        for (const x of this.props.sequ.list) {
            if (x instanceof Choice) {
                children.push(
                    <HoriList
                        key={x.id}
                        choice={x}
                        handlers={this.props.handlers}
                        popupContainer={this.props.popupContainer}
                    />
                );
            } else {
                children.push(
                    <Square
                        key={x.id}
                        info={x}
                        handlers={this.props.handlers}
                        preChoice={this.props.sequ.isPreChoice([
                            this.props.sequ.id,
                            x
                        ])}
                        popupContainer={this.props.popupContainer}
                    />
                );
            }
        }

        return (
            <div className="list-container">
                {children}
                <style jsx>
                    {`
                        .list-container {
                            display: flex;
                            flex-direction: column;
                            position: relative;
                            z-index: 1;
                        }
                    `}
                </style>
            </div>
        );
    }
}

// react component for Node
class Square extends React.Component {
    render() {
        const preChoiceItems = [
            [
                "",
                "Lägg till nytt svarsalternativ",
                () =>
                    runIfExists(
                        this.props.handlers,
                        "addNodeToChoice",
                        this.props.preChoice
                    )
            ],
            [
                "",
                "Lägg till fortsättningsfråga",
                () =>
                    runIfExists(
                        this.props.handlers,
                        "addNode",
                        this.props.preChoice
                    )
            ]
        ];
        const nonPreChoiceItems = [
            [
                "",
                "Gör om till fråga med följdfrågor",
                () =>
                    runIfExists(
                        this.props.handlers,
                        "addChoice",
                        this.props.info
                    )
            ],
            [
                "",
                "Lägg till ny fråga under",
                () =>
                    runIfExists(this.props.handlers, "addNode", this.props.info)
            ],
            [
                "remove",
                "Ta Bort",
                () =>
                    runIfExists(
                        this.props.handlers,
                        "deleteNode",
                        this.props.info
                    )
            ]
        ];
        const normalItems = [
            [
                "",
                "Lägg till ny fråga ovanför",
                () =>
                    runIfExists(
                        this.props.handlers,
                        "addNode",
                        this.props.info,
                        true
                    )
            ]
        ];

        function createDivs(elements, closefun) {
            return elements.map(([classes, content, onclick], i) => (
                <div
                    key={i}
                    className={
                        classes === "" ? "popup-item" : classes + " popup-item"
                    }
                    onClick={() => {
                        closefun();
                        onclick();
                    }}>
                    {content}
                </div>
            ));
        }

        const height = 50;
        const width = 100;
        const squareClasses = `square-${this.props.info.id}${
            this.props.info.focused ? " focused" : ""
        }`;
        return (
            <div
                className={`square ${squareClasses}`}
                onClick={() =>
                    runIfExists(
                        this.props.handlers,
                        "squareClick",
                        this.props.info
                    )
                }>
                <div className="text">{this.props.info.nodeQuestion}</div>
                <div
                    className="dots-container"
                    onClick={e => e.stopPropagation()}>
                    <Popup
                        trigger={<a className="dots">⠇</a>}
                        position="right center"
                        keepTooltipInside={this.props.popupContainer}
                        contentStyle={{
                            padding: "0px",
                            border: "none",
                            width: "250px"
                        }}>
                        {closefun => (
                            <div>
                                {createDivs(normalItems, closefun)}
                                {this.props.preChoice &&
                                    createDivs(preChoiceItems, closefun)}
                                {!this.props.preChoice &&
                                    createDivs(nonPreChoiceItems, closefun)}
                                {this.props.preChoice && ( // TODO: remove this special case somehow. Maybe create a confirmation popup component that can be reused?
                                    <Popup
                                        trigger={
                                            <div className="remove popup-item">
                                                Ta Bort
                                            </div>
                                        }
                                        onClose={closefun}
                                        modal>
                                        {closemodal => (
                                            <div className="modal-main">
                                                <div>
                                                    Du kommer att ta bort mer än
                                                    du antar!
                                                </div>
                                                <div
                                                    className="modal-abort"
                                                    onClick={closemodal}>
                                                    avbryt
                                                </div>
                                                <div
                                                    className="modal-accept"
                                                    onClick={() => {
                                                        closemodal();
                                                        runIfExists(
                                                            this.props.handlers,
                                                            "deleteNode",
                                                            this.props
                                                                .preChoice,
                                                            this.props.info
                                                        );
                                                    }}>
                                                    ta bort
                                                </div>
                                            </div>
                                        )}
                                    </Popup>
                                )}
                            </div>
                        )}
                    </Popup>
                </div>
                {/* NOTE: popup-item classes don't work unless they are global for some reason */}
                <style jsx>{`
                    .square {
                        background: rgb(241,252,255);
                        background: linear-gradient(180deg, rgba(241,252,255,1) 0%, rgba(176,234,255,1) 100%);
                        width: ${width}px;
                        height: ${height}px;
                        margin: 10px;
                        position: relative;
                        padding: 0.3em;
                        padding-right: 0;
                        display: flex;
                        border-radius: 5px;
                    }
                    .square.focused {
                        background: #cb60b3;
                        background: linear-gradient(to bottom,#6085cb  0%,#1226ad 50%,#4656de 100%);
                    }
                    .dots-container {
                    }
                    .dots {
                        line-height: ${height}px;
                        user-select: none;
                        z-index: 2;
                    }
                    .dots:hover {
                        cursor: pointer;
                        color: white;
                    }
                    .text {
                        line-height: ${height}px;
                        text-align: center;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                        user-select: none;
                        flex-grow: 1;
                    }
                    :global(.popup-item) {
                        padding: 0.2em;
                    }
                    :global(.popup-item:hover) {
                        background: gainsboro;
                        cursor: pointer;
                    }
                    :global(.remove) {
                        color: red;
                        font-weight: bold;
                    }
                    .modal-main {
                       position: relative;
                       padding-bottom: 30px;
                       text-align: center;
                    }
                    .modal-abort {
                       position: absolute;
                       left: 0;
                       bottom: 0;
                       padding 0.3em;
                    }
                    .modal-accept {
                       position: absolute;
                       bottom: 0;
                       right: 0;
                       background: red;
                       padding 0.3em;
                    }
                    .modal-accept:hover, .modal-abort:hover {
                       cursor: pointer;
                       background: gainsboro;
                    }

                `}</style>
            </div>
        );
    }
}

// draws all lines between all nodes
class Lines extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stageWidth: null,
            stageHeight: null,
            stageTop: null,
            stageLeft: null,
            squareSizes: {}
        };
        this.stage_wrapper = React.createRef();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.lines !== this.props.lines) {
            this.updateDOMSizes();
        }
    }
    componentDidMount() {
        this.updateDOMSizes();
    }
    // retreive and store sizes and positions of all Squares
    updateDOMSizes() {
        const cont = this.props.containerRef.current.getBoundingClientRect();
        // converts a DOMRect to an object with coordinates relative
        // to cont instead of the viewport
        function convert(rect) {
            return {
                x: rect.left + rect.width / 2 - cont.left,
                y: rect.top + rect.height / 2 - cont.top,
                width: rect.width,
                height: rect.height,
                left: rect.left - cont.left,
                right: rect.right - cont.left,
                bottom: rect.bottom - cont.top,
                top: rect.top - cont.top
            };
        }

        let {top, left, width, height} = convert(
            this.stage_wrapper.current.getBoundingClientRect()
        );

        const reg = /square-(\d+)/;
        const squareSizes = Array.prototype.map
            .call(document.getElementsByClassName("square"), ele => ({
                id: Array.prototype.find
                    .call(ele.classList, c => reg.test(c))
                    .match(reg)[1],
                rect: ele.getBoundingClientRect()
            }))
            .reduce(
                (base, {id, rect}) =>
                    Object.assign(base, {
                        [id]: convert(rect)
                    }),
                {}
            );

        const newState = {
            squareSizes: squareSizes,
            stageWidth: width,
            stageHeight: height,
            stageTop: top,
            stageLeft: left
        };
        this.setState(newState);
    }
    renderLines() {
        let res = [];
        for (const l of this.props.lines) {
            const from = this.state.squareSizes[l.from];
            const to = l.to.map(x => this.state.squareSizes[x]);

            let commonMiddle = to.reduce((base, x) => {
                const cand = (x.y - from.y) / 2;
                return Math.abs(cand) < Math.abs(base) ? cand : base;
            }, Infinity);

            const stem = [from.x, from.y, from.x, from.y + commonMiddle];

            for (const t of to) {
                const points = stem.concat([
                    t.x,
                    from.y + commonMiddle,
                    t.x,
                    t.y
                ]);
                res.push(
                    <Line
                        key={points.join(" ")}
                        points={points}
                        stroke={"black"}
                        strokeWidth={2}
                    />
                );
            }
        }
        return res;
    }
    // do we have position and size information about all Squares we
    // are about to draw?
    sufficientInfo() {
        return this.props.lines
            .flatMap(l => [l.from, ...l.to])
            .every(id => id in this.state.squareSizes);
    }
    render() {
        return (
            <div className="stage-wrapper" ref={this.stage_wrapper}>
                {this.state.stageWidth &&
                    this.state.stageHeight &&
                    this.sufficientInfo() && (
                        <Stage
                            width={this.state.stageWidth}
                            height={this.state.stageHeight}>
                            <Layer>
                                {Object.keys(this.state.squareSizes).length !==
                                    0 &&
                                    this.props.lines.length !== 0 &&
                                    this.renderLines()}
                            </Layer>
                        </Stage>
                    )}
                <style jsx>
                    {`
                        .stage-wrapper {
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            top: 0px;
                            left: 0px;
                        }
                    `}
                </style>
            </div>
        );
    }
}

// the main component that draws the tree.
// props.tree is the tree to render.
// props.handlers is an object that contains functions to run when
// some things are clicked on.
// props.popupContainer is an CSS selector to an element that popups
// are going to be inside of.
export default class Tree extends React.Component {
    constructor(props) {
        super(props);
        this.treeRootRef = React.createRef();
    }
    render() {
        return (
            <div className="tree-root" ref={this.treeRootRef}>
                {this.props.tree && (
                    <List
                        sequ={this.props.tree}
                        handlers={this.props.handlers}
                        popupContainer={this.props.popupContainer}
                    />
                )}
                {this.props.tree && (
                    <Lines
                        lines={this.props.tree.getLines()}
                        containerRef={this.treeRootRef}
                    />
                )}
                <div
                    className="plus"
                    onClick={() =>
                        runIfExists(this.props.handlers, "onClickPlus")
                    }>
                    +
                </div>
                <style jsx>
                    {`
                        .tree-root {
                            position: relative;
                            display: inline-block;
                        }
                        .plus {
                            width: 94px;
                            height: 25px;
                            border: 3px dotted black;
                            border-radius: 5px;
                            line-height: 25px;
                            text-align: center;
                            font-size: 25px;
                            margin-left: 10px;
                            user-select: none;
                            position: relative;
                            z-index: 1;
                        }
                        .plus:hover {
                            background: lime;
                            cursor: pointer;
                        }
                    `}
                </style>
            </div>
        );
    }
}

// convenience function that searches for a node id
function idFind(tree, id) {
    return tree.find(x => x.id === id);
}

// operations that modifies a Tree. Each function takes the current
// tree and returns a copy of it with some operation done to it.
export const operations = {
    // remove all specified nodes from the tree
    deleteNode: function(tree, ...nodes) {
        for (const n of nodes) {
            let path = idFind(tree, n.id);
            const rem = tree.deleteNode(path);
            if (rem.length === 0) {
                tree = null;
                break;
            } else {
                tree = rem[0];
            }
        }
        return tree;
    },
    // adds a new empty node before or after node
    addNode: function(tree, node, above = false) {
        let path = idFind(tree, node.id);
        const add = tree.insertNode(path, new Node(), above);
        return add;
    },
    // adds two question choices after node
    addChoice: function(tree, node) {
        let path = idFind(tree, node.id);
        const x = new Choice()
            .addBranch(new Sequence().addNode(new Node()))
            .addBranch(new Sequence().addNode(new Node()));
        const add = tree.insertNode(path, x, false);
        return add;
    },
    // adds a new question choice to an existing choice choice
    addNodeToChoice: function(tree, choice) {
        const right = choice.getIdOfLast();
        let path = idFind(tree, right);
        const x = new Sequence().addNode(new Node());
        const add = tree.insertNode(path, x, false);
        return add;
    },
    // function for the plus button. Adds an empty node last in the
    // top level
    addNodeLast: function(tree) {
        if (tree === null) {
            return new Sequence().addNode(new Node());
        } else {
            const right = tree.getIdOfLast();
            let path = idFind(tree, right);
            const add = tree.insertNode(path, new Node(), false);
            return add;
        }
    },
    // changes the focus to the node current
    setFocus: function(tree, current) {
        let prev = tree.find(x => x.focused);
        if (prev !== null) {
            tree = tree.modifyNode(prev, {focused: false});
        }
        let path = idFind(tree, current.id);
        return tree.modifyNode(path, {focused: true});
    },
    modifyNode: function(tree, path, mods) {
        return tree.modifyNode(path, mods);
    }
};
