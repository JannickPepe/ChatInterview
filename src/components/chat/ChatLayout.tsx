import React, { useEffect, useRef, useState } from "react";
import ChatService from "../../lib/ChatService";
import { LucideLogOut } from "lucide-react";

interface ChatLayoutProps {
  userToken: string;
  userName: string;
  onLogout: () => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  userToken,
  userName,
  onLogout,
}) => {
  const token = userToken;

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newConversationName, setNewConversationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Polling interval ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  // This ref is placed at the bottom of the message list
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Derive user’s avatar initials
  const avatarInitials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Auto-scroll whenever conversation changes or loading changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation, isLoading]);

  // Fetch conversation list from server on mount (or token change)
  useEffect(() => {
    if (!token) return;
    fetchConversationsFromServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Helper: fetch all user’s conversations from the server
  const fetchConversationsFromServer = () => {
    ChatService.getConversations(token)
      .then((data) => {
        setConversations(data);
        localStorage.setItem(`conversations_${token}`, JSON.stringify(data));
        // If none selected, pick the first
        if (data.length > 0 && !selectedConversationId) {
          setSelectedConversationId(data[0].id);
          localStorage.setItem(`selectedConversationId_${token}`, data[0].id);
        }
      })
      .catch((err) => console.error("Failed to fetch conversations", err));
  };

  // Whenever selectedConversationId changes, fetch that conversation
  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (selectedConversationId && token) {
      ChatService.getConversation(token, selectedConversationId)
        .then((conv) => setCurrentConversation(conv))
        .catch((err) => console.error("Failed to fetch conversation", err));
    } else {
      setCurrentConversation(null);
    }
  }, [selectedConversationId, token]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Create a new conversation on the server
  const handleCreateConversation = async () => {
    if (!newConversationName.trim()) return;
    try {
      const newConv = await ChatService.createConversation(token, newConversationName);
      // Merge into local state
      setConversations((prev) => {
        const updated = [...prev, newConv];
        localStorage.setItem(`conversations_${token}`, JSON.stringify(updated));
        return updated;
      });
      setNewConversationName("");

      // Select newly created conversation
      setSelectedConversationId(newConv.id);
      localStorage.setItem(`selectedConversationId_${token}`, newConv.id);
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    setIsLoading(true);
    try {
      // Post message to server
      await ChatService.sendMessage(token, selectedConversationId, newMessage);
      setNewMessage("");

      // Fetch updated conversation
      const updated = await ChatService.getConversation(token, selectedConversationId);
      setCurrentConversation(updated);
      setConversations((prev) => {
        const newArr = prev.map((c) => (c.id === updated.id ? updated : c));
        localStorage.setItem(`conversations_${token}`, JSON.stringify(newArr));
        return newArr;
      });

      // Poll for AI response every 3s
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        try {
          const updatedAgain = await ChatService.getConversation(token, selectedConversationId);
          setCurrentConversation(updatedAgain);
          setConversations((prev) => {
            const newArr = prev.map((c) => (c.id === updatedAgain.id ? updatedAgain : c));
            localStorage.setItem(`conversations_${token}`, JSON.stringify(newArr));
            return newArr;
          });
          setIsLoading(false);
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
          setIsLoading(false);
        }
      }, 3000);
    } catch (err) {
      console.error("Failed to send message", err);
      setIsLoading(false);
    }
  };

  // --- Archive & Delete Functionality ---

  // Delete from server
  const handleDeleteConversation = async (convId: string) => {
    try {
      await ChatService.deleteConversation(token, convId); // server call
      // Then remove from local state
      const updated = conversations.filter((c) => c.id !== convId);
      setConversations(updated);
      localStorage.setItem(`conversations_${token}`, JSON.stringify(updated));

      // If we deleted the selected conversation, pick another
      if (selectedConversationId === convId) {
        if (updated.length > 0) {
          setSelectedConversationId(updated[0].id);
          localStorage.setItem(`selectedConversationId_${token}`, updated[0].id);
        } else {
          setSelectedConversationId(null);
          localStorage.removeItem(`selectedConversationId_${token}`);
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  };

  // Archive conversation on the server
  const handleArchiveConversation = async (convId: string) => {
    try {
      // Patch conversation with archived=true
      const updatedConv = await ChatService.updateConversation(token, convId, { archived: true });
      // updatedConv is the JSON:API data from server
      // Merge into local state
      setConversations((prev) => {
        const newArr = prev.map((c) => (c.id === updatedConv.id ? { ...c, attributes: updatedConv.attributes } : c));
        localStorage.setItem(`conversations_${token}`, JSON.stringify(newArr));
        return newArr;
      });
    } catch (err) {
      console.error("Failed to archive conversation", err);
    }
  };

  // Unarchive conversation on the server
  const handleUnarchiveConversation = async (convId: string) => {
    try {
      // Patch conversation with archived=false
      const updatedConv = await ChatService.updateConversation(token, convId, { archived: false });
      // Merge into local state
      setConversations((prev) => {
        const newArr = prev.map((c) => (c.id === updatedConv.id ? { ...c, attributes: updatedConv.attributes } : c));
        localStorage.setItem(`conversations_${token}`, JSON.stringify(newArr));
        return newArr;
      });
    } catch (err) {
      console.error("Failed to unarchive conversation", err);
    }
  };

  // Filter into active vs. archived
  const activeConversations = conversations.filter((c) => !c.attributes?.archived);
  const archivedConversations = conversations.filter((c) => c.attributes?.archived);

  return (
    <div className="w-full antialiased text-gray-800 max-h-[100vh]">
      <div className="md:flex md:flex-row w-full overflow-x-hidden max-h-[100vh]">
        {/* LEFT SIDEBAR */}
        <div className="md:flex md:flex-col px-4 md:w-64 bg-white rounded-lg">
          <div className="md:flex flex-row items-center justify-center h-12 w-full">
            <h3 className="ml-2 font-bold text-2xl pt-2 md:pt-0">ChatSpace</h3>
          </div>

          <div className="flex md:flex-col items-center gap-2 bg-indigo-100 border border-gray-200 mt-2 w-full py-4 px-4 rounded-lg">
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center justify-center h-12 w-12 text-lg md:text-2xl font-bold bg-indigo-200 rounded-full">
                {avatarInitials}
              </span>
              <div className="">
                <p className="text-sm md:text-lg font-semibold">{userName}</p>
                <button
                  onClick={onLogout}
                  className=""
                >
                  <LucideLogOut className="size-4" />
                </button>
              </div>
            </div>
            <p className="text-xs mt-2">{new Date().toLocaleDateString()}</p>
          </div>

           {/* CREATE NEW */}
          <div className="mt-4">
              <div className="text-xs font-bold mb-2">Create Conversation</div>
              <div className="flex flex-row gap-2">
                <input
                  type="text"
                  className="border rounded-lg px-2 py-1 text-sm flex-1"
                  placeholder="Conversation name"
                  value={newConversationName}
                  onChange={(e) => setNewConversationName(e.target.value)}
                />
                <button
                  onClick={handleCreateConversation}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-2 py-1 text-sm"
                >
                  +
                </button>
              </div>
          </div>

          <div className="flex flex-col mt-8">
            {/* ACTIVE */}
            <div className="text-xs font-bold mb-2">Active Conversations ({activeConversations.length})</div>
            <div className="flex flex-col space-y-1 mt-2 -mx-2 h-48 overflow-y-auto">
              {activeConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between hover:bg-gray-100 rounded-xl p-2 cursor-pointer"
                  onClick={() => {
                    setSelectedConversationId(conv.id);
                    localStorage.setItem(`selectedConversationId_${token}`, conv.id);
                  }}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                      {conv.attributes?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="ml-2 text-sm font-semibold">
                      {conv.attributes?.name || "Unnamed"}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveConversation(conv.id);
                      }}
                      className="text-blue-500 text-xs"
                    >
                      Archive
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="text-red-500 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ARCHIVED */}
            <div className="text-xs font-bold mt-4 mb-2">Archived Conversations ({archivedConversations.length})</div>
            <div className="flex flex-col space-y-1 mt-2 pb-2 -mx-2 h-32 overflow-y-auto">
              {archivedConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between hover:bg-gray-100 rounded-xl p-2 cursor-pointer"
                  onClick={() => {
                    setSelectedConversationId(conv.id);
                    localStorage.setItem(`selectedConversationId_${token}`, conv.id);
                  }}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                      {conv.attributes?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="ml-2 text-sm font-semibold">
                      {conv.attributes?.name || "Unnamed"}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnarchiveConversation(conv.id);
                      }}
                      className="text-green-500 text-xs"
                    >
                      Unarchive
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="text-red-500 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT-SIDE CHAT PANEL */}
        <div className="flex flex-col flex-auto max-h-[100vh] p-6 mb-10 md:mb-0 overflow-y-auto">
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 p-4">
            {currentConversation ? (
              <>
                <div className="mb-2 font-bold text-lg">
                  {currentConversation.attributes?.name || "Unnamed"}
                </div>
                <div className="flex flex-col h-full overflow-x-auto mb-4">
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-12 gap-y-2">
                      {currentConversation.attributes?.messages?.map((msg: any) => {
                        const isMe = msg.author !== "AI";
                        return isMe ? (
                          <div key={msg.id} className="col-start-6 col-end-13 p-3 rounded-lg">
                            <div className="flex items-center justify-start flex-row-reverse">
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                                Me
                              </div>
                              <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                                <p>{msg.text}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div key={msg.id} className="col-start-1 col-end-8 p-3 rounded-lg">
                            <div className="flex flex-row items-center">
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                                AI
                              </div>
                              <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                                <p>{msg.text}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {isLoading && (
                      <div className="text-center my-4">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm mt-1">Waiting for response...</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
                  <div className="flex-grow ml-4">
                    <div className="relative w-full">
                      <input
                        type="text"
                        className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={handleSendMessage}
                      className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
                    >
                      <span>Send</span>
                      <span className="ml-2">
                        <svg
                          className="w-4 h-4 transform rotate-45 -mt-px"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 my-auto">
                Select a conversation or create a new one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
