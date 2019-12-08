export const getAllGames = async (contToken?: string) => {
    let url = "/api/games/";
    if (contToken) {
        url += contToken;
    }

    const response = await fetch(url);
    const gamesResponse = await response.json();

    return gamesResponse;
};
