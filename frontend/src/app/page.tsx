"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function Home() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["hello"],
    queryFn: () => api.get("/api/hello").then((res) => res.data),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data.message}</div>;
}
