const BASE_URL = "https://black-cat.up.railway.app";

export const createSession = async (token: string) => {
  const response = await fetch(`${BASE_URL}/chat/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};

export const sendChatMessage = async (
  sessionId: string,
  message: string,
  token: string
) => {
  const response = await fetch(
    `${BASE_URL}/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
      }),
    }
  );

  return await response.json();
};

export const getSessionMessages = async (
  sessionId: string,
  token: string
) => {
  const response = await fetch(
    `${BASE_URL}/chat/sessions/${sessionId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await response.json();
};

export const getAllSessions = async (token: string) => {
  const response = await fetch(`${BASE_URL}/chat/sessions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};

export const deleteSessionById = async (
  sessionId: string,
  token: string
) => {
  const response = await fetch(
    `${BASE_URL}/chat/sessions/${sessionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // 204 No Content → no body to parse
  if (response.status === 204) return {};

  return await response.json().catch(() => ({}));
};