import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { cn } from "../lib/utils.js";

export default function LoginPage() {
  const { login, currentUser } = useApp();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("none");
  const [loading, setLoading] = useState(false);

  if (currentUser) return <Navigate to="/inicio" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    const email = emailRef.current?.value ?? "";
    const password = passwordRef.current?.value ?? "";
    setLoading(true);
    setError("none");
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError("inactive");
      } else {
        setError("credentials");
      }
    } finally {
      setLoading(false);
    }
  }

  const credErr = error === "credentials";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-col items-center justify-center gap-3 bg-[var(--sidebar-bg)] px-8 py-12 text-center md:w-1/2">
        <div className="flex size-12 items-center justify-center bg-[var(--sidebar-accent)] text-lg font-bold text-white">QF</div>
        <h1 className="text-3xl font-bold text-[var(--sidebar-accent)]">WMS Qori Foods</h1>
        <p className="text-sm text-[var(--sidebar-text)]/70">Sistema de Gestión de Almacén de Insumos</p>
        <div className="h-px w-20 bg-[var(--sidebar-accent)]/30" />
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[400px]"
          noValidate
        >
          <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Iniciar sesión</h2>

          <div className="mt-5 flex flex-col gap-3">
            <div className="flex flex-col gap-[4px]">
              <label
                htmlFor="login-email"
                className="text-[12px] font-medium text-[var(--text-secondary)]"
              >
                Correo electrónico
              </label>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                defaultValue=""
                placeholder="usuario@qorifoods.com"
                className={cn(
                  "h-8 w-full rounded-md border bg-[var(--surface-overlay)] px-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]",
                  credErr ? "border-[var(--danger)]" : "border-[var(--border-default)]",
                )}
              />
            </div>

            <div className="flex flex-col gap-[4px]">
              <label
                htmlFor="login-password"
                className="text-[12px] font-medium text-[var(--text-secondary)]"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  ref={passwordRef}
                  type={show ? "text" : "password"}
                  defaultValue=""
                  className={cn(
                    "h-8 w-full rounded-md border bg-[var(--surface-overlay)] px-2 pr-9 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]",
                    credErr ? "border-[var(--danger)]" : "border-[var(--border-default)]",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  {show ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {credErr && (
                <p className="text-[11px] text-[var(--danger)]" style={{ marginTop: '3px' }}>
                  Correo o contraseña incorrectos. Intente nuevamente.
                </p>
              )}
            </div>

            <ActionButton type="submit" fullWidth disabled={loading}>
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </ActionButton>

            {error === "inactive" && (
              <div className="rounded-md border border-[var(--danger)]/30 bg-[var(--danger-subtle)] px-3 py-2 text-[13px] text-[var(--danger)]">
                Su cuenta se encuentra inactiva. Contacte al Jefe de Almacén.
              </div>
            )}

            <p className="text-center text-[11px] text-[var(--text-tertiary)]">
              ¿Problemas para ingresar? Contacte al administrador.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
