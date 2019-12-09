import { getDataOrPrevious, LCE, lceContent } from "@model/LCE";
import { GOTYGame } from "../../../lib/api_model";
import { RootState } from "../rootReducer";

export const getAllGamesContToken = (state: RootState) => {
    return state.allGames.contToken;
};

export const getHydratedGames = (state: RootState): LCE<GOTYGame[]> => {
    const games = getDataOrPrevious(state.allGames.games);
    if (!games) {
        return state.allGames.games as LCE<GOTYGame[]>;
    }
    return lceContent(games.map((gameId) => state.gamesById[gameId]));
};
