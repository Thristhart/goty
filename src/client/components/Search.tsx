import { CONTENT, LCE, lceContent, lceLoading, lceNotRequested } from "@model/LCE";
import { RootState } from "@redux/rootReducer";
import { getGameById } from "@redux/selectors/gamesSelectors";
import { gamesByIdSlice } from "@redux/slices/games";
import { ListSlice } from "@redux/slices/list";
import { LCERenderer } from "@util/lceRenderer";
import { GBGame } from "lib/giantbomb_model";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchGames } from "../api/games";
import { addItemToList } from "../api/lists";
import { buildDateFromGame } from "./Game";

let lastDebounceTimeout: number;
const debounce = (fn: () => void, duration: number) => {
    if (lastDebounceTimeout) {
        clearTimeout(lastDebounceTimeout);
    }
    lastDebounceTimeout = setTimeout(fn as TimerHandler, duration);
};

interface SearchGameProps {
    readonly game: GBGame;
    readonly addToList: (isNewGame: boolean) => void;
}
export const SearchGame = (props: SearchGameProps) => {
    const { game, addToList } = props;
    const releaseDate = buildDateFromGame(game);
    const gotyGame = useSelector((state: RootState) => getGameById(state, game.id));

    const hasPlayed = gotyGame && gotyGame.hasPlayed;

    return (
        <section className="searchGame">
            <img
                src={game.image.icon_url}
                alt={`image for ${game.name}`}
                className="gameImage"
                width={32}
                height={32}
            />
            <section className="searchGameInfo">
                <h3 className="title">{game.name}</h3>
                <span className="releaseDate">Released: {releaseDate.toLocaleDateString()}</span>
            </section>
            <section className="choices" data-played={hasPlayed}>
                <div className="buttonBackground" />
                <button
                    className={hasPlayed === undefined || hasPlayed ? "playedIt" : "notPlayedIt"}
                    onClick={addToList.bind(undefined, !gotyGame)}></button>
            </section>
        </section>
    );
};

const renderSearchResults = (addGameToList: (id: number, isNewGame: boolean) => void, content: CONTENT<GBGame[]>) => {
    const results = content.data;
    if (results.length === 0) {
        return <div id="searchResults">No results found.</div>;
    }
    return (
        <div id="searchResults">
            {results.map((game) => (
                <SearchGame game={game} addToList={addGameToList.bind(undefined, game.id)} key={"search" + game.id} />
            ))}
        </div>
    );
};

export const Search = () => {
    const [shouldShowInput, setShouldShowInput] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();

    const [results, setResults] = useState<LCE<GBGame[]>>(lceNotRequested());

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (searchInputRef.current) {
            debounce(async () => {
                if (searchInputRef.current) {
                    const query = searchInputRef.current.value;
                    if (query) {
                        setResults(lceLoading(results));
                        const apiResponse = await searchGames(query);
                        setResults(lceContent(apiResponse));
                    }
                }
            }, 500);
        }
    };
    const onBlur = () => {
        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.value = "";
            }
            setShouldShowInput(false);
            setResults(lceNotRequested());
        }, 300);
    };

    const addGameToList = async (id: number, isNewGame: boolean) => {
        if (isNewGame) {
            await addItemToList(id);
            dispatch(ListSlice.actions.getListStart());
        } else {
            dispatch(gamesByIdSlice.actions.setHasPlayedGame({ id, hasPlayed: true }));
        }
    };

    useEffect(() => {
        if (shouldShowInput) {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }
    }, [shouldShowInput]);

    if (shouldShowInput) {
        return (
            <>
                <input
                    id="search"
                    placeholder="Start typing to search the Giantbomb Wiki"
                    ref={searchInputRef}
                    onChange={onChange}
                    onBlur={onBlur}
                    autoComplete="off"></input>
                <LCERenderer
                    lce={results}
                    loading={() => <div id="searchResults">Searching...</div>}
                    content={renderSearchResults.bind(undefined, addGameToList)}
                    error={() => null}
                    notRequested={() => null}
                />
            </>
        );
    } else {
        return (
            <p>
                If a game you played isn't on the list,{" "}
                <a onClick={setShouldShowInput.bind(undefined, true)}>click here to add it to your list.</a>
            </p>
        );
    }
};
