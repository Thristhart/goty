import config from "config";
import { getFromCacheOrNetwork, saveToCache } from "./cache";
import { GBGame, GBResponse } from "./giantbomb_model";

const API_KEY = config.get("GB_API_KEY");

const YEAR_START = "2019-01-01 00:00:00";
const YEAR_END = "2020-01-01 00:00:00";

const LIMIT = 100;

interface GetGamesOptions {
    offset: number;
}

export async function getGamesFromGiantbomb(options: GetGamesOptions) {
    const url = `https://www.giantbomb.com/api/games/?api_key=${API_KEY}&format=json&filter=original_release_date:${YEAR_START}|${YEAR_END}&offset=${options.offset}&limit=${LIMIT}`;

    const responseData: GBResponse<GBGame[]> = await getFromCacheOrNetwork(url);

    responseData.results.forEach((game) => {
        saveToCache(buildGameDetailUrl(game.guid), {
            error: "OK",
            results: game,
            status_code: 1,
        });
    });

    return responseData;
}

export async function getGameDetailFromGiantbomb(guid: string) {
    const response: GBResponse<GBGame> = await getFromCacheOrNetwork(buildGameDetailUrl(guid));
    return response.results;
}

function buildGameDetailUrl(guid: string) {
    return `https://www.giantbomb.com/api/game/${guid}/?api_key=${API_KEY}&format=json`;
}

export function generateContToken(offset: number) {
    return `?offset=${offset + LIMIT}`;
}
