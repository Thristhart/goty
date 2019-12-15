export const getAllGames = async (contToken?: string) => {
    let url = "/api/games/";
    if (contToken) {
        url += contToken;
    }

    const response = await fetch(url);
    const gamesResponse = await response.json();

    return gamesResponse;
};
export const searchGames = async (query: string) => {
    const url = `/api/games/search?query=${query}`;

    const response = await fetch(url);
    const searchResponse = await response.json();

    return searchResponse;
};
