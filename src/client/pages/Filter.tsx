import { UISlice } from "@redux/slices/ui";
import { GOTYGame } from "lib/api_model";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { List, ListRowProps, ScrollParams } from "react-virtualized";
import { Game } from "../components/Game";
import { CONTENT, LCE, LOADING } from "../model/LCE";
import { getHydratedGames } from "../redux/selectors/gamesSelectors";
import { getIsAutoScrollEnabled } from "../redux/selectors/uiSelectors";
import { LCERenderer } from "../util/lceRenderer";
import { useAnimationFrame } from "../util/useAnimationFrame";

const renderFilterRow = (games: GOTYGame[], props: ListRowProps) => {
    const game = games[props.index];
    return <Game game={game} key={game.id} style={props.style} index={props.index} />;
};
interface RowRenderInfo {
    overscanStartIndex: number;
    overscanStopIndex: number;
    startIndex: number;
    stopIndex: number;
}
function lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
}
const ListView = (games: GOTYGame[]) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<List>(null);
    const isAutoScrollEnabled = useSelector(getIsAutoScrollEnabled);

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
    const lastRowRenderInfo = useRef<RowRenderInfo>();
    // this is a stupid hack to get around over-aggressive callback memoization on List
    const gamesRef = useRef<GOTYGame[]>(games);
    gamesRef.current = games;

    const currentScrollPosition = useRef<number>(0);
    const onScroll = (params: ScrollParams) => {
        currentScrollPosition.current = params.scrollTop;
    };

    const scrollAnimationStartTimestamp = useRef<number>(0);
    const scrollAnimationStartPosition = useRef<number>(0);
    const scrollAnimationEndScrollPosition = useRef<number>(0);
    const [startScrollAnimation, stopScrollAnimation] = useAnimationFrame((timestamp) => {
        const dt = timestamp - scrollAnimationStartTimestamp.current;
        let t = dt / 75;
        if (t > 1) {
            t = 1;
        }
        listRef.current!.scrollToPosition(
            lerp(scrollAnimationStartPosition.current, scrollAnimationEndScrollPosition.current, t)
        );
        if (t >= 1) {
            stopScrollAnimation();
        }
    });

    const scrollToIndexAnimated = (index: number) => {
        if (listRef.current) {
            scrollAnimationStartPosition.current = currentScrollPosition.current;
            scrollAnimationEndScrollPosition.current = listRef.current.getOffsetForRow({ index });
            scrollAnimationStartTimestamp.current = performance.now();
            startScrollAnimation();
        }
    };

    const goToNext = (event: Event) => {
        if (isAutoScrollEnabled) {
            if (listRef.current && lastRowRenderInfo.current) {
                const beginningOfVisibleList = lastRowRenderInfo.current.startIndex;
                const nextUnansweredItemIndex =
                    gamesRef.current.slice(beginningOfVisibleList).findIndex((game) => game.hasPlayed === undefined) +
                    beginningOfVisibleList;
                if (nextUnansweredItemIndex < lastRowRenderInfo.current.stopIndex) {
                    scrollToIndexAnimated(
                        lastRowRenderInfo.current.stopIndex + (nextUnansweredItemIndex - beginningOfVisibleList)
                    );
                } else {
                    scrollToIndexAnimated(nextUnansweredItemIndex);
                }
            }
        }
    };
    const onRowsRendered = (info: RowRenderInfo) => {
        lastRowRenderInfo.current = info;
    };
    useEffect(() => {
        window.addEventListener("goToNext", goToNext);
        return () => {
            window.removeEventListener("goToNext", goToNext);
        };
    }, [isAutoScrollEnabled]);

    return (
        <div ref={containerRef} className="listContainer">
            <List
                rowRenderer={renderFilterRow.bind(undefined, games)}
                rowHeight={180}
                rowCount={games.length}
                width={size.width}
                height={size.height}
                ref={listRef}
                onRowsRendered={onRowsRendered}
                onScroll={onScroll}
                tabIndex={-1}
            />
        </div>
    );
};
const renderContent = (content: CONTENT<GOTYGame[]>) => {
    return ListView(content.data);
};
const renderLoading = (content: LOADING<GOTYGame[]>) => {
    if (content.previousContent) {
        return ListView(content.previousContent.data);
    }
    return null;
};
const renderNull = () => {
    return null;
};
export const Filter = () => {
    const games: LCE<GOTYGame[]> = useSelector(getHydratedGames);
    const isAutoScrollEnabled = useSelector(getIsAutoScrollEnabled);
    const dispatch = useDispatch();
    const onIsAutoScrollEnabledCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(UISlice.actions.setAutoScrollEnabled(event.target.checked));
    };
    return (
        <div id="filterPage">
            <section className="header">
                <h1>First, tell us which games you played this year.</h1>
                <p>
                    If a game you played isn't on the list, <a href="#">click here to add it to your list.</a>
                </p>
                <p>
                    <label htmlFor="autoScrollEnabled">
                        <input
                            type="checkbox"
                            id="autoScrollEnabled"
                            defaultChecked={isAutoScrollEnabled}
                            onChange={onIsAutoScrollEnabledCheckboxChange}
                        />
                        Check to enable auto-scrolling
                    </label>
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
