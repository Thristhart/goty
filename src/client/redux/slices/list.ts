import { LCE, lceContent, lceError, lceLoading, lceNotRequested } from "@model/LCE";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ListItem } from "routes/api/lists";

type ListState = LCE<number[]>;

export const ListSlice = createSlice({
    name: "list",
    initialState: lceNotRequested() as ListState,
    reducers: {
        getListStart(state) {
            return lceLoading(state);
        },
        getListSuccess(state, action: PayloadAction<ListItem[]>) {
            return lceContent(action.payload.map((listItem) => listItem.gameId));
        },
        getListError(state, action: PayloadAction<{ err: Error }>) {
            return lceError(action.payload.err, state);
        },
    },
});
