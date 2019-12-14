import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ListState {}
export const ListSlice = createSlice({
    name: "list",
    initialState: {} as ListState,
    reducers: {
        getListStart(state) {},
        getListSuccess(state, action: PayloadAction<{ gameId: number; played: boolean }[]>) {},
        getListError() {},
    },
});
