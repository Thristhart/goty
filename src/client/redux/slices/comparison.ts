import { LCE, lceContent, lceError, lceLoading, lceNotRequested } from "@model/LCE";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Comparison {
    readonly leftGame: number;
    readonly rightGame: number;
}
interface ComparisonState {
    readonly currentComparison: LCE<Comparison>;
}

export const ComparisonSlice = createSlice({
    name: "comparison",
    initialState: {
        currentComparison: lceNotRequested(),
    } as ComparisonState,
    reducers: {
        getComparisonStart(state) {
            state.currentComparison = lceLoading(state.currentComparison);
        },
        getComparisonSuccess(state, action: PayloadAction<Comparison>) {
            state.currentComparison = lceContent(action.payload);
        },
        getListError(state, action: PayloadAction<{ err: Error }>) {
            state.currentComparison = lceError(action.payload.err, state.currentComparison);
        },
        chooseComparison(state, action: PayloadAction<{ betterGame: number; worseGame: number }>) {
            state.currentComparison = lceLoading(state.currentComparison);
        },
    },
});
