import { Middleware, Next, ParameterizedContext } from 'koa';
import { insertComparison } from '../../data/comparison';

export interface Comparison {
    betterGame: number;
    worseGame: number;
    userId?: string;
}

export const addComparison: Middleware = async (ctx: ParameterizedContext, next: Next) => {
    let comparison: Comparison = ctx.request.body;
    comparison.userId = ctx.state.user.id;
    await insertComparison(comparison);

    ctx.status = 200;
    return;

}