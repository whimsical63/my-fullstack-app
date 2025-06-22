"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { formatToUTC8AMPM } from "@/helpers/timezoneConverter";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to your Dashboard
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Hello, {user?.name}! You are successfully authenticated.
                </p>
                <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
                  <h2 className="text-xl font-semibold mb-4">
                    User Information
                  </h2>
                  <div className="space-y-2 text-left">
                    <p>
                      <strong>Name:</strong> {user?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user?.email}
                    </p>
                    <p>
                      <strong>User ID:</strong> {user?.id}
                    </p>
                    <p>
                      <strong>Member since:</strong>{" "}
                      {user?.createdAt
                        ? formatToUTC8AMPM(user.createdAt)
                        : "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
