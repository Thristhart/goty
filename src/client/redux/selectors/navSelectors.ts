import { RootState } from "../rootReducer";

export const getPathname = (state: RootState) => {
    return state.router.location.pathname;
};
