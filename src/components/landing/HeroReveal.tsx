import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { BoxReveal } from "../ui/box-reveal";
import { TitleBadgeComponent } from "./TitleBadge";
import GlobalButton from "../GlobalButton";
import { ChatCircleComponent } from "./ChatCircles";
import ChatLayout from "../chat/ChatLayout";
import Login from "../login/Login";

export function HeroRevealComponent() {
  const [showChat, setShowChat] = useState(false);
  // 1. On initial load, read token & username from localStorage
  const storedToken = localStorage.getItem("token");
  const storedUsername = localStorage.getItem("username") ?? "";

  // 2. Initialize state with stored values (if any)
  const [token, setToken] = useState<string | null>(storedToken);
  const [username, setUsername] = useState<string>(storedUsername);

  // 3. Whenever user logs in, store in localStorage + set state
  const handleLogin = (newToken: string, userName: string) => {
    setToken(newToken);
    setUsername(userName);
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", userName);
  };

  // 4. Logout removes from localStorage and resets state
  const handleLogout = () => {
    setToken(null);
    setUsername("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <div className="size-full max-w-3xl items-center justify-center overflow-hidden mb-20">
      {showChat ? (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black flex items-center justify-center">
          {/* If we have a token, show ChatLayout. Otherwise, show Login. */}
          {token ? (
            <ChatLayout
              userToken={token}
              userName={username}
              onLogout={handleLogout}
            />
          ) : (
            <Login onLogin={handleLogin} />
          )}

          <button
            onClick={() => setShowChat(false)}
            className="absolute top-4 right-4 bg-gray-800 text-white p-1 md:p-2 rounded-lg group"
          >
            <X className="group-hover:rotate-12 transition duration-300" />
          </button>
        </div>
      ) : (
        <>
          <BoxReveal boxColor={"#5046e6"} duration={0.5}>
            <>
              <TitleBadgeComponent />
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold pt-4 px-6 text-center md:text-start md:px-0">
                ChatSpace - For fast & easy chat
                <span className="text-sky-700">.</span>
              </h2>
            </>
          </BoxReveal>

          <BoxReveal boxColor={"#5046e6"} duration={0.5}>
            <h2 className="mt-[.5rem] text-[1rem] pl-14 md:pl-6 lg:pl-0">
              Made by <span className="text-sky-700">Klaay ApS</span>
            </h2>
          </BoxReveal>

          <BoxReveal boxColor={"#5046e6"} duration={0.5}>
            <div className="mt-6 px-6 md:px-0 text-sm md:text-base">
              <ul className="space-y-2 pl-4 lg:pl-0">
                <li className="lg:text-balance">
                  ✨ ChatSpace: Where Conversations Flow Effortlessly - Experience a
                  sleek, responsive, and engaging chat environment designed for
                  seamless communication.
                </li>
                <li className="lg:text-balance">
                  ✨ Built to Connect, Designed to Impress - With cutting-edge features
                  and full customization, ChatSpace keeps your chats fast, smooth,
                  and uniquely yours.
                </li>
              </ul>
            </div>
          </BoxReveal>

          <BoxReveal boxColor={"#5046e6"} duration={0.5}>
            <div className="md:flex items-center gap-6 mt-4 lg:mt-8">
              <GlobalButton
                text="Start Chat"
                icon={ArrowRight}
                onClick={() => setShowChat(true)} // Opens ChatLayout overlay
                className="ml-8 md:ml-0 px-2 md:px-4 text-sm md:text-base"
              />
              <ChatCircleComponent />
            </div>
          </BoxReveal>
        </>
      )}
    </div>
  );
}
