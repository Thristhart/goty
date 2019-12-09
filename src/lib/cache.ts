import config from "config";
import { Response } from "node-fetch";
import redis from "redis";
import { promisify } from "util";

const REDIS_CONFIG: {} = config.get("REDIS");

const TWELVE_HOURS = 43200;
const ONE_WEEK = 604800;

const client = redis.createClient(REDIS_CONFIG);

const get = promisify(client.get.bind(client));
const set: (key: string, value: any, mode: string, duration: number) => Promise<void> = promisify(
    client.set.bind(client)
);

export async function saveToCache(url: string, response: any) {
    let cacheLength = TWELVE_HOURS;
    if (url.substr(0, 35) === "https://www.giantbomb.com/api/game/") {
        cacheLength = ONE_WEEK;
    }
    return set(url, JSON.stringify(response), "EX", cacheLength);
}

export async function getFromCache(url: string) {
    return get(url);
}

function sanitizeUrlForLogging(url: string) {
    return url.replace(/api_key=(.*?)&/, "api_key=[api key removed]&");
}

export async function getFromCacheOrNetwork(url: string, makeRequest: (url: string) => Promise<Response>) {
    const cacheValue = await getFromCache(url);
    if (cacheValue) {
        console.log(`[CACHE HIT] ${sanitizeUrlForLogging(url)}`);
        return JSON.parse(cacheValue);
    }

    console.log(`[CACHE MISS] ${sanitizeUrlForLogging(url)}`);

    const response = await makeRequest(url);
    const json = await response.json();
    saveToCache(url, json);
    return json;
}
