import { Saga, SagaMiddleware } from "redux-saga";
import { gamesSaga } from "./gamesSaga";

const sagas: Saga[] = [gamesSaga];

export function runSagas(middleware: SagaMiddleware) {
    sagas.forEach((saga) => {
        middleware.run(saga);
    });
}
