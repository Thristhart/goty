export type VALID_CONTENT = null | object | boolean | number | string;
export type PREVIOUS_CONTENT<T extends VALID_CONTENT> = Readonly<{
    previousContent?: CONTENT<T>;
}>;

export type NOT_REQUESTED<T extends VALID_CONTENT> = Readonly<{ notRequested: true }>;

export type LOADING<T extends VALID_CONTENT> = Readonly<{
    loading: true;
}> &
    PREVIOUS_CONTENT<T>;

export type CONTENT<T extends VALID_CONTENT> = Readonly<{
    data: T;
}>;

export type ERROR<T extends VALID_CONTENT> = Readonly<{
    error: Error;
}> &
    PREVIOUS_CONTENT<T>;

export type LCE<T extends VALID_CONTENT> = NOT_REQUESTED<T> | LOADING<T> | CONTENT<T> | ERROR<T>;

/**
 * Returns an instance of @type NOT_REQUESTED.
 */
export function lceNotRequested<T extends VALID_CONTENT>(): NOT_REQUESTED<T> {
    return { notRequested: true };
}

/**
 * Returns an instance of @type LOADING, with optional previousState.
 * @param previousState Optional LCE value for previous state. Any previous content value will be carried through.
 */
export function lceLoading<T extends VALID_CONTENT>(previousState?: LCE<T>): LOADING<T> {
    if (previousState && isContent<T>(previousState)) {
        return {
            loading: true,
            previousContent: previousState,
        };
    } else if (previousState && "previousContent" in previousState) {
        return {
            loading: true,
            previousContent: previousState.previousContent,
        };
    } else {
        return {
            loading: true,
        };
    }
}

/**
 * Returns an instance of @type CONTENT with @param data.
 * @param data The data for the CONTENT
 */
export function lceContent<T extends VALID_CONTENT>(data: T): CONTENT<T> {
    return {
        data,
    };
}

/**
 * Returns an instance of @type ERROR.
 * @param error The error associated with fetching/hydrating the data.
 * @param previousState Optional previous state. Any previous content value will be carried through.
 */
export function lceError<T extends VALID_CONTENT>(error: Error, previousState?: LCE<T>): ERROR<T> {
    if (previousState && isContent<T>(previousState)) {
        return {
            error,
            previousContent: previousState,
        };
    } else if (previousState && "previousContent" in previousState) {
        return {
            error,
            previousContent: previousState.previousContent,
        };
    } else {
        return {
            error,
        };
    }
}

/**
 * Returns whether or not @param x is an instance of @type NOT_REQUESTED.
 */
export const isNotRequested = <T extends VALID_CONTENT>(x: LCE<T>): x is NOT_REQUESTED<T> =>
    "notRequested" in x && x.notRequested;

/**
 * Returns whether or not @param x is an instance of @type LOADING.
 */
export const isLoading = <T extends VALID_CONTENT>(x: LCE<T>): x is LOADING<T> => "loading" in x && x.loading;

/**
 * Returns whether or not @param x is an instance of @type ERROR.
 */
export const isError = <T extends VALID_CONTENT>(x: LCE<T>): x is ERROR<T> =>
    "error" in x && typeof x.error === "object";

/**
 * Returns whether or not @param x is an instance of @type CONTENT.
 */
export const isContent = <T extends VALID_CONTENT>(x: LCE<T>): x is CONTENT<T> => "data" in x;

/**
 * Returns the current data if exists, previous data if exists or undefined.
 */
export const getDataOrPrevious = <T extends VALID_CONTENT>(val: LCE<T>): T | undefined => {
    if (isContent<T>(val)) {
        return val.data;
    } else if (isError<T>(val) || isLoading<T>(val)) {
        return val.previousContent && val.previousContent.data;
    } else {
        return undefined;
    }
};

type OptionsMap<T extends VALID_CONTENT, R> = {
    notRequested: () => R;
    loading: (lce: LOADING<T>) => R;
    content: (lce: CONTENT<T>) => R;
    error: (lce: ERROR<T>) => R;
};

/**
 * Runs the function in @param options that matches the state of @param lce.
 */
export function lceSelect<T extends VALID_CONTENT, R>(lce: LCE<T>, options: OptionsMap<T, R>): R {
    if (isNotRequested(lce)) {
        return options.notRequested();
    } else if (isLoading<T>(lce)) {
        return options.loading(lce);
    } else if (isContent<T>(lce)) {
        return options.content(lce);
    } else if (isError<T>(lce)) {
        return options.error(lce);
    }

    // this should never happen
    throw new Error(`LCEselect recieved a non-LCE value ${lce}`);
}
