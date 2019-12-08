import { combineReducers } from "redux";
import { allGamesSlice, gamesByIdSlice } from "./slices/games";

export const rootReducer = combineReducers({
    gamesById: gamesByIdSlice.reducer,
    allGames: allGamesSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
