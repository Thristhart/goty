import React from "react";
import { GBGame } from "../../lib/giantbomb_model";

interface GameProps {
    readonly game: GBGame;
    readonly style: React.CSSProperties;
}
export const Game = (props: GameProps) => {
    const { game } = props;
    return (
        <section className="game" style={props.style}>
            <div className="gameGradient" />
            <img src={game.image.original_url} className="gameImage" />
            <section className="gameInfo">
                <h3 className="title">{game.name}</h3>
                <h4 className="platforms">{game.platforms.map((platform) => platform.name).join(", ")}</h4>
                <a href={game.site_detail_url} target="_blank">
                    {game.site_detail_url}
                </a>
            </section>
            <section className="choices">
                <button>Played it</button>
                <button>Haven't played it</button>
            </section>
        </section>
    );
};
