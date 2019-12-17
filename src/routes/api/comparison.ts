import { Middleware, Next, ParameterizedContext } from "koa";
import {
    getComparisonsBetweenTwoGames,
    getGamesThatHaveNeverBeenCompared,
    getNumberOfTimesGameMeasuredLesserMap,
    insertComparison,
} from "../../data/comparison";
import { getGameFromDB, transformInternalGameIdsToExternalIds } from "../../data/games";
import { getPlayedListFromDB } from "../../data/lists";
import {
    doAllCandidatesMatch,
    doesCandidateMatchMeasurement,
    findMostUncertainPair,
    getCandidatesForUser,
    getOrCreateCandidatesForUser,
    Pair,
    probabilityOfUserError,
    sampleByMaximumElement,
    saveCandidatesForUser,
} from "../../lib/comparison";

export interface Comparison {
    betterGame: number;
    worseGame: number;
    userId?: string;
}

async function updateDataWithNewComparison(userId: string, candidates: string[][], pair: readonly [string, string]) {
    const numberOfTimesMeasuredLesser = await getNumberOfTimesGameMeasuredLesserMap(userId);
    for (let index = 0; index < candidates.length; index++) {
        const candidate = candidates[index];
        if (doesCandidateMatchMeasurement(pair, candidate) || Math.random() < probabilityOfUserError) {
            // keep it
        } else {
            // reject it
            const lowerIndex = candidate.indexOf(pair[1]);
            const higherIndex = candidate.indexOf(pair[0]);
            const frontSubset = candidate.slice(0, lowerIndex);
            const backSubset = candidate.slice(higherIndex + 1);
            const midSection = await sampleByMaximumElement(
                userId,
                candidate.slice(lowerIndex, higherIndex + 1),
                numberOfTimesMeasuredLesser
            );
            candidates[index] = frontSubset.concat(midSection).concat(backSubset);
        }
    }
    if (doAllCandidatesMatch(candidates)) {
        return true;
    }

    saveCandidatesForUser(userId, candidates);
    return false;
}

export const addComparison: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    let comparison: Comparison = ctx.request.body;
    const userId = ctx.state.user.id;

    comparison.userId = userId;
    await insertComparison(comparison);

    const pair = ((await Promise.all(
        [comparison.worseGame, comparison.betterGame].map((extId) => getGameFromDB(extId))
    )) as unknown) as readonly [string, string];

    const candidates: string[][] = await getCandidatesForUser(userId);

    const done = await updateDataWithNewComparison(userId, candidates, pair);

    if (!done) {
        return getNextComparison(ctx, next);
    }

    //TODO: do something else when done
    console.log("done!");
};

export const getNextComparison: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    const userId = ctx.state.user.id;
    const ids = await getPlayedListFromDB(userId);
    const candidates = await getOrCreateCandidatesForUser(userId, ids);

    let foundNewPairToAskAbout = false;
    let pair: Pair;
    let attempts = 0;
    while (!foundNewPairToAskAbout) {
        pair = findMostUncertainPair(ids, candidates);
        attempts++;

        // check if we already know the answer for this pair...
        const existingComparisons = await getComparisonsBetweenTwoGames(userId, pair[0], pair[1]);
        if (existingComparisons.length > 0) {
            const compare = existingComparisons[0];
            const done = await updateDataWithNewComparison(userId, candidates, [compare.worseGame, compare.betterGame]);
            if (done) {
                //TODO: do something when done
                console.log("done!");
                break;
            }
            if (attempts > 15) {
                console.log("gave up after 15 attempts at getting a novel question");
                // give up on getting the most informative question, and just ask some other one
                pair = await getGamesThatHaveNeverBeenCompared(userId);
                foundNewPairToAskAbout = true;
            }
        } else {
            foundNewPairToAskAbout = true;
        }
    }

    ctx.body = await transformInternalGameIdsToExternalIds(pair!);

    ctx.status = 200;
    return;
};
