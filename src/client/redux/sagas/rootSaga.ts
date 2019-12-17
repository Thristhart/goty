import { Saga, SagaMiddleware } from "redux-saga";
import { comparisonSaga } from "./comparisonSaga";
import { gamesSaga } from "./gamesSaga";
import { listSaga } from "./listSaga";

const sagas: Saga[] = [gamesSaga, listSaga, comparisonSaga];

export function runSagas(middleware: SagaMiddleware) {
    sagas.forEach((saga) => {
        middleware.run(saga);
    });
}
