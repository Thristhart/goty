
import config from "config";
import fetch from "node-fetch";
import { GBGamesResponse } from './giantbomb_model';

const API_KEY = config.get("GB_API_KEY");

const YEAR_START = "2019-01-01 00:00:00";
const YEAR_END = "2020-01-01 00:00:00";

interface GetGamesOptions {
    
}

export async function getGamesFromGiantbomb(options: GetGamesOptions) {
    const response = await fetch(`https://www.giantbomb.com/api/games/?api_key=${API_KEY}&format=json&filter=original_release_date:${YEAR_START}:${YEAR_END}`);
    const responseData: GBGamesResponse = await response.json();

    return responseData.results;
}