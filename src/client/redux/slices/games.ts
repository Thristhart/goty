import { getDataOrPrevious, LCE, lceContent, lceError, lceLoading, lceNotRequested } from "@model/LCE";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GBGame } from "../../../lib/giantbomb_model";

interface GamesByIdState {
    readonly [guid: string]: GBGame;
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
        getMoreGamesSuccess(state, action: PayloadAction<{ games: GBGame[]; contToken?: string }>) {
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
        setGame(state, action: PayloadAction<{ guid: string; game: GBGame }>) {
            const { guid, game } = action.payload;
            state[guid] = game;
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
