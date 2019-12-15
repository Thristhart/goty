/**
 * Implements the algorithm described in:
 * Monte Carlo Sort for unreliable human comparisons
 * Samuel L Smith
 * https://arxiv.org/pdf/1612.08555.pdf
 */
import { getNumberOfTimesGameMeasuredLesser } from "../data/comparison";
import { get, setWithoutExpiry } from "./cache";
import shuffle = require("shuffle-array");

const candidateCount = 10;

export async function getOrCreateCandidatesForUser(userId: string, list: string[]) {
    const candidatesString = await get(`candidates:${userId}`);
    if (candidatesString) {
        return JSON.parse(candidatesString);
    }
    const candidates = getCandidateSet(list, candidateCount);

    saveCandidatesForUser(userId, candidates);

    return candidates;
}
export async function getCandidatesForUser(userId: string) {
    const candidatesString = await get(`candidates:${userId}`);
    return JSON.parse(candidatesString);
}

export async function saveCandidatesForUser(userId: string, candidates: string[][]) {
    return setWithoutExpiry(`candidates:${userId}`, JSON.stringify(candidates));
}

/**
 * Randomly select a list from the played games.
 * @param elements The unique set of game IDs that are valid elements
 */
function getCandidateOrdering(elements: string[]): string[] {
    return shuffle(elements, { copy: true });
}

/**
 * Get N candidate orderings
 * @param elements The unique set of game IDs that are valid elements
 * @param N The number of candidates to create
 */
function getCandidateSet(elements: string[], N: number) {
    return Array.from(new Array(N), getCandidateOrdering.bind(undefined, elements));
}

function findNumberOfCandidatesWhereIBeforeJ(i: string, j: string, candidates: string[][]) {
    let iBeforeJCount = 0;
    candidates.forEach((candidate) => {
        if (candidate.indexOf(i) < candidate.indexOf(j)) {
            iBeforeJCount++;
        }
    });
    return iBeforeJCount;
}

function findCertaintyOfOrdering(i: string, j: string, candidates: string[][]) {
    let iBeforeJ = findNumberOfCandidatesWhereIBeforeJ(i, j, candidates);
    let jBeforeI = candidates.length - iBeforeJ;
    return Math.abs(iBeforeJ - jBeforeI);
}

type Pair = readonly [string, string];
/**
 * Find the two elements that the candidate set is least certain about.
 * Minimize (Nij - Nji)^2, where Nij is the number of candidates where i < j
 * Cost is O(L^2), where L is the number of games
 * @param gameIds The unique set of game IDs that are valid elements
 * @param candidates The set of N candidate orderings
 */
export function findMostUncertainPair(gameIds: string[], candidates: string[][]) {
    let mostUncertainPair: Pair;
    let smallestCertainty = Infinity;
    for (let i = 0; i < gameIds.length; i++) {
        for (let j = 0; j < gameIds.length; j++) {
            if (i === j) {
                continue;
            }
            const pair = [gameIds[i], gameIds[j]] as const;
            const certainty = findCertaintyOfOrdering(pair[0], pair[1], candidates);
            if (certainty < smallestCertainty) {
                mostUncertainPair = pair;
                smallestCertainty = certainty;
            }
        }
    }
    return mostUncertainPair!;
}

export function doesCandidateMatchMeasurement(pair: Pair, candidate: string[]) {
    return candidate.indexOf(pair[0]) < candidate.indexOf(pair[1]);
}

export const probabilityOfUserError = 0.15;

export async function sampleByMaximumElement(userId: string, gameIds: string[]): Promise<string[]> {
    if (gameIds.length === 1) {
        return gameIds;
    }

    let w = 0;
    const randomValue = Math.random();

    const betaValues: number[] = [];
    let normalizationConstant = 0;
    for (let i = 0; i < gameIds.length; i++) {
        const nDispute = await getNumberOfTimesGameMeasuredLesser(userId, gameIds[i]);
        betaValues[i] = Math.pow((1 - probabilityOfUserError) / probabilityOfUserError, nDispute);
        normalizationConstant += betaValues[i];
    }

    for (let i = 0; i < gameIds.length; i++) {
        const gamma = betaValues[i] / normalizationConstant;
        if (randomValue < w + gamma) {
            const subsetWithoutValue = gameIds.slice(0, i).concat(gameIds.slice(i + 1));
            const subResult = await sampleByMaximumElement(userId, subsetWithoutValue);
            subResult.unshift(gameIds[i]);
            return subResult;
        } else {
            w += gamma;
        }
    }

    return gameIds; // this shouldn't happen
}

export function doAllCandidatesMatch(candidates: string[][]) {
    for (let i = 0; i < candidates.length - 1; i++) {
        if (!candidates[i].every((value, index) => value === candidates[i + 1][index])) {
            return false;
        }
    }
    return true;
}
