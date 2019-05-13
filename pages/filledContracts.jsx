import Link from "next/link";
import Menu from "../components/Layout";
import ScrollMenu from "../components/scrollMenu";

export default function admin() {
    return (
        <div>
            <div>
                <Menu />
            </div>
            <div>
                <ScrollMenu />
            </div>
        </div>
    );
}
