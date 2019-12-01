import config from "config";
import fetch from "node-fetch";
import redis from "redis";
import { promisify } from "util";

const REDIS_CONFIG: {} = config.get("REDIS");

const client = redis.createClient(REDIS_CONFIG);

const get = promisify(client.get.bind(client));
const set: (key: string, value: any, mode: string, duration: number) => Promise<void> = promisify(
    client.set.bind(client)
);

export async function saveToCache(url: string, response: any) {
    return set(url, JSON.stringify(response), "EX", 43200);
}

export async function getFromCache(url: string) {
    return get(url);
}

function sanitizeUrlForLogging(url: string) {
    return url.replace(/api_key=(.*?)&/, "api_key=[api key removed]&");
}

export async function getFromCacheOrNetwork(url: string) {
    const cacheValue = await getFromCache(url);
    if (cacheValue) {
        console.log(`[CACHE HIT] ${sanitizeUrlForLogging(url)}`);
        return JSON.parse(cacheValue);
    }

    console.log(`[CACHE MISS] ${sanitizeUrlForLogging(url)}`);

    const response = await fetch(url);
    const json = await response.json();
    saveToCache(url, json);
    return json;
}
