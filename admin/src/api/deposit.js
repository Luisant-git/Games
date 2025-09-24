import { API_BASE_URL } from "./config";

export const getDeposit = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/deposits`);
    if (!response.ok) {
      throw new Error("Failed to fetch deposit data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching deposit data:", error);
    throw error;
  }
};

export const updateDepositStatus = async (id, ticket) => {
    const token = localStorage.getItem("token");
    const status = ticket > 0 ? 'COMPLETED' : 'MISMATCH';
    try {
      const response = await fetch(`${API_BASE_URL}/deposits/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, ticket }),
      });
      if (!response.ok) {
        throw new Error("Failed to update deposit status");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating deposit status:", error);
      throw error;
    }
};
