import React, { memo } from "react";
import { Archive, ArchiveRestore, DeleteIcon, LucideLogOut } from "lucide-react";

interface LeftSidebarProps {
    userName: string;
    avatarInitials: string;
    onLogout: () => void;
    newConversationName: string;
    setNewConversationName: (value: string) => void;
    handleCreateConversation: () => void;
    activeConversations: any[];
    archivedConversations: any[];
    handleArchiveConversation: (id: string) => void;
    handleUnarchiveConversation: (id: string) => void;
    handleDeleteConversation: (id: string) => void;
    setSelectedConversationId: (id: string) => void;
    token: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
    userName,
    avatarInitials,
    onLogout,
    newConversationName,
    setNewConversationName,
    handleCreateConversation,
    activeConversations,
    archivedConversations,
    handleArchiveConversation,
    handleUnarchiveConversation,
    handleDeleteConversation,
    setSelectedConversationId,
    token,
}) => {
    return (
        <div className="md:flex md:flex-col px-4 md:w-64 bg-white rounded-lg">
            <div className="md:flex flex-row items-center justify-center h-12 w-full">
                <h3 className="ml-2 font-bold text-2xl pt-2 md:pt-2">ChatSpace</h3>
            </div>

            <div className="bg-indigo-100 border border-gray-200 mt-2 w-full py-4 px-4 rounded-lg">
                <button onClick={onLogout} className="float-right">
                    <LucideLogOut className="size-4" />
                </button>
                <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center justify-center h-12 w-12 text-lg md:text-2xl font-bold bg-indigo-200 rounded-full">
                        {avatarInitials}
                        </span>
                        <p className="text-sm md:text-lg font-semibold">{userName}</p>
                    </div>
                </div>
                <p className="text-xs mt-2 float-right">{new Date().toLocaleDateString()}</p>
            </div>

            {/* CREATE NEW CONVERSATION */}
            <div className="mt-4">
                <div className="text-xs font-bold mb-2">
                    Create Conversation
                </div>
                <div className="flex flex-row gap-2">
                    <input
                        type="text"
                        className="border rounded-lg px-2 py-1 text-sm flex-1"
                        placeholder="Conversation name"
                        value={newConversationName}
                        onChange={(e) => setNewConversationName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleCreateConversation();
                            }
                        }}
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
                {/* ACTIVE CONVERSATIONS */}
                <div className="text-xs font-bold mb-2">
                    Active Conversations ({activeConversations.length})
                </div>
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
                                    <Archive className="size-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteConversation(conv.id);
                                    }}
                                    className="text-red-500 text-xs"
                                >
                                    <DeleteIcon className="size-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ARCHIVED CONVERSATIONS */}
                <div className="text-xs font-bold mt-4 mb-2">
                    Archived Conversations ({archivedConversations.length})
                </div>
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
                                    <ArchiveRestore className="size-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteConversation(conv.id);
                                    }}
                                    className="text-red-500 text-xs"
                                >
                                    <DeleteIcon className="size-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default memo(LeftSidebar);
