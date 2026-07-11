const API_URL = "http://localhost:5009/api";

async function getConversations() {

    const token = localStorage.getItem("token");

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