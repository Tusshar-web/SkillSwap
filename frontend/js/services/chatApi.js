const API_URL = `${window.CONFIG.API_URL}`;

async function getConversations() {

    const token = sessionStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/swap/conversations`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data.conversations;
}

window.ChatAPI = {
    getConversations
};