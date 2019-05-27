import Menu from "./Menu";

const layoutStyle = {
    margin: 20,
    padding: 20,
    border: "1px solid #DDD"
};

const test = {
    background: "red"
};

const Layout = props => (
    <div style={test}>
        <div>
            <Menu />
            {props.children}
        </div>
        <style jsx>
            {`
                body {
                    background: red;
                }
            `}
        </style>
    </div>
);

export default Layout;
