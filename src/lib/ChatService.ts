// src/lib/ChatService.ts

export interface ApiMessage {
  type: "messages";
  id: string;
  attributes: {
    text: string;
    author: string;
  };
}

export interface ApiConversation {
  type: "conversations";
  id: string;
  attributes: {
    name: string;
    author: string;
    messages: ApiMessage[];
  };
}

export interface ApiErrorData {
  errors: Array<{
    status: string;
    title: string;
    detail: string;
  }>;
}

// A generic fetch helper that handles JSON:API headers & error handling
async function fetchJsonApi<T>(
  url: string,
  method: string,
  token?: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/vnd.api+json",
    Accept: "application/vnd.api+json",
  };

  if (token) {
    headers.Authorization = token; // Our server expects userId as the token
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData: ApiErrorData | undefined = await res.json().catch(() => undefined);
    throw new Error(
      `Request failed with status ${res.status}. ${JSON.stringify(errorData)}`
    );
  }

  return res.json();
}

const ChatService = {
  baseUrl: "http://localhost:3001",

  async authenticate(username: string, password: string) {
    // { meta: { token: string } }
    type AuthResponse = {
      meta: {
        token: string;
      };
    };

    const url = `${this.baseUrl}/authenticate`;
    const body = {
      data: {
        attributes: { username, password },
      },
    };

    const json = await fetchJsonApi<AuthResponse>(url, "POST", undefined, body);
    return { token: json.meta.token };
  },

  async getConversations(token: string) {
    // { data: ApiConversation[] }
    type ConversationsResponse = {
      data: ApiConversation[];
    };

    const url = `${this.baseUrl}/conversations`;
    const json = await fetchJsonApi<ConversationsResponse>(url, "GET", token);
    return json.data;
  },

  async createConversation(token: string, name: string) {
    // { data: ApiConversation }
    type ConversationResponse = {
      data: ApiConversation;
    };

    const url = `${this.baseUrl}/conversations`;
    const body = {
      data: {
        attributes: { name },
      },
    };

    const json = await fetchJsonApi<ConversationResponse>(url, "POST", token, body);
    return json.data;
  },

  async getConversation(token: string, conversationId: string) {
    // { data: ApiConversation }
    type SingleConversationResponse = {
      data: ApiConversation;
    };

    const url = `${this.baseUrl}/conversations/${conversationId}`;
    const json = await fetchJsonApi<SingleConversationResponse>(url, "GET", token);
    return json.data;
  },

  async sendMessage(token: string, conversationId: string, text: string) {
    // { data: ApiMessage }
    type SendMessageResponse = {
      data: ApiMessage;
    };

    const url = `${this.baseUrl}/conversations/${conversationId}`;
    const body = {
      data: {
        attributes: { text },
      },
    };

    const json = await fetchJsonApi<SendMessageResponse>(url, "POST", token, body);
    return json.data;
  },

  // Delete a conversation
async deleteConversation(token: string, convId: string) {
  const url = `${this.baseUrl}/conversations/${convId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      Authorization: token,
    },
  });
  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to delete conversation");
  }
},

// Patch a conversation (e.g. archived: true/false)
async updateConversation(token: string, convId: string, patchData: any) {
  const url = `${this.baseUrl}/conversations/${convId}`;
  const body = {
    data: {
      type: "conversations",
      id: convId,
      attributes: patchData, // e.g. { archived: true }
    },
  };
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      Authorization: token,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errMsg = await response.text();
    throw new Error(`Failed to patch conversation: ${errMsg}`);
  }
  const json = await response.json();
  // Return the updated conversation object in JSON:API format
  return json.data;
}
};

export default ChatService;
