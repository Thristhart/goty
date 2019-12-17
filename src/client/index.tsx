import { bootstrap } from "@redux/bootstrap";
import { history } from "@redux/history";
import { ConnectedRouter } from "connected-react-router";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Redirect, Route, Switch } from "react-router";
import { Navigation } from "./components/Navigation";
import { Compare } from "./pages/Compare";
import { Filter } from "./pages/Filter";
import { Sort } from "./pages/Sort";

const store = bootstrap();

const App = () => {
    return (
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <Navigation />
                <Switch>
                    <Route exact path="/played" component={Filter} />
                    <Route exact path="/compare" component={Compare} />
                    <Route exact path="/sort" component={Sort} />
                    <Route>
                        <Redirect to="/played" />
                    </Route>
                </Switch>
            </ConnectedRouter>
        </Provider>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
