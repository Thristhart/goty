import { call, put, takeLeading } from "redux-saga/effects";
import { getMyList } from "../../api/lists";
import { ListSlice } from "../slices/list";

export function* getList(action: ReturnType<typeof ListSlice.actions.getListStart>) {
    const response = yield call(getMyList);
    yield put(ListSlice.actions.getListSuccess(response));
}

export const listSaga = function*() {
    yield takeLeading(ListSlice.actions.getListStart.type, getList);
    yield put(ListSlice.actions.getListStart());
};
