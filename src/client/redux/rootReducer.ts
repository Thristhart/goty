import { connectRouter } from "connected-react-router";
import { combineReducers } from "redux";
import { history } from "./history";
import { ComparisonSlice } from "./slices/comparison";
import { allGamesSlice, gamesByIdSlice } from "./slices/games";
import { ListSlice } from "./slices/list";
import { UISlice } from "./slices/ui";

export const rootReducer = combineReducers({
    gamesById: gamesByIdSlice.reducer,
    allGames: allGamesSlice.reducer,
    ui: UISlice.reducer,
    list: ListSlice.reducer,
    comparison: ComparisonSlice.reducer,
    router: connectRouter(history),
});

export type RootState = ReturnType<typeof rootReducer>;
