import { Saga, SagaMiddleware } from "redux-saga";
import { gamesSaga } from "./gamesSaga";
import { listSaga } from "./listSaga";

const sagas: Saga[] = [gamesSaga, listSaga];

export function runSagas(middleware: SagaMiddleware) {
    sagas.forEach((saga) => {
        middleware.run(saga);
    });
}
