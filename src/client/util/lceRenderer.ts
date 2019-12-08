import { CONTENT, ERROR, LCE, lceSelect, LOADING, VALID_CONTENT } from "@model/LCE";

interface ILCERendererProps<T extends VALID_CONTENT> {
    lce: LCE<T>;
    loading: (loadingData: LOADING<T>) => JSX.Element | null;
    error: (errorData: ERROR<T>) => JSX.Element | null;
    content: (contentData: CONTENT<T>) => JSX.Element | null;
    notRequested: () => JSX.Element | null;
}
type LCERendererProps<T extends VALID_CONTENT> = Readonly<ILCERendererProps<T>>;

export const LCERenderer = <T extends VALID_CONTENT>(props: LCERendererProps<T>) => {
    const { lce, ...renderFuncs } = props;

    return lceSelect(lce, renderFuncs);
};
