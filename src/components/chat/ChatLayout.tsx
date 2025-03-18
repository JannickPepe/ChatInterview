import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import ChatService from "../../lib/ChatService";
import LeftSideBar from "./LeftSideBar";
import RightChatPanel from "./RightChatPanel";

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
  const [isLoading, setIsLoading] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const avatarInitials = useMemo(() => {
    return userName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation, isLoading]);

  useEffect(() => {
    if (!token) return;
    fetchConversationsFromServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchConversationsFromServer = useCallback(() => {
    ChatService.getConversations(token)
      .then((data) => {
        setConversations(data);
        localStorage.setItem(`conversations_${token}`, JSON.stringify(data));
        if (data.length > 0 && !selectedConversationId) {
          setSelectedConversationId(data[0].id);
          localStorage.setItem(`selectedConversationId_${token}`, data[0].id);
        }
      })
      .catch((err) => console.error("Failed to fetch conversations", err));
  }, [token, selectedConversationId]);

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

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleCreateConversation = useCallback(async () => {
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
      localStorage.setItem(`selectedConversationId_${token}`, newConv.id);
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  }, [newConversationName, token]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    setIsLoading(true);
    try {
      await ChatService.sendMessage(token, selectedConversationId, newMessage);
      setNewMessage("");
      const updated = await ChatService.getConversation(token, selectedConversationId);
      setCurrentConversation(updated);
      setConversations((prev) => {
        const newArr = prev.map((c) => (c.id === updated.id ? updated : c));
        localStorage.setItem(`conversations_${token}`, JSON.stringify(newArr));
        return newArr;
      });

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
  }, [newMessage, selectedConversationId, token]);

  const handleDeleteConversation = useCallback(
    async (convId: string) => {
      try {
        await ChatService.deleteConversation(token, convId);
        const updated = conversations.filter((c) => c.id !== convId);
        setConversations(updated);
        localStorage.setItem(`conversations_${token}`, JSON.stringify(updated));
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
    },
    [conversations, selectedConversationId, token]
  );

  const handleArchiveConversation = useCallback(
    async (convId: string) => {
      try {
        const updatedConv = await ChatService.updateConversation(token, convId, { archived: true });
        setConversations((prev) => {
          const newArr = prev.map((c) =>
            c.id === updatedConv.id ? { ...c, attributes: updatedConv.attributes } : c
          );
          localStorage.setItem(`conversations_${token}`, JSON.stringify(newArr));
          return newArr;
        });
      } catch (err) {
        console.error("Failed to archive conversation", err);
      }
    },
    [token]
  );

  const handleUnarchiveConversation = useCallback(
    async (convId: string) => {
      try {
        const updatedConv = await ChatService.updateConversation(token, convId, { archived: false });
        setConversations((prev) => {
          const newArr = prev.map((c) =>
            c.id === updatedConv.id ? { ...c, attributes: updatedConv.attributes } : c
          );
          localStorage.setItem(`conversations_${token}`, JSON.stringify(newArr));
          return newArr;
        });
      } catch (err) {
        console.error("Failed to unarchive conversation", err);
      }
    },
    [token]
  );

  const activeConversations = useMemo(() => {
    return conversations.filter((c) => !c.attributes?.archived);
  }, [conversations]);

  const archivedConversations = useMemo(() => {
    return conversations.filter((c) => c.attributes?.archived);
  }, [conversations]);

  return (
    <div className="w-full antialiased text-gray-800 max-h-[100vh]">
      <div className="md:flex md:flex-row w-full overflow-x-hidden max-h-[100vh]">
        <LeftSideBar
          userName={userName}
          avatarInitials={avatarInitials}
          onLogout={onLogout}
          newConversationName={newConversationName}
          setNewConversationName={setNewConversationName}
          handleCreateConversation={handleCreateConversation}
          activeConversations={activeConversations}
          archivedConversations={archivedConversations}
          handleArchiveConversation={handleArchiveConversation}
          handleUnarchiveConversation={handleUnarchiveConversation}
          handleDeleteConversation={handleDeleteConversation}
          setSelectedConversationId={setSelectedConversationId}
          token={token}
        />

        <RightChatPanel
          currentConversation={currentConversation}
          isLoading={isLoading}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </div>
  );
};

export default ChatLayout;
