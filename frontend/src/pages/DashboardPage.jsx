import { useAuth } from "../context/AuthContext";

const statCardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Overview of your signed-in account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className={statCardClass}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{user.name}</p>
        </div>
        <div className={statCardClass}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{user.email}</p>
        </div>
        <div className={statCardClass}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
          <p className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            {user.role}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
