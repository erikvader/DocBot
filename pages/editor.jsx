const testTree = [
    {text: "0", color: "orange"},
    {text: "1", color: "pink"},
    [
        [{text: "2", color: "purple"}],
        [{text: "3", color: "pink"}],
        [
            {text: "4", color: "red"},
            [[{text: "5", color: "red"}], [{text: "6", color: "lime"}]]
        ]
    ],
    {text: "7", color: "green"}
];

class List extends React.Component {
    constructor(props) {
        super(props);
        this.horizontal =
            "horizontal" in this.props ? this.props.horizontal : false;
    }
    renderChild(c, i) {
        if (Array.isArray(c)) {
            return <List key={i} horizontal={!this.horizontal} list={c} />;
        } else {
            return <Square key={i} info={c} />;
        }
    }
    render() {
        const hori = this.horizontal;
        return (
            <div>
                {this.props.list.map(this.renderChild.bind(this))}
                <style jsx>
                    {`
                        div {
                            display: flex;
                            flex-direction: ${hori ? "row" : "column"};
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
            <div>
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
    return <List list={testTree} />;
}

export default Page;
