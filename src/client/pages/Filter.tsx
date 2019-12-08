import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { List, ListRowProps } from "react-virtualized";
import { GBGame } from "../../lib/giantbomb_model";
import { Game } from "../components/Game";
import { CONTENT, LCE, LOADING } from "../model/LCE";
import { getHydratedGames } from "../redux/selectors/gamesSelectors";
import { LCERenderer } from "../util/lceRenderer";

const renderFilterRow = (games: GBGame[], props: ListRowProps) => {
    const game = games[props.index];
    return <Game game={game} key={game.id} style={props.style} />;
};
const ListView = (games: GBGame[]) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const setSizeFromContainer = () => {
        if (containerRef.current) {
            const measurement = containerRef.current.getBoundingClientRect();
            setSize({ width: measurement.width, height: measurement.height });
        }
    };
    useEffect(() => {
        setSizeFromContainer();
        window.addEventListener("resize", setSizeFromContainer);
        return () => {
            window.removeEventListener("resize", setSizeFromContainer);
        };
    }, []);
    return (
        <div ref={containerRef} className="listContainer">
            <List
                rowRenderer={renderFilterRow.bind(undefined, games)}
                rowHeight={180}
                rowCount={games.length}
                width={size.width}
                height={size.height}
            />
        </div>
    );
};
const renderContent = (content: CONTENT<GBGame[]>) => {
    return ListView(content.data);
};
const renderLoading = (content: LOADING<GBGame[]>) => {
    if (content.previousContent) {
        return ListView(content.previousContent.data);
    }
    return null;
};
const renderNull = () => {
    return null;
};
export const Filter = () => {
    const games: LCE<GBGame[]> = useSelector(getHydratedGames);
    return (
        <div id="filterPage">
            <section className="header">
                <h1>First, tell us which games you played this year.</h1>
                <p>
                    If a game you played isn't on the list, <a href="#">click here to add it.</a>
                </p>
            </section>
            <LCERenderer
                lce={games}
                content={renderContent}
                loading={renderLoading}
                error={renderNull}
                notRequested={renderNull}
            />
        </div>
    );
};
