import { Comparison } from "../../routes/api/comparison";

export const getNextComparison = async () => {
    const url = "/api/comparison";

    const response = await fetch(url);
    const compareResponse = await response.json();

    return { leftGame: compareResponse[0], rightGame: compareResponse[1] };
};
export const chooseGame = async (betterGame: number, worseGame: number) => {
    const url = "/api/comparison/choose";

    const bodyData: Comparison = { betterGame, worseGame };

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(bodyData),
        headers: [["Content-Type", "application/json"]],
    });
    const choiceReponse = await response.json();

    //TODO: check if done

    return { leftGame: choiceReponse[0], rightGame: choiceReponse[1] };
};
