import React, { useEffect, useState } from "react";
import ChatService from "../../lib/ChatService";

// Define the props interface to accept "userToken"
interface ChatLayoutProps {
  userToken: string;
  userName: string;       
  onLogout: () => void;   
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ userToken, userName, onLogout }) => {
  // We no longer hard-code token here; we just receive it from props.
  // const [token] = useState("c89ee220-37fc-4781-ae07-24fcaf91281a");
  const token = userToken;

  // Left side data
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Right side (chat messages)
  const [currentConversation, setCurrentConversation] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newConversationName, setNewConversationName] = useState("");

  // Fetch all conversations on mount (or when token changes)
  useEffect(() => {
    if (!token) return;
    ChatService.getConversations(token)
      .then((data) => {
        setConversations(data);
        // Optionally auto-select the first conversation
        if (data.length > 0) {
          setSelectedConversationId(data[0].id);
        }
      })
      .catch((err) => console.error("Failed to fetch conversations", err));
  }, [token]);

  // Whenever the selectedConversationId changes, load that conversation’s details
  useEffect(() => {
    if (selectedConversationId && token) {
      ChatService.getConversation(token, selectedConversationId)
        .then((conv) => setCurrentConversation(conv))
        .catch((err) => console.error("Failed to fetch conversation", err));
    } else {
      setCurrentConversation(null);
    }
  }, [selectedConversationId, token]);

  // Handle sending new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    try {
      await ChatService.sendMessage(token, selectedConversationId, newMessage);
      setNewMessage("");
      // re-fetch conversation to show the newly added message
      const updated = await ChatService.getConversation(token, selectedConversationId);
      setCurrentConversation(updated);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  // Handle creating a new conversation
  const handleCreateConversation = async () => {
    if (!newConversationName.trim()) return;
    try {
      const newConv = await ChatService.createConversation(token, newConversationName);
      setConversations((prev) => [...prev, newConv]);
      setNewConversationName("");
      // Optionally select the newly created conversation
      setSelectedConversationId(newConv.id);
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  };

  // Example: if userName = "user1", we’ll display "U1" in the avatar bubble
  const avatarInitials = userName
    .split(" ")
    .map((word) => word[0]) // first letter of each part
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen w-full antialiased text-gray-800">
      <div className="md:flex md:flex-row h-full w-full overflow-x-hidden">

        {/* LEFT SIDEBAR */}
        <div className="md:flex md:flex-col py-6 px-4 md:w-64 bg-white flex-shrink-0">
          <div className="md:flex flex-row items-center justify-center h-12 w-full">
            <h3 className="ml-2 font-bold text-2xl">ChatSpace</h3>
          </div>

          {/* User Info (static for demonstration) */}
          <div className="flex md:flex-col items-center gap-2 bg-indigo-100 border border-gray-200 mt-2 w-full py-4 px-4 rounded-lg">
            <div className="flex items-center justify-center h-12 w-12 text-lg md:text-2xl font-bold bg-indigo-200 rounded-full">
              {avatarInitials}
            </div>
            <div className="text-xs md:text-sm font-semibold mt-2"> 
              {userName}
            </div>
            <p className="text-xs mt-2">{new Date().toLocaleDateString()}</p>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="mt-2 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
            >
              Log Out
            </button>
          </div>

          {/* Conversation List */}
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
                  className={`flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 ${
                    conv.id === selectedConversationId ? "bg-gray-200" : ""
                  }`}
                  onClick={() => setSelectedConversationId(conv.id)}
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

            {/* Create Conversation */}
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
                {/* Conversation Header */}
                <div className="mb-2 font-bold text-lg">
                  {currentConversation.attributes.name}
                </div>

                {/* Messages */}
                <div className="flex flex-col h-full overflow-x-auto mb-4">
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-12 gap-y-2">
                      {currentConversation.attributes.messages?.map((msg: any) => {
                        const isMe = msg.author !== "AI";
                        return isMe ? (
                          // This user's message
                          <div
                            key={msg.id}
                            className="col-start-6 col-end-13 p-3 rounded-lg"
                          >
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
                          // AI or other user's message
                          <div
                            key={msg.id}
                            className="col-start-1 col-end-8 p-3 rounded-lg"
                          >
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
                          ></path>
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
