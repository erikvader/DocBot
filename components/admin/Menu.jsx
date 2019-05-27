import Link from "next/link";

// margin for the links in the menu

class Menu extends React.Component {
    render() {
        return (
            <div className="menu-style">
                <style jsx>
                    {`
                        .menu-style {
                            float: left;
                            width: 25%;
                            padding: 1%;
                        }

                        .menu-style a {
                            marginright: 15;
                            background-color: #9accf9;
                            color: black;
                            display: block;
                            padding: 12px;
                            text-decoration: none;
                            border-radius: 25px;
                            opacity: 0.9;
                        }

                        .menu-style a:hover {
                            background-color: #ccc;
                        }
                    `}
                </style>
                <ul>
                    <Link href="/admin">
                        <a>Startsida</a>
                    </Link>
                </ul>
                <ul>
                    <Link href="/createContract">
                        <a>Skapa avtal</a>
                    </Link>
                </ul>
                <ul>
                    <Link href="/filledContracts">
                        <a>Ifyllda avtal</a>
                    </Link>
                </ul>
                <ul>
                    <Link href="/conditionManager">
                        <a>Villkorsskapare</a>
                    </Link>
                </ul>
            </div>
        );
    }
}
export default Menu;
