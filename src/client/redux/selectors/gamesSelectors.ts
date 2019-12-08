import { getDataOrPrevious, LCE, lceContent } from "@model/LCE";
import { GBGame } from "lib/giantbomb_model";
import { RootState } from "../rootReducer";

export const getAllGamesContToken = (state: RootState) => {
    return state.allGames.contToken;
};

export const getHydratedGames = (state: RootState): LCE<GBGame[]> => {
    const games = getDataOrPrevious(state.allGames.games);
    if (!games) {
        return state.allGames.games as LCE<GBGame[]>;
    }
    return lceContent(games.map((gameId) => state.gamesById[gameId]));
};
