import { getDataOrPrevious, isLoading, LCE, lceContent, lceLoading } from "@model/LCE";
import { buildDateFromGame } from "client/components/Game";
import { GOTYGame } from "../../../lib/api_model";
import { RootState } from "../rootReducer";

export const getAllGamesContToken = (state: RootState) => {
    return state.allGames.contToken;
};

export const getHydratedGames = (state: RootState): LCE<GOTYGame[]> => {
    const games = getDataOrPrevious(state.list);
    if (!games) {
        return state.allGames.games as LCE<GOTYGame[]>;
    }
    const hydratedGames = games
        .map((gameId) => state.gamesById[gameId])
        .sort((a, b) => buildDateFromGame(a).getTime() - buildDateFromGame(b).getTime());
    const hydratedGamesContent = lceContent(hydratedGames);
    if (isLoading(state.allGames.games)) {
        return lceLoading(hydratedGamesContent);
    }
    return hydratedGamesContent;
};
