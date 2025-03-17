// src/lib/ChatService.test.js
import ChatService from "./ChatService";

describe("ChatService", () => {
  beforeEach(() => {
    // Mock the global fetch API
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("authenticate calls the correct endpoint and returns token", async () => {
    const mockResponse = {
      meta: { token: "fakeUserId" },
    };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await ChatService.authenticate("user1", "password1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/authenticate",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(result).toEqual({ token: "fakeUserId" });
  });

  test("getConversations returns data array", async () => {
    const mockResponse = {
      data: [
        {
          type: "conversations",
          id: "123",
          attributes: {
            name: "Test Conversation",
            author: "fakeUserId",
            messages: [],
          },
        },
      ],
    };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const convos = await ChatService.getConversations("fakeUserId");
    expect(convos.length).toBe(1);
    expect(convos[0].id).toBe("123");
  });

  // Add similar tests for createConversation, getConversation, sendMessage, etc.
});
