import {Layer, Stage, Line} from "react-konva";
import Popup from "reactjs-popup";

// ==================
// tree datastructure
// ==================

// global variable to make sure all tree nodes have unique ids
let global_id = 0;

// create a shallow copy of a object with the correct prototype and
// stuff
function clone(obj) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

// the leaf nodes of the tree. This is the thing that contains all
// data from the backend including what question to ask.
export class Node {
    constructor(text) {
        this.id = global_id;
        global_id++;
        this.text = this.id;
    }
    // see Sequence.getHeight
    getHeight() {
        return 1;
    }
    // see Sequence.getHeight
    find(id) {
        if (id === this.id) {
            return [this.id];
        }
        return null;
    }
    // see Sequence.getHeight
    deleteNode(path) {
        path.shift();
        return [];
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
    // searches for id and returns a list describing the path needed
    // to reach id
    find(id) {
        if (id === this.id) {
            return [this.id];
        }
        for (const c of this.list) {
            let path = c.find(id);
            if (path != null) {
                path.unshift(this.id);
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
        const ind = this.list.findIndex(x => path[0] === x.id);
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
        const ind = this.list.findIndex(x => path[0] === x.id);
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
    // returns the Choice node that comes after node, if there is one,
    // null otherwise.
    isPreChoice(node) {
        const ind = this.list.findIndex(x => node === x);
        if (
            ind + 1 < this.list.length &&
            this.list[ind + 1] instanceof Choice
        ) {
            return this.list[ind + 1];
        }
        return null;
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
                    <List key={x.id} sequ={x} tree={this.props.tree} />
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
                    <HoriList key={x.id} choice={x} tree={this.props.tree} />
                );
            } else {
                children.push(
                    <Square
                        key={x.id}
                        info={x}
                        tree={this.props.tree}
                        preChoice={this.props.sequ.isPreChoice(x)}
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
        const height = 50;
        return (
            <div className={`square square-${this.props.info.id}`}>
                <div className="text">{this.props.info.text}</div>
                <Popup
                    trigger={<a className="dots">⠇</a>}
                    position="right center"
                    keepTooltipInside={true}
                    contentStyle={{
                        padding: "0px",
                        border: "none",
                        width: "250px"
                    }}>
                    {closefun => (
                        <div>
                            <div
                                className="popup-item"
                                onClick={() => {
                                    closefun();
                                    this.props.tree.addNode(
                                        this.props.info,
                                        true
                                    );
                                }}>
                                Lägg till ny fråga ovanför
                            </div>
                            {!this.props.preChoice && (
                                <div
                                    className="popup-item"
                                    onClick={() => {
                                        closefun();
                                        this.props.tree.addNode(
                                            this.props.info
                                        );
                                    }}>
                                    Lägg till ny fråga under
                                </div>
                            )}
                            <div
                                className="popup-item"
                                onClick={() => {
                                    closefun();
                                    if (this.props.preChoice) {
                                        this.props.tree.addNodeToChoice(
                                            this.props.preChoice
                                        );
                                    } else {
                                        this.props.tree.addChoice(
                                            this.props.info
                                        );
                                    }
                                }}>
                                {(this.props.preChoice &&
                                    "Lägg till ny följdfråga") ||
                                    "Skapa följdfrågor"}
                            </div>
                            {this.props.preChoice && (
                                <div
                                    className="popup-item"
                                    onClick={() => {
                                        closefun();
                                        this.props.tree.addNode(
                                            this.props.preChoice
                                        );
                                    }}>
                                    Lägg till fortsättningsfråga
                                </div>
                            )}
                            {!this.props.preChoice && (
                                <div
                                    className="remove popup-item"
                                    onClick={() => {
                                        closefun();
                                        this.props.tree.deleteNode(
                                            this.props.info
                                        );
                                    }}>
                                    Ta bort
                                </div>
                            )}
                            {this.props.preChoice && (
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
                                                Du kommer att ta bort mer än du
                                                antar!
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
                                                    this.props.tree.deleteNode(
                                                        this.props.preChoice,
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
                <style jsx>{`
                    .square {
                        background: rgb(241,241,255);
                        background: linear-gradient(180deg, rgba(241,241,255,1) 0%, rgba(180,180,255,1) 100%);
                        width: 100px;
                        height: ${height}px;
                        margin: 10px;
                        position: relative;
                    }
                    .text {
                        width: 100%;
                        text-align: center;
                        margin-top: 2%;
                    }
                    .dots {
                        position: absolute;
                        height: 100%;
                        line-height: ${height}px;
                        right: 0;
                        top: 0;
                    }
                    .dots:hover {
                        cursor: pointer;
                        color: white;
                    }
                    .popup-item {
                        padding: 0.2em;
                    }
                    .popup-item:hover {
                        background: gainsboro;
                        cursor: pointer;
                    }
                    .remove {
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
                            z-index: -1;
                        }
                    `}
                </style>
            </div>
        );
    }
}

// the main component that keeps the tree state
export class Tree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tree: null
        };
        this.treeRootRef = React.createRef();
    }
    // remove all nodes from the tree
    deleteNode(...nodes) {
        let tree = this.state.tree;
        for (const n of nodes) {
            let path = tree.find(n.id);
            const rem = tree.deleteNode(path);
            if (rem.length === 0) {
                tree = null;
                break;
            } else {
                tree = rem[0];
            }
        }
        this.setState({tree: tree});
    }
    // adds a new empty node before or after node
    addNode(node, above = false) {
        let path = this.state.tree.find(node.id);
        const add = this.state.tree.insertNode(path, new Node(), above);
        this.setState({tree: add});
    }
    // adds two question choices after node
    addChoice(node) {
        let path = this.state.tree.find(node.id);
        const x = new Choice()
            .addBranch(new Sequence().addNode(new Node()))
            .addBranch(new Sequence().addNode(new Node()));
        const add = this.state.tree.insertNode(path, x, false);
        this.setState({tree: add});
    }
    // adds a new question choice to an existing choice choice
    addNodeToChoice(choice) {
        const right = choice.getIdOfLast();
        let path = this.state.tree.find(right);
        const x = new Sequence().addNode(new Node());
        const add = this.state.tree.insertNode(path, x, false);
        this.setState({tree: add});
    }
    // function for the plus button. Adds an empty node last in the
    // top level
    addNodeLast() {
        if (this.state.tree === null) {
            this.setState({tree: new Sequence().addNode(new Node())});
        } else {
            const right = this.state.tree.getIdOfLast();
            let path = this.state.tree.find(right);
            const add = this.state.tree.insertNode(path, new Node(), false);
            this.setState({tree: add});
        }
    }
    render() {
        return (
            <div className="tree-root" ref={this.treeRootRef}>
                {this.state.tree && <List sequ={this.state.tree} tree={this} />}
                {this.state.tree && (
                    <Lines
                        lines={this.state.tree.getLines()}
                        containerRef={this.treeRootRef}
                    />
                )}
                <div className="plus" onClick={() => this.addNodeLast()}>
                    +
                </div>
                <style jsx>
                    {`
                        .tree-root {
                            position: relative;
                        }
                        .plus {
                            width: 94px;
                            height: 25px;
                            border: 3px dotted black;
                            line-height: 25px;
                            text-align: center;
                            font-size: 25px;
                            margin-left: 10px;
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
