import { getDataOrPrevious, LCE, lceContent, lceError, lceLoading, lceNotRequested } from "@model/LCE";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GOTYGame } from "../../../lib/api_model";

interface GamesByIdState {
    readonly [guid: string]: GOTYGame;
}
interface AllGamesState {
    readonly contToken?: string;
    readonly games: LCE<string[]>;
}
export const allGamesSlice = createSlice({
    name: "allGames",
    initialState: { games: lceNotRequested() } as AllGamesState,
    reducers: {
        startGetMoreGames(state) {
            state.games = lceLoading(state.games);
        },
        getMoreGamesSuccess(state, action: PayloadAction<{ games: GOTYGame[]; contToken?: string }>) {
            const existing = getDataOrPrevious<string[]>(state.games);
            const base = existing || [];
            state.games = lceContent(base.concat(action.payload.games.map((game) => game.guid)));
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
        setGame(state, action: PayloadAction<{ guid: string; game: GOTYGame }>) {
            const { guid, game } = action.payload;
            state[guid] = game;
        },
        setHasPlayedGame(state, action: PayloadAction<{ guid: string; hasPlayed: boolean }>) {
            if (state[action.payload.guid]) {
                state[action.payload.guid].hasPlayed = action.payload.hasPlayed;
            }
        },
    },
    extraReducers: (builder) =>
        builder.addCase(allGamesSlice.actions.getMoreGamesSuccess, (state, action) => {
            const { games } = action.payload;
            games.forEach((game) => {
                state[game.guid] = game;
            });
        }),
});
