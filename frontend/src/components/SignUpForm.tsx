"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostApiMutation } from "@/hooks/useApiQuery";

type NewUser = {
  name: string;
  email: string;
  password: string;
};

type UserResponse = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const mutation = usePostApiMutation<UserResponse, NewUser>(
    "v1/auth/sign-up",
    {
      onSuccess: (data) => {
        console.log("User registered:", data);
        setEmail("");
        setName("");
        setPassword("");
        router.push("/dashboard");
      },
      onError: (error) => {
        console.error("Registration failed:", error);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ name, email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold">Sign Up</h2>
      <input
        type="text"
        placeholder="Name"
        required
        id="name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />
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
            ?.response?.data?.message || "Sign up failed"}
        </p>
      )}
      <button
        disabled={mutation.isPending}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        type="submit"
      >
        {mutation.isPending ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
