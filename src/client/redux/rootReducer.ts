import { combineReducers } from "redux";
import { allGamesSlice, gamesByIdSlice } from "./slices/games";
import { ListSlice } from "./slices/list";
import { UISlice } from "./slices/ui";

export const rootReducer = combineReducers({
    gamesById: gamesByIdSlice.reducer,
    allGames: allGamesSlice.reducer,
    ui: UISlice.reducer,
    list: ListSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
