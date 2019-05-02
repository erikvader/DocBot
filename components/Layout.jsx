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
    <div style={menuStyle}>
        <ul>
            <Link href="/">
                <a style={linkStyle}>Startsida</a>
            </Link>
        </ul>
        <ul>
            <Link href="/create contract">
                <a style={linkStyle}>Skapa avtal</a>
            </Link>
        </ul>
        <ul>
            <Link href="/filledContracts">
                <a style={linkStyle}>Ifyllda avtal</a>
            </Link>
        </ul>
        <ul>
            <Link href="/condition manager">
                <a style={linkStyle}>Villkorsskapare</a>
            </Link>
        </ul>
    </div>
);

export default Menu;
