import config from "config";
import fetch, { Response } from "node-fetch";
import { getFromCacheOrNetwork, saveToCache } from "./cache";
import { GBGame, GBResponse } from "./giantbomb_model";

const API_KEY = config.get("GB_API_KEY");

const YEAR_START = "2019-01-01 00:00:00";
const YEAR_END = "2020-01-01 00:00:00";

const LIMIT = 100;
const SEARCH_LIMIT = 5;

interface GetGamesOptions {
    offset: number;
}
const gbRequestQueue: (() => void)[] = [];
const makeGbRequest = (url: string) => {
    return new Promise<Response>((resolve) => {
        gbRequestQueue.push(() => resolve(fetch(url)));
    });
};
setInterval(() => {
    const nextRequest = gbRequestQueue.shift();
    if (nextRequest) {
        nextRequest();
    }
}, 1000);

export async function getGamesFromGiantbomb(options: GetGamesOptions) {
    const url = `https://www.giantbomb.com/api/games/?api_key=${API_KEY}&format=json&filter=original_release_date:${YEAR_START}|${YEAR_END}&sort=original_release_date:asc&offset=${options.offset}&limit=${LIMIT}`;

    const responseData: GBResponse<GBGame[]> = await getFromCacheOrNetwork(url, makeGbRequest);

    responseData.results = responseData.results.filter((game) => {
        if (!game.platforms) {
            return false;
        }
        // no release
        if (!game.expected_release_year && !game.original_release_date) {
            return false;
        }
        // year, but no original release and nothing more specific than the month, suggests never released
        if (
            game.expected_release_year &&
            !game.original_release_date &&
            !(game.expected_release_day && game.expected_release_month)
        ) {
            return false;
        }
        return true;
    });

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
    const response: GBResponse<GBGame> = await getFromCacheOrNetwork(buildGameDetailUrl(guid), makeGbRequest);
    return response.results || response;
}

export async function searchGamesOnGiantbomb(searchText: string) {
    const response: GBResponse<GBGame> = await getFromCacheOrNetwork(buildSearchUrl(searchText), makeGbRequest);
    return response.results || response;
}

function buildGameDetailUrl(guid: string) {
    return `https://www.giantbomb.com/api/game/${guid}/?api_key=${API_KEY}&format=json`;
}

function buildSearchUrl(searchText: string) {
    return `https://www.giantbomb.com/api/search/?api_key=${API_KEY}&format=json&query=${searchText}&resources=game&limit=${SEARCH_LIMIT}`;
}

export function generateContToken(offset: number) {
    return `?offset=${offset + LIMIT}`;
}
