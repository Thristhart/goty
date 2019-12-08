import React from "react";
import { GBGame } from "../../lib/giantbomb_model";

interface GameProps {
    readonly game: GBGame;
    readonly style: React.CSSProperties;
}

const background = {
    background: "black",
} as const;

const imageStyle = {
    width: "80%",
    height: "100%",
    position: "absolute",
    top: 0,
    right: 0,
    objectFit: "contain",
} as const;
const nameStyle = {
    position: "absolute",
    fontFamily: '"San Francisco","Roboto","Segoe UI", sans-serif',
    color: "white",
    bottom: 0,
    left: 0,
} as const;
const gradientOverlayStyle = {
    background: "linear-gradient(transparent 90%, black), linear-gradient(to right, black 20%, transparent 46%)",
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
} as const;
export const Game = (props: GameProps) => {
    const { game } = props;
    return (
        <section style={{ ...background, ...props.style }}>
            <a href={game.site_detail_url} target="_blank">
                <img src={game.image.screen_large_url} style={imageStyle} />
                <div style={gradientOverlayStyle} />
            </a>
            <h3 style={nameStyle}>{game.name}</h3>
        </section>
    );
};
