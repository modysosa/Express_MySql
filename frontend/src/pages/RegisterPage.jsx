import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="min-h-screen px-4 py-1">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="lg:flex">
            <div className="w-full px-6 py-10 md:px-12 lg:w-6/12">
              <div className="text-center">
                <img
                  className="mx-auto w-40"
                  src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                  alt="logo"
                />
                <h2 className="mb-10 mt-4 text-2xl font-bold text-slate-900">
                  Create an account
                </h2>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <p className="text-sm text-slate-600">
                  Please Fill in the information to create an account
                </p>

                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Your Name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />

                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />

                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />

                <button
                  type="submit"
                  className="w-full rounded-xl px-6 py-3 text-sm font-semibold uppercase text-white shadow-md transition hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                  }}
                >
                  Register
                </button>
              </form>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-8 flex items-center justify-between gap-4">
                <p className="text-sm text-slate-600">
                  Already have an account?
                </p>

                <Link
                  to="/login"
                  className="rounded-xl border-2 border-rose-500 px-5 py-2 text-xs font-semibold uppercase text-rose-600 transition hover:bg-rose-50"
                >
                  Log In
                </Link>
              </div>
            </div>

            <div
              className="flex items-center px-6 py-10 text-white md:px-12 lg:w-6/12"
              style={{
                background:
                  "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
              }}
            >
              <div>
                <h3 className="mb-6 text-2xl font-bold">
                  Mohamed Sousa App - Auth with Market Prices
                </h3>
                <p className="text-sm leading-6">
                  Sign in to manage your dashboard, users, and application data
                  from one secure place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
