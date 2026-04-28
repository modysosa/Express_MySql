import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api";

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiRequest("/api/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const createUser = useCallback(async (payload) => {
    setError("");
    await apiRequest("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await loadUsers();
  }, [loadUsers]);

  const toggleRole = useCallback(async (target) => {
    setError("");
    await apiRequest(`/api/admin/users/${target.id}/role`, {
      method: "PUT",
      body: JSON.stringify({ isAdmin: target.role !== "admin" }),
    });
    await loadUsers();
  }, [loadUsers]);

  const deleteUser = useCallback(async (id) => {
    setError("");
    await apiRequest(`/api/admin/users/${id}`, { method: "DELETE" });
    await loadUsers();
  }, [loadUsers]);

  const updateUser = useCallback(async (id, payload) => {
    setError("");
    await apiRequest(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    await loadUsers();
  }, [loadUsers]);

  return {
    users,
    error,
    isLoading,
    loadUsers,
    createUser,
    updateUser,
    toggleRole,
    deleteUser,
  };
};
