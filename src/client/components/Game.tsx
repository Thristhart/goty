import { gamesByIdSlice } from "@redux/slices/games";
import React from "react";
import { useDispatch } from "react-redux";
import { GOTYGame } from "../../lib/api_model";

interface GameProps {
    readonly game: GOTYGame;
    readonly style: React.CSSProperties;
    readonly index: number;
}

export function buildDateFromGame(game: GOTYGame) {
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
            <picture className="gamePicture">
                <source media="(max-width: 640px)" srcSet={game.image.icon_url} />
                <a href={game.site_detail_url} target="_blank">
                    <img src={game.image.original_url} alt={`image for ${game.name}`} className="gameImage" />
                </a>
            </picture>
            <section className="gameInfo">
                <h3 className="title">{game.name}</h3>
                <span className="platforms">{game.platforms.map((platform) => platform.name).join(", ")}</span>
                <a className="gburl" href={game.site_detail_url} target="_blank">
                    View on Giantbomb
                </a>
                <span className="releaseDate">Released: {releaseDate.toLocaleDateString()}</span>
            </section>
            <section className="choices" data-played={game.hasPlayed}>
                <div className="buttonBackground" />
                <button className="playedIt" onClick={setHasPlayed.bind(undefined, true)}></button>
                <button className="notPlayedIt" onClick={setHasPlayed.bind(undefined, false)}></button>
            </section>
        </section>
    );
};
