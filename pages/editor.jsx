import {SteppedLineTo} from "react-lineto";

let global_id = 0;

class Node {
    constructor(text, color = "pink") {
        this.id = global_id;
        global_id++;
        this.text = text;
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
                    <List sequ={x} />
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
        const hori = this.horizontal;
        const lines = [];
        const children = [];
        let last = null;

        for (const x of this.props.sequ.list) {
            if (x instanceof Choice) {
                if (last) {
                    for (const e of x.getEntering()) {
                        lines.push(
                            <SteppedLineTo
                                from={`square-${last.id}`}
                                to={`square-${e.id}`}
                            />
                        );
                    }
                }
                children.push(<HoriList choice={x} />);
            } else {
                if (last) {
                    if (last instanceof Choice) {
                        for (const e of last.getLeaving()) {
                            lines.push(
                                <SteppedLineTo
                                    from={`square-${x.id}`}
                                    to={`square-${e.id}`}
                                />
                            );
                        }
                    } else {
                        lines.push(
                            <SteppedLineTo
                                from={`square-${last.id}`}
                                to={`square-${x.id}`}
                            />
                        );
                    }
                }
                children.push(<Square key={x.id} info={x} />);
            }
            last = x;
        }

        // TODO: react-lineto doesn't work on server rendered applications.
        //       process.browser is a workaround, create own component
        //       that uses componentDidMount or something
        return (
            <div className="list-container">
                {children}
                {process.browser ? lines : null}
                <div className="anchor" />
                <style jsx>
                    {`
                        .list-container {
                            display: flex;
                            flex-direction: column;
                        }
                        .anchor {
                            margin-top: auto;
                            width: 100%;
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
            <div className={`square-${this.props.info.id}`}>
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

function Page(props) {
    return <List sequ={testTree} />;
}

export default Page;
