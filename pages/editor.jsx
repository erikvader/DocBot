import {Layer, Stage, Line} from "react-konva";

let global_id = 0;

class Node {
    constructor(text, color = "pink") {
        this.id = global_id;
        global_id++;
        this.text = this.id;
        this.color = color;
    }
    getHeight() {
        return 1;
    }
}

class Choice {
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
}

class Sequence {
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
}

const testTree = new Sequence()
    .addNode(new Node("0"))
    .addNode(new Node("1"))
    .addNode(
        new Choice()
            .addBranch(new Sequence().addNode(new Node("2")))
            .addBranch(new Sequence().addNode(new Node("3")))
            .addBranch(
                new Sequence()
                    .addNode(new Node("4"))
                    .addNode(
                        new Choice()
                            .addBranch(new Sequence().addNode(new Node("5")))
                            .addBranch(new Sequence().addNode(new Node("6")))
                    )
            )
    )
    .addNode(new Node("7"));

class HoriList extends React.Component {
    render() {
        return (
            <div>
                {this.props.choice.list.map(x => (
                    <List key={x.id} sequ={x} />
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
                children.push(<HoriList key={x.id} choice={x} />);
            } else {
                children.push(<Square key={x.id} info={x} />);
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
        return (
            <div className={`square square-${this.props.info.id}`}>
                {this.props.info.text}
                <style jsx>{`
                    div {
                        background: ${this.props.info.color};
                        width: 100px;
                        height: 50px;
                        margin: 10px;
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
        this.stageWidth = null;
        this.stageHeight = null;
        this.stageTop = null;
        this.stageLeft = null;
        this.squareSizes = {};
        this.stage_wrapper = React.createRef();
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
        this.stageWidth = width;
        this.stageHeight = height;
        this.stageTop = top;
        this.stageLeft = left;

        const reg = /square-(\d+)/;
        this.squareSizes = Array.prototype.map
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

        this.forceUpdate();
    }
    renderLines() {
        let res = [];
        for (const l of this.props.lines) {
            const from = this.squareSizes[l.from];
            const to = l.to.map(x => this.squareSizes[x]);

            let commonMiddle = to.reduce((base, x) => {
                const cand = (x.y - from.y) / 2;
                return Math.abs(cand) < Math.abs(base) ? cand : base;
            }, Infinity);

            const stem = [from.x, from.y, from.x, from.y + commonMiddle];

            for (const t of to) {
                const points = stem
                    .concat([t.x, from.y + commonMiddle, t.x, t.y])
                    .map((x, i) =>
                        i % 2 === 0 ? x + this.stageLeft : x + this.stageTop
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
                {this.stageWidth && this.stageHeight && (
                    <Stage width={this.stageWidth} height={this.stageHeight}>
                        <Layer>
                            {Object.keys(this.squareSizes).length !== 0 &&
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

class Tree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tree: testTree
        };
    }
    render() {
        return (
            <div className="tree-root">
                <List sequ={this.state.tree} />
                <Lines lines={this.state.tree.getLines()} />
            </div>
        );
    }
}

function Page(props) {
    return <Tree />;
}

export default Page;
