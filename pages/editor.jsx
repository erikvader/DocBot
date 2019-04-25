import {Tree, Sequence, Choice, Node} from "../components/Tree";

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

function Page(props) {
    return <Tree tree={testTree} />;
}

export default Page;
