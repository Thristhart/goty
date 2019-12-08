import { bootstrap } from "@redux/bootstrap";
import { allGamesSlice } from "@redux/slices/games";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Filter } from "./pages/Filter";

const store = bootstrap();

const App = () => {
    return (
        <Provider store={store}>
            <nav>
                <img src="./assets/goty_goat.png" className="site-icon" />
                <h1>GOTY.app</h1>
            </nav>
            <Filter />
        </Provider>
    );
};

store.dispatch(allGamesSlice.actions.startGetMoreGames());

ReactDOM.render(<App />, document.getElementById("app"));