import { ListItemQuery } from "../../routes/api/lists";

export const setListItem = async (id: number, played: boolean) => {
    let url = "/api/list/setItem";

    const bodyData: ListItemQuery = {
        gameExtId: id,
        played,
    };

    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(bodyData),
        headers: [
            ["Content-Type", "application/json"]
        ]
    });
};
