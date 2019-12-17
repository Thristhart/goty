import { CONTENT, ERROR, LOADING } from "@model/LCE";
import { RootState } from "@redux/rootReducer";
import { getGameById } from "@redux/selectors/gamesSelectors";
import { LCERenderer } from "@util/lceRenderer";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getComparison } from "../redux/selectors/comparisonSelectors";
import { Comparison, ComparisonSlice } from "../redux/slices/comparison";

interface ComparisonGameProps {
    id: number;
    onPress: () => void;
}
const ComparisonGame = (props: ComparisonGameProps) => {
    const game = useSelector((state: RootState) => getGameById(state, props.id))!;

    return (
        <button className="comparisonGame" onClick={props.onPress}>
            <div className="gameGradient" />
            <picture className="gamePicture">
                <source media="(max-width: 640px)" srcSet={game.image.medium_url} />
                <img src={game.image.original_url} alt={`image for ${game.name}`} className="gameImage" />
            </picture>
            <section className="gameInfo">
                <h3 className="title">{game.name}</h3>
                <span className="platforms">{game.platforms.map((platform) => platform.name).join(", ")}</span>
            </section>
        </button>
    );
};

const renderContent = (content: CONTENT<Comparison>) => {
    const left = content.data.leftGame;
    const right = content.data.rightGame;

    const dispatch = useDispatch();

    const leftBetter = () => dispatch(ComparisonSlice.actions.chooseComparison({ betterGame: left, worseGame: right }));
    const rightBetter = () =>
        dispatch(ComparisonSlice.actions.chooseComparison({ betterGame: right, worseGame: left }));
    return (
        <>
            <h1 className="question">Which game is higher on your list?</h1>
            <div id="comparison">
                <ComparisonGame id={left} onPress={leftBetter} />
                <span className="or">OR</span>
                <ComparisonGame id={right} onPress={rightBetter} />
            </div>
        </>
    );
};

const slowLoadMessages = [
    "This one is tricky...",
    "What next...?",
    "There were a lot of games this year...",
    "How about...?",
    "Still figuring it out...",
    "That was quite an answer you gave...",
    "Sifting through your possible lists...",
    "Reticulating splines...",
];
const renderLoading = (content: LOADING<Comparison>) => {
    const [message, setMessage] = useState("Determining the best comparison...");
    useEffect(() => {
        const slowLoadTimer = setInterval(() => {
            const curIndex = slowLoadMessages.indexOf(message);
            let nextIndex = curIndex + 1;
            if (nextIndex >= slowLoadMessages.length) {
                nextIndex = 0;
            }
            setMessage(slowLoadMessages[nextIndex]);
        }, 2500);

        return () => {
            clearInterval(slowLoadTimer);
        };
    }, [message]);
    return (
        <>
            <h1 className="question">{message}</h1>
            <div id="loader" className={message !== "Determining the best comparison..." ? "visible" : "hidden"}>
                <div className="loader-paddle-left"></div>
                <div className="loader-paddle-right"></div>
                <div className="loader-ball"></div>
            </div>
        </>
    );
};

const renderError = (content: ERROR<Comparison>) => {
    return <span>{content.error.message}</span>;
};

const renderNotRequested = () => {
    return null;
};

export const Compare = () => {
    const comparison = useSelector(getComparison);

    return (
        <div id="comparisonPage">
            <LCERenderer
                lce={comparison}
                content={renderContent}
                loading={renderLoading}
                error={renderError}
                notRequested={renderNotRequested}
            />
        </div>
    );
};
// when adding a new game to the list after candidates already exists, insert it randomly into each candidate
