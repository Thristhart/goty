import React from "react";
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
    return (
        <List
            rowRenderer={renderFilterRow.bind(undefined, games)}
            rowHeight={360}
            rowCount={games.length}
            width={window.innerWidth}
            height={window.innerHeight}
        />
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
        <LCERenderer
            lce={games}
            content={renderContent}
            loading={renderLoading}
            error={renderNull}
            notRequested={renderNull}
        />
    );
};
