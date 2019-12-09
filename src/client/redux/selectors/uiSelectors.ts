import { RootState } from "../rootReducer";

export const getIsAutoScrollEnabled = (state: RootState) => {
    return state.ui.autoScrollEnabled;
};
