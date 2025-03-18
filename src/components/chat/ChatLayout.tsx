import React, { useEffect, useRef, useState } from "react";
import ChatService from "../../lib/ChatService";

interface ChatLayoutProps {
  userToken: string;
  userName: string;
  onLogout: () => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ userToken, userName, onLogout }) => {
  const token = userToken;

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newConversationName, setNewConversationName] = useState("");

  // 1) Create a ref to store the interval ID so we can clear it later
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const avatarInitials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!token) return;
    fetchConversationsFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Helper to fetch from the server, then store in localStorage (optional)
  const fetchConversationsFromServer = () => {
    ChatService.getConversations(token)
      .then((data) => {
        setConversations(data);
        // Optionally store them for fast re-load if same user logs out/in
        localStorage.setItem(`conversations_${token}`, JSON.stringify(data));
        if (data.length > 0) {
          setSelectedConversationId(data[0].id);
        }
      })
      .catch((err) => console.error("Failed to fetch conversations", err));
  };

  // Whenever the user selects a conversation, fetch its details
  // Also clear any existing interval so we don't poll the old conversation
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

  // Cleanup when component unmounts: clear any active interval
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handleCreateConversation = async () => {
    if (!newConversationName.trim()) return;
    try {
      const newConv = await ChatService.createConversation(token, newConversationName);
      setConversations((prev) => {
        const updated = [...prev, newConv];
        localStorage.setItem(`conversations_${token}`, JSON.stringify(updated));
        return updated;
      });
      setNewConversationName("");
      setSelectedConversationId(newConv.id);
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    try {
      await ChatService.sendMessage(token, selectedConversationId, newMessage);
      setNewMessage("");

      // Fetch the conversation right after sending
      const updated = await ChatService.getConversation(token, selectedConversationId);
      setCurrentConversation(updated);
      setConversations((prev) => {
        const newArr = prev.map((c) => (c.id === updated.id ? updated : c));
        localStorage.setItem(`conversations_${token}`, JSON.stringify(newArr));
        return newArr;
      });

      // 2) Clear any existing interval so we don't double-poll
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }

      // 3) Start a new interval to poll the conversation every 3 seconds
      pollingRef.current = setInterval(async () => {
        try {
          const updatedAgain = await ChatService.getConversation(
            token,
            selectedConversationId
          );
          setCurrentConversation(updatedAgain);

          setConversations((prev) => {
            const newArr = prev.map((c) =>
              c.id === updatedAgain.id ? updatedAgain : c
            );
            localStorage.setItem(`conversations_${token}`, JSON.stringify(newArr));
            return newArr;
          });
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 3000);

    } catch (err) {
      console.error("Failed to send message", err);
    }
  };


  return (
    <div className="flex h-screen w-full antialiased text-gray-800">
      <div className="md:flex md:flex-row h-full w-full overflow-x-hidden">
        
        {/* LEFT SIDEBAR */}
        <div className="md:flex md:flex-col py-6 px-4 md:w-64 bg-white flex-shrink-0">
          <div className="md:flex flex-row items-center justify-center h-12 w-full">
            <h3 className="ml-2 font-bold text-2xl">ChatSpace</h3>
          </div>

          <div className="flex md:flex-col items-center gap-2 bg-indigo-100 border border-gray-200 mt-2 w-full py-4 px-4 rounded-lg">
            <div className="flex items-center justify-center h-12 w-12 text-lg md:text-2xl font-bold bg-indigo-200 rounded-full">
              {avatarInitials}
            </div>
            <div className="text-xs md:text-sm font-semibold mt-2">{userName}</div>
            <p className="text-xs mt-2">{new Date().toLocaleDateString()}</p>

            <button onClick={onLogout} className="mt-2 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600">
              Log Out
            </button>
          </div>

          <div className="flex flex-col mt-8">
            <div className="flex flex-row items-center justify-between text-xs">
              <span className="font-bold">Conversations</span>
              <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">
                {conversations.length}
              </span>
            </div>

            <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 ${
                    conv.id === selectedConversationId ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                    {conv.attributes.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-2 text-sm font-semibold">
                    {conv.attributes.name}
                  </div>
                </button>
              ))}
            </div>

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
          </div>
        </div>

        {/* RIGHT-SIDE CHAT PANEL */}
        <div className="flex flex-col flex-auto md:h-full p-6 mb-10 md:mb-0">
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
            {currentConversation ? (
              <>
                <div className="mb-2 font-bold text-lg">
                  {currentConversation.attributes.name}
                </div>

                <div className="flex flex-col h-full overflow-x-auto mb-4">
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-12 gap-y-2">
                      {currentConversation.attributes.messages?.map((msg: any) => {
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
                  </div>
                </div>

                {/* New message input */}
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
