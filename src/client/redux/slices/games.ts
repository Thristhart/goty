import { getDataOrPrevious, LCE, lceContent, lceError, lceLoading, lceNotRequested } from "@model/LCE";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GOTYGame } from "../../../lib/api_model";
import { ListSlice } from "./list";

interface GamesByIdState {
    readonly [id: number]: GOTYGame;
}
interface AllGamesState {
    readonly contToken?: string;
    readonly games: LCE<number[]>;
}
export const allGamesSlice = createSlice({
    name: "allGames",
    initialState: { games: lceNotRequested() } as AllGamesState,
    reducers: {
        startGetMoreGames(state) {
            state.games = lceLoading(state.games);
        },
        getMoreGamesSuccess(state, action: PayloadAction<{ games: GOTYGame[]; contToken?: string }>) {
            const existing = getDataOrPrevious<number[]>(state.games);
            const base = existing || [];
            state.games = lceContent(base.concat(action.payload.games.map((game) => game.id)));
            state.contToken = action.payload.contToken;
        },
        getMoreGamesError(state, action: PayloadAction<{ error: Error }>) {
            state.games = lceError(action.payload.error, state.games);
        },
    },
});
export const gamesByIdSlice = createSlice({
    name: "gamesById",
    initialState: {} as GamesByIdState,
    reducers: {
        setGame(state, action: PayloadAction<{ id: number; game: GOTYGame }>) {
            const { id, game } = action.payload;
            if (state[id]) {
                state[id] = { ...state[id], ...game };
            } else {
                state[id] = game;
            }
        },
        setHasPlayedGame(state, action: PayloadAction<{ id: number; hasPlayed: boolean }>) {
            if (state[action.payload.id]) {
                state[action.payload.id].hasPlayed = action.payload.hasPlayed;
            }
        },
    },
    extraReducers: (builder) =>
        builder
            .addCase(allGamesSlice.actions.getMoreGamesSuccess, (state, action) => {
                const { games } = action.payload;
                games.forEach((game) => {
                    const id = game.id;
                    if (state[id]) {
                        state[id] = { ...state[id], ...game };
                    } else {
                        state[id] = game;
                    }
                });
            })
            .addCase(ListSlice.actions.getListSuccess, (state, action) => {
                const listItems = action.payload;
                listItems.forEach((listItem) => {
                    state[listItem.gameId] = { ...listItem.gameDetails!, hasPlayed: listItem.played };
                });
            }),
});
