import ChatService from "./ChatService";
import { jest } from "@jest/globals";

// Ensure fetch is properly typed as a Jest mock function
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("ChatService API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("authenticate calls correct endpoint and returns a token", async () => {
    const mockResponse = {
      meta: { token: "fakeUserId" },
    };

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: async () => mockResponse,
      }) as unknown as Response
    );

    const result = await ChatService.authenticate("user1", "password1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/authenticate",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(result).toEqual({ token: "fakeUserId" });
  });

  test("getConversations fetches user conversations", async () => {
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

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: async () => mockResponse,
      }) as unknown as Response
    );

    const convos = await ChatService.getConversations("fakeUserId");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/conversations",
      expect.objectContaining({
        method: "GET",
      })
    );
    expect(convos.length).toBe(1);
    expect(convos[0].id).toBe("123");
  });

  test("createConversation sends correct request and returns new conversation", async () => {
    const mockNewConversation = {
      data: {
        type: "conversations",
        id: "456",
        attributes: {
          name: "New Chat",
          author: "fakeUserId",
          messages: [],
        },
      },
    };

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: async () => mockNewConversation,
      }) as unknown as Response
    );

    const newConvo = await ChatService.createConversation("fakeUserId", "New Chat");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/conversations",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(newConvo.id).toBe("456");
    expect(newConvo.attributes.name).toBe("New Chat");
  });

  test("getConversation fetches specific conversation details", async () => {
    const mockResponse = {
      data: {
        type: "conversations",
        id: "789",
        attributes: {
          name: "Existing Conversation",
          author: "fakeUserId",
          messages: [],
        },
      },
    };

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: async () => mockResponse,
      }) as unknown as Response
    );

    const conversation = await ChatService.getConversation("fakeUserId", "789");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/conversations/789",
      expect.objectContaining({
        method: "GET",
      })
    );
    expect(conversation.id).toBe("789");
    expect(conversation.attributes.name).toBe("Existing Conversation");
  });

  test("sendMessage posts a new message and returns updated conversation", async () => {
    const mockMessage = {
      data: {
        type: "messages",
        id: "msg123",
        attributes: {
          text: "Hello!",
          author: "fakeUserId",
        },
      },
    };

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        json: async () => mockMessage,
      }) as unknown as Response
    );

    const message = await ChatService.sendMessage("fakeUserId", "789", "Hello!");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/conversations/789",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(message.id).toBe("msg123");
    expect(message.attributes.text).toBe("Hello!");
  });

  test("handles fetch errors gracefully", async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({
          errors: [{ status: "500", title: "Server Error", detail: "Something went wrong" }],
        }),
      }) as unknown as Response
    );

    await expect(ChatService.getConversations("fakeUserId")).rejects.toThrow(
      "Request failed with status 500."
    );
  });
});
