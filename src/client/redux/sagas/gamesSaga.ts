import { call, put, select, takeLeading } from "@redux-saga/core/effects";
import { getAllGamesContToken } from "@redux/selectors/gamesSelectors";
import { allGamesSlice } from "@redux/slices/games";
import { getAllGames } from "../../api/games";

export function* getMoreGames(action: ReturnType<typeof allGamesSlice.actions.startGetMoreGames>) {
    const contToken = yield select(getAllGamesContToken);
    const response = yield call(getAllGames, contToken);
    yield put(allGamesSlice.actions.getMoreGamesSuccess(response));
}

export const gamesSaga = function*() {
    yield takeLeading(allGamesSlice.actions.startGetMoreGames.type, getMoreGames);
};
