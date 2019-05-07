import {Layer, Stage, Line} from "react-konva";
import Popup from "reactjs-popup";

// TODO: check for invalid node deletions in deleteNode
// TODO: choice inherits from sequence

// Tree datastructure /////////////////////////////////////////////////////////

let global_id = 0;

function clone(obj) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

export class Node {
    constructor(text) {
        this.id = global_id;
        global_id++;
        this.text = this.id;
    }
    getHeight() {
        return 1;
    }
    find(id) {
        if (id === this.id) {
            return [this.id];
        }
        return null;
    }
    deleteNode(path) {
        path.shift();
        return [];
    }
}

export class Sequence {
    constructor() {
        this.id = global_id;
        global_id++;
        this.list = [];
    }
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
    getEnds() {
        const l = this.list[this.list.length - 1];
        if (l instanceof Choice) {
            return l.getLeaving();
        }
        return [l]; // must be a Node
    }
    getHeight() {
        return this.list.map(x => x.getHeight()).reduce((a, b) => a + b, 0);
    }
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
    deleteNode(path) {
        path.shift();
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

export class Choice extends Sequence {
    addBranch = this.addNode;
    getEntering() {
        return this.list.map(x => x.getFirst());
    }
    getLeaving() {
        return Array.prototype.concat(...this.list.map(x => x.getEnds()));
    }
    getHeight() {
        return Math.max(...this.list.map(x => x.getHeight()));
    }
    getLines() {
        return Array.prototype.concat(...this.list.map(x => x.getLines()));
    }
    deleteNode(path) {
        const rem = super.deleteNode(path);
        if (rem.length > 0 && rem[0].list.length === 1) {
            return rem[0].list[0].list;
        }
        return rem;
    }
}

// React representation of the Tree ///////////////////////////////////////////

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
                {/* <div className="anchor" /> */}
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
                                Lägg till ny ovanför
                            </div>
                            {this.props.preChoice === null && (
                                <div
                                    className="popup-item"
                                    onClick={() => {
                                        closefun();
                                        this.props.tree.addNode(
                                            this.props.info
                                        );
                                    }}>
                                    Lägg till ny under
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
                                Lägg till svarsalternativ
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
                            <div
                                className="remove popup-item"
                                onClick={() => {
                                    closefun();
                                    this.props.tree.deleteNode(this.props.info);
                                }}>
                                Ta bort
                            </div>
                        </div>
                    )}
                </Popup>
                <style jsx>{`
                    .square {
                        background: ${this.props.preChoice ? "blue" : "pink"};
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
                        color: red;
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
                `}</style>
            </div>
        );
    }
}

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
    updateDOMSizes() {
        let {
            top,
            left,
            width,
            height
        } = this.stage_wrapper.current.getBoundingClientRect();

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
                        [id]: {
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2,
                            width: rect.width,
                            height: rect.height,
                            left: rect.left,
                            right: rect.right,
                            bottom: rect.bottom,
                            top: rect.top
                        }
                    }),
                {}
            );

        this.setState({
            squareSizes: squareSizes,
            stageWidth: width,
            stageHeight: height,
            stageTop: top,
            stageLeft: left
        });
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
                const points = stem
                    .concat([t.x, from.y + commonMiddle, t.x, t.y])
                    .map((x, i) =>
                        i % 2 === 0
                            ? x + this.state.stageLeft
                            : x + this.state.stageTop
                    );
                res.push(
                    <Line
                        key={points.join(" ")}
                        points={points}
                        stroke={"green"}
                        strokeWidth={2}
                    />
                );
            }
        }
        return res;
    }
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

export class Tree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tree: props.tree,
            treeDrew: false
        };
    }
    deleteNode(node) {
        let path = this.state.tree.find(node.id);
        const rem = this.state.tree.deleteNode(path)[0];
        this.setState({tree: rem});
    }
    addNode(node, above = false) {
        let path = this.state.tree.find(node.id);
        const add = this.state.tree.insertNode(path, new Node(), above);
        this.setState({tree: add});
    }
    addChoice(node) {
        let path = this.state.tree.find(node.id);
        const x = new Choice()
            .addBranch(new Sequence().addNode(new Node()))
            .addBranch(new Sequence().addNode(new Node()));
        const add = this.state.tree.insertNode(path, x, false);
        this.setState({tree: add});
    }
    addNodeToChoice(choice) {
        const right = choice.list[choice.list.length - 1]; // TODO: use getter
        let path = this.state.tree.find(right.id);
        const x = new Sequence().addNode(new Node());
        const add = this.state.tree.insertNode(path, x, false);
        this.setState({tree: add});
    }
    render() {
        return (
            <div className="tree-root">
                <List sequ={this.state.tree} tree={this} />
                <Lines lines={this.state.tree.getLines()} />
            </div>
        );
    }
}
