"use client";

import React, { useState } from "react";
import { usePostApiMutation } from "@/hooks/useApiQuery";
import { useRouter } from "next/navigation";

type SignInUser = {
  email: string;
  password: string;
};

type SignInResponse = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
};

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const mutation = usePostApiMutation<SignInResponse, SignInUser>(
    "v1/auth/sign-in",
    {
      onSuccess: (data) => {
        console.log("Logged in:", data);
        router.push("/dashboard"); // or any protected route
      },
      onError: (error) => {
        console.error("Login failed:", error.message);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold">Sign In</h2>
      <input
        type="email"
        placeholder="Email"
        required
        id="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        required
        id="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded"
      />
      {mutation.error && (
        <p className="text-red-600 text-sm">
          {(mutation.error as { response?: { data?: { message?: string } } })
            ?.response?.data?.message || "Login failed"}
        </p>
      )}
      <button
        disabled={mutation.isPending}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        type="submit"
      >
        {mutation.isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
