import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    autoScrollEnabled: boolean;
}
export const UISlice = createSlice({
    name: "UI",
    initialState: { autoScrollEnabled: false } as UIState,
    reducers: {
        setAutoScrollEnabled(state, action: PayloadAction<boolean>) {
            state.autoScrollEnabled = action.payload;
        },
    },
});
