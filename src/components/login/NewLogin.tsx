import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { MagicCard } from "../ui/magic-card";
import ChatService from "../../lib/ChatService";

interface NewLoginComponentProps {
    onLogin: (token: string, username: string) => void;
}

export function NewLoginComponent({ onLogin }: NewLoginComponentProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        try {
            const { token } = await ChatService.authenticate(username, password);
            onLogin(token, username);
        } catch (err) {
            setErrorMessage("Invalid username or password");
            console.error("Login failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white">
            <MagicCard gradientColor={"#5c9ab752"}>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                    </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {errorMessage && (
                            <p className="text-red-500 text-sm">{errorMessage}</p>
                        )}
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full bg-slate-700 text-slate-300 hover:bg-inherit hover:text-slate-800 transition-colors"
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Sign In"}
                            </Button>
                        </CardFooter>
                    </form>
                </CardContent>
            </MagicCard>
        </Card>
    );
};
