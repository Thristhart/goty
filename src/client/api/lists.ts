import { ListItemQuery } from "../../routes/api/lists";

export const setListItem = async (id: number, played: boolean) => {
    const url = "/api/list/setItem";

    const bodyData: ListItemQuery = {
        gameExtId: id,
        played,
    };

    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(bodyData),
        headers: [["Content-Type", "application/json"]],
    });
};

export const getMyList = async () => {
    const url = "/api/list";

    const response = await fetch(url);
    const listResponse = await response.json();

    return listResponse;
};
