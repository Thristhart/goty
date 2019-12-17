import { RootState } from "../rootReducer";

export const getComparison = (state: RootState) => {
    return state.comparison.currentComparison;
};
