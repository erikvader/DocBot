import {Layer, Stage, Line} from "react-konva";
import Popup from "reactjs-popup";

// TODO: check for invalid node deletions in deleteNode

// Tree datastructure /////////////////////////////////////////////////////////

let global_id = 0;

function clone(obj) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

export class Node {
    constructor(text, color = "pink") {
        this.id = global_id;
        global_id++;
        this.text = this.id;
        this.color = color;
    }
    getHeight() {
        return 1;
    }
    find(id, res) {
        if (id === this.id) {
            res.unshift(this.id);
            return true;
        }
        return false;
    }
    deleteNode(path) {
        path.shift();
        return [];
    }
}

export class Choice {
    constructor() {
        this.id = global_id;
        global_id++;
        this.list = [];
    }
    addBranch(sequence) {
        this.list.push(sequence);
        return this;
    }
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
    find(id, res) {
        for (const c of this.list) {
            if (c.find(id, res)) {
                res.unshift(this.id);
                return true;
            }
        }
        return false;
    }
    deleteNode(path) {
        path.shift();
        const ind = this.list.findIndex(x => path[0] === x.id);
        const rem = this.list[ind].deleteNode(path);
        let copy = clone(this);
        copy.list = this.list.slice();
        copy.list.splice(ind, 1, ...rem);
        if (copy.list.length === 1) {
            return copy.list[0].list;
        } else {
            return [copy];
        }
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
    find(id, res) {
        for (const c of this.list) {
            if (c.find(id, res)) {
                res.unshift(this.id);
                return true;
            }
        }
        return false;
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
                    <Square key={x.id} info={x} tree={this.props.tree} />
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
                    contentStyle={{padding: "0px", border: "none"}}>
                    {closefun => (
                        <div
                            className="remove popup-item"
                            onClick={() => {
                                closefun();
                                this.props.tree.deleteNode(this.props.info);
                            }}>
                            Delete
                        </div>
                    )}
                </Popup>
                <style jsx>{`
                    .square {
                        background: ${this.props.info.color};
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
                        width: 100%;
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

// TODO: handles updates??
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
    render() {
        return (
            <div className="stage-wrapper" ref={this.stage_wrapper}>
                {this.state.stageWidth && this.state.stageHeight && (
                    <Stage
                        width={this.state.stageWidth}
                        height={this.state.stageHeight}>
                        <Layer>
                            {Object.keys(this.state.squareSizes).length !== 0 &&
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
            tree: props.tree
        };
    }
    deleteNode(node) {
        let path = [];
        this.state.tree.find(node.id, path);
        const rem = this.state.tree.deleteNode(path)[0];
        this.setState({tree: rem});
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
