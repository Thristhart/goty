import { call, put, select, takeLatest, takeLeading } from "@redux-saga/core/effects";
import { getAllGamesContToken } from "@redux/selectors/gamesSelectors";
import { allGamesSlice, gamesByIdSlice } from "@redux/slices/games";
import { getAllGames } from "../../api/games";
import { setListItem } from "../../api/lists";

export function* getMoreGames(action: ReturnType<typeof allGamesSlice.actions.startGetMoreGames>) {
    const contToken = yield select(getAllGamesContToken);
    const response = yield call(getAllGames, contToken);
    yield put(allGamesSlice.actions.getMoreGamesSuccess(response));
}

export function* setHasPlayedGame(action: ReturnType<typeof gamesByIdSlice.actions.setHasPlayedGame>) {
    yield call(setListItem, action.payload.guid, action.payload.hasPlayed);
}

export const gamesSaga = function*() {
    yield takeLeading(allGamesSlice.actions.startGetMoreGames.type, getMoreGames);
    yield takeLatest(gamesByIdSlice.actions.setHasPlayedGame.type, setHasPlayedGame);
};
