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
      {/* Panel izquierdo — la marca, básicamente el escaparate de Qori Foods */}
      <div className="flex flex-col items-center justify-center gap-4 bg-brand px-8 py-16 text-center md:w-1/2">
        <img
          src="/images/LOGO-QORI.png"
          alt="Qori Foods"
          className="h-16 w-auto"
        />
        <h1 className="text-4xl font-bold text-primary">WMS Qori Foods</h1>
        <p className="text-sm text-brand-foreground/80">
          Sistema de Gestión de Almacén de Insumos
        </p>
        <div className="h-px w-24 bg-primary" />
      </div>

      {/* Panel derecho — formulario de login */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[480px]"
          noValidate
        >
          <h2 className="text-2xl font-bold text-foreground">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingrese sus credenciales para continuar
          </p>

          <div className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-foreground"
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
                  "h-9 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
                  credErr ? "border-critical" : "border-input",
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-foreground"
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
                    "h-9 w-full rounded-md border bg-background px-3 pr-10 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20",
                    credErr ? "border-critical" : "border-input",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={
                    show ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {credErr && (
                <p className="text-xs text-critical">
                  Correo o contraseña incorrectos. Intente nuevamente.
                </p>
              )}
            </div>

            <ActionButton type="submit" fullWidth disabled={loading}>
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </ActionButton>

            {error === "inactive" && (
              <div className="rounded-md border border-critical/30 bg-critical/10 px-3 py-2.5 text-sm text-critical">
                Su cuenta se encuentra inactiva. Contacte al Jefe de Almacén.
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              ¿Problemas para ingresar? Contacte al administrador.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
