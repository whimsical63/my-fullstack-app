"use client";

import { useGetApiQuery } from "@/hooks/useApiQuery";

export default function Home() {
  const { data, error, isLoading } = useGetApiQuery(["hello"], "/");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data[0].title}</div>;
}
