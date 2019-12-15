import { Middleware, Next, ParameterizedContext } from "koa";
import { insertComparison } from "../../data/comparison";
import { getGameFromDB, transformInternalGameIdsToExternalIds } from "../../data/games";
import { getPlayedListFromDB } from "../../data/lists";
import {
    doAllCandidatesMatch,
    doesCandidateMatchMeasurement,
    findMostUncertainPair,
    getCandidatesForUser,
    getOrCreateCandidatesForUser,
    probabilityOfUserError,
    sampleByMaximumElement,
    saveCandidatesForUser,
} from "../../lib/comparison";

export interface Comparison {
    betterGame: number;
    worseGame: number;
    userId?: string;
}

export const addComparison: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    let comparison: Comparison = ctx.request.body;
    const userId = ctx.state.user.id;

    comparison.userId = userId;
    await insertComparison(comparison);

    const candidates: string[][] = await getCandidatesForUser(userId);

    const pair = ((await Promise.all(
        [comparison.worseGame, comparison.betterGame].map((extId) => getGameFromDB(extId))
    )) as unknown) as readonly [string, string];

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
            const midSection = await sampleByMaximumElement(userId, candidate.slice(lowerIndex, higherIndex + 1));
            candidates[index] = frontSubset.concat(midSection).concat(backSubset);
        }
    }
    console.log(candidates);
    if (doAllCandidatesMatch(candidates)) {
        // done!
    }

    saveCandidatesForUser(userId, candidates);

    ctx.status = 200;
    return;
};

export const getNextComparison: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    const userId = ctx.state.user.id;
    const ids = await getPlayedListFromDB(userId);
    const candidates = await getOrCreateCandidatesForUser(userId, ids);
    const pair = findMostUncertainPair(ids, candidates);

    ctx.body = await transformInternalGameIdsToExternalIds(pair);

    ctx.status = 200;
    return;
};
