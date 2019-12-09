import { GBGame } from "./giantbomb_model";

export type GOTYGame = GBGame & {
    hasPlayed: boolean;
};
