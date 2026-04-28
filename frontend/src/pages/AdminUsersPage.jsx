import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAdminUsers } from "../hooks/useAdminUsers";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

const AdminUsersPage = () => {
  const { user } = useAuth();
  const { users, error, isLoading, createUser, updateUser, toggleRole, deleteUser } =
    useAdminUsers();
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "" });

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
  });

  const handleCreateUser = async (event) => {
    event.preventDefault();
    try {
      await createUser(createForm);
      setCreateForm({ name: "", email: "", password: "", isAdmin: false });
    } catch (err) {
      // Handled in hook state
    }
  };

  const startEdit = (targetUser) => {
    setEditingUserId(targetUser.id);
    setEditForm({
      name: targetUser.name,
      email: targetUser.email,
      password: "",
    });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ name: "", email: "", password: "" });
  };

  const saveEdit = async (id) => {
    const payload = {
      name: editForm.name,
      email: editForm.email,
    };

    if (editForm.password.trim()) {
      payload.password = editForm.password;
    }

    await updateUser(id, payload);
    cancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Admin Users</h2>
        <p className="mt-1 text-sm text-slate-600">Signed in as {user.email}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Create user</h3>
        <form onSubmit={handleCreateUser} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            className={inputClass}
            placeholder="Name"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Email"
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Password"
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            required
          />
          <label className="flex items-center justify-between rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            Admin role
            <input
              type="checkbox"
              checked={createForm.isAdmin}
              onChange={(e) => setCreateForm({ ...createForm, isAdmin: e.target.checked })}
            />
          </label>
          <button
            type="submit"
            className="md:col-span-2 xl:col-span-4 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Create user
          </button>
        </form>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {isLoading && <p className="text-sm text-slate-600">Loading users...</p>}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 text-slate-800">
                    {editingUserId === item.id ? (
                      <input
                        className={inputClass}
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {editingUserId === item.id ? (
                      <div className="space-y-2">
                        <input
                          className={inputClass}
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                        <input
                          className={inputClass}
                          type="password"
                          placeholder="New password (optional)"
                          value={editForm.password}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        />
                      </div>
                    ) : (
                      item.email
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {item.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRole(item)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
                      >
                        Toggle role
                      </button>
                      {editingUserId === item.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(item.id)}
                            className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          Edit
                        </button>
                      )}
                      {item.id !== user.id && (
                        <button
                          type="button"
                          onClick={() => deleteUser(item.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
