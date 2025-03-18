import React, { memo } from "react";

interface RightChatPanelProps {
    currentConversation: any | null;
    isLoading: boolean;
    newMessage: string;
    setNewMessage: (value: string) => void;
    handleSendMessage: () => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const RightChatPanel: React.FC<RightChatPanelProps> = ({
    currentConversation,
    isLoading,
    newMessage,
    setNewMessage,
    handleSendMessage,
    messagesEndRef,
}) => {
    return (
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
    );
};

export default memo(RightChatPanel);
