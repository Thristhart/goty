import { push } from "connected-react-router";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getPathname } from "../redux/selectors/navSelectors";

export const Navigation = () => {
    const pathname = useSelector(getPathname);
    const dispatch = useDispatch();

    const nav = (path: string) => {
        return (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            dispatch(push(path));
            event.preventDefault();
        };
    };

    return (
        <nav>
            <img src="./assets/goty_goat.png" className="site-icon" />
            <h1>GOTY.app</h1>
            <ul>
                <li className={pathname === "/played" ? "selected" : undefined}>
                    <Link to="/played">Find games</Link>
                </li>
                <li className={pathname === "/compare" ? "selected" : undefined}>
                    <Link to="/compare">Compare games</Link>
                </li>
                <li className={pathname === "/sort" ? "selected" : undefined}>
                    <Link to="/sort">Sort your list</Link>
                </li>
            </ul>
        </nav>
    );
};
