import { isNotRequested } from "@model/LCE";
import { call, put, takeLatest, takeLeading } from "@redux-saga/core/effects";
import { getComparison } from "@redux/selectors/comparisonSelectors";
import { ComparisonSlice } from "@redux/slices/comparison";
import { LocationChangeAction, LOCATION_CHANGE } from "connected-react-router";
import { select } from "redux-saga/effects";
import { chooseGame, getNextComparison } from "../../api/comparison";

export function* getNextComparisonSaga(action: ReturnType<typeof ComparisonSlice.actions.getComparisonStart>) {
    const response = yield call(getNextComparison);
    yield put(ComparisonSlice.actions.getComparisonSuccess(response));
}

export function* chooseComparison(action: ReturnType<typeof ComparisonSlice.actions.chooseComparison>) {
    const nextChoice = yield call(chooseGame, action.payload.betterGame, action.payload.worseGame);
    yield put(ComparisonSlice.actions.getComparisonSuccess(nextChoice));
}

export function* fetchComparisonIfNonExists(action: LocationChangeAction) {
    if (action.payload.location.pathname === "/compare") {
        const currentComparison = yield select(getComparison);
        if (isNotRequested(currentComparison)) {
            yield put(ComparisonSlice.actions.getComparisonStart());
        }
    }
}

export const comparisonSaga = function*() {
    yield takeLeading(ComparisonSlice.actions.getComparisonStart.type, getNextComparisonSaga);
    yield takeLatest(ComparisonSlice.actions.chooseComparison.type, chooseComparison);
    yield takeLeading(LOCATION_CHANGE, fetchComparisonIfNonExists);
};
