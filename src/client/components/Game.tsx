import { gamesByIdSlice } from "@redux/slices/games";
import React from "react";
import { useDispatch } from "react-redux";
import { GOTYGame } from "../../lib/api_model";

interface GameProps {
    readonly game: GOTYGame;
    readonly style: React.CSSProperties;
    readonly index: number;
}

function buildDateFromGame(game: GOTYGame) {
    if (game.original_release_date) {
        return new Date(game.original_release_date);
    }
    return new Date(game.expected_release_year!, game.expected_release_month! - 1, game.expected_release_day!);
}
export const Game = (props: GameProps) => {
    const { game, index } = props;
    const dispatch = useDispatch();
    const setHasPlayed = (hasPlayed: boolean) => {
        dispatch(gamesByIdSlice.actions.setHasPlayedGame({ id: game.id, hasPlayed }));
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent("goToNext", { detail: index }));
        }, 200);
    };
    const releaseDate = buildDateFromGame(game);
    return (
        <section className="game" style={props.style}>
            <div className="gameGradient" />
            <img src={game.image.original_url} className="gameImage" />
            <section className="gameInfo">
                <h3 className="title">{game.name}</h3>
                <span className="platforms">{game.platforms.map((platform) => platform.name).join(", ")}</span>
                <a href={game.site_detail_url} target="_blank">
                    {game.site_detail_url}
                </a>
                <span className="releaseDate">Released: {releaseDate.toLocaleDateString()}</span>
            </section>
            <section className="choices" data-played={game.hasPlayed}>
                <div className="buttonBackground" />
                <button id="playedIt" onClick={setHasPlayed.bind(undefined, true)}>
                    PLAYED IT
                </button>
                <button id="notPlayedIt" onClick={setHasPlayed.bind(undefined, false)}>
                    HAVEN'T PLAYED IT
                </button>
            </section>
        </section>
    );
};
