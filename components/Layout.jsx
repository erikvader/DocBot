import Link from "next/link";

// margin for the links in the menu
const linkStyle = {
    marginRight: 15
};

//Styling for the menu

const menuStyle = {
    float: "left",
    width: "25%",
    padding: "1%",
    border: "solid"
};

const Menu = () => (
    <div className="menu-style">
        <style jsx>
            {`
                .menu-style {
                    float: left;
                    width: 25%;
                    padding: 1%;
                    border: solid;
                }
            `}
        </style>
        <ul>
            <Link href="/admin">
                <a style={linkStyle}>Startsida</a>
            </Link>
        </ul>
        <ul>
            <Link href="/createContract">
                <a style={linkStyle}>Skapa avtal</a>
            </Link>
        </ul>
        <ul>
            <Link href="/filledContracts">
                <a style={linkStyle}>Ifyllda avtal</a>
            </Link>
        </ul>
        <ul>
            <Link href="/conditionManager">
                <a style={linkStyle}>Villkorsskapare</a>
            </Link>
        </ul>
    </div>
);

export default Menu;
