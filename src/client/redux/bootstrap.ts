import { routerMiddleware } from "connected-react-router";
import { applyMiddleware, createStore, StoreEnhancer } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import createSagaMiddleware from "redux-saga";
import { history } from "./history";
import { rootReducer } from "./rootReducer";
import { runSagas } from "./sagas/rootSaga";

export function bootstrap() {
    const sagaMiddleware = createSagaMiddleware();

    let middleware: StoreEnhancer = applyMiddleware(sagaMiddleware, routerMiddleware(history));

    middleware = composeWithDevTools({
        name: "goty",
    })(middleware);

    const store = createStore(rootReducer, middleware);

    runSagas(sagaMiddleware);

    return store;
}
