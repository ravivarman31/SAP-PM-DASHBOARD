
import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  User,
  LogIn,
  ShieldCheck,
} from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      /*
       * Temporary frontend login.
       *
       * Later this will be replaced with
       * NLC SAP ECC authentication/API.
       */
      const validUsername = "admin";
      const validPassword = "admin123";

      if (
        username.trim() === validUsername &&
        password === validPassword
      ) {
        if (rememberMe) {
          localStorage.setItem(
            "sap_pm_remember_login",
            "true"
          );
        }

        localStorage.setItem(
          "sap_pm_authenticated",
          "true"
        );

        onLogin();
      } else {
        setError("Invalid username or password.");
      }

      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT PANEL */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 lg:flex">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <WrenchIcon />
                </div>

                <div>
                  <p className="text-lg font-bold text-white">
                    SAP PM
                  </p>

                  <p className="text-xs text-blue-200">
                    Plant Maintenance
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100 backdrop-blur">
                <ShieldCheck size={14} />
                Enterprise Maintenance Platform
              </div>

              <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                NLC SAP PM
                <br />
                Maintenance Dashboard
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-blue-100">
                Monitor equipment, breakdowns, maintenance
                orders and plant maintenance activities from
                one centralized dashboard.
              </p>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                <InfoCard
                  title="Equipment"
                  value="PM"
                />

                <InfoCard
                  title="Orders"
                  value="Live"
                />

                <InfoCard
                  title="Plants"
                  value="6"
                />
              </div>
            </div>

            <p className="text-xs text-blue-200/70">
              SAP Plant Maintenance • Internal Enterprise System
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN PANEL */}
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* MOBILE LOGO */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <WrenchIcon />
              </div>

              <div>
                <p className="font-bold text-slate-800">
                  SAP PM
                </p>

                <p className="text-xs text-slate-500">
                  Plant Maintenance
                </p>
              </div>
            </div>

            {/* LOGIN CARD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LockKeyhole size={23} />
                </div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to access the SAP PM dashboard.
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {/* USERNAME */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Username
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={username}
                      onChange={(event) =>
                        setUsername(event.target.value)
                      }
                      placeholder="Enter username"
                      autoComplete="username"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* REMEMBER */}
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    Remember me
                  </label>

                  <span className="text-xs font-medium text-slate-400">
                    NLC Internal
                  </span>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              NLC SAP PM Dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WrenchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a4.2 4.2 0 0 0-5.4 5.4L3.5 17.5a2.1 2.1 0 0 0 3 3l5.8-5.8a4.2 4.2 0 0 0 5.4-5.4l-2.5 2.5-3-3 2.5-2.5Z" />
    </svg>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
      <p className="text-[11px] text-blue-200">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold text-white">
        {value}
      </p>
    </div>
  );
}

