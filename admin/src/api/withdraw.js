import { API_BASE_URL } from "./config";

export const getWithdraw = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/withdraws`);
    if (!response.ok) {
      throw new Error("Failed to fetch withdraw data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching withdraw data:", error);
    throw error;
  }
};

export const updateWithdrawStatus = async (id, ticket) => {
    const token = localStorage.getItem("token");
    const status = ticket > 0 ? 'COMPLETED' : 'CANCELLED';
    try {
      const response = await fetch(`${API_BASE_URL}/withdraws/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, ticket }),
      });
      if (!response.ok) {
        throw new Error("Failed to update withdraw status");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating withdraw status:", error);
      throw error;
    }
};