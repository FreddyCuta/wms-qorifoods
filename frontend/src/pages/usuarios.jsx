import { useState } from "react";
import {
  Pencil,
  Power,
  RotateCcw,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { Badge } from "../components/ui/status-badge.jsx";
import { Modal, ModalFooter } from "../components/ui/modal.jsx";
import { Field, SelectInput, TextInput } from "../components/ui/form-field.jsx";

function roleBadge(role) {
  if (role === "jefe") return <Badge color="navy">Jefe de Almacén</Badge>;
  if (role === "supervisor")
    return <Badge color="blue">Supervisor de Almacén</Badge>;
  return <Badge color="gray">Operario de Almacén</Badge>;
}

export default function UsuariosPage() {
  const {
    users,
    currentUser,
    tasks,
    toggleUserActive,
    addUser,
    updateUser,
    addToast,
  } = useApp();
  const [modal, setModal] = useState({ kind: "none" });

  function pendingTasksFor(userId) {
    return tasks.filter(
      (t) => t.assigneeId === userId && t.status === "pendiente",
    ).length;
  }

  return (
    <AppShell title="Gestión de Usuarios" allowedRoles={["jefe"]}>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
            Usuarios del sistema
          </h2>
          <ActionButton size="sm" onClick={() => setModal({ kind: "create" })}>
            Nuevo Usuario
          </ActionButton>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--surface-overlay)] text-left text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                <th className="px-3 py-2">Nombre completo</th>
                <th className="px-3 py-2">Correo electrónico</th>
                <th className="px-3 py-2">Rol</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr
                    key={u.id}
                    className="group hover:bg-[var(--surface-raised)]"
                  >
                    <td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">
                      {u.nombre}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-secondary)]">
                      {u.email}
                    </td>
                    <td className="px-3 py-2.5">{roleBadge(u.role)}</td>
                    <td className="px-3 py-2.5">
                      {u.active ? (
                        <Badge color="green">Activo</Badge>
                      ) : (
                        <Badge color="red">Inactivo</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label="Editar usuario"
                          disabled={isSelf}
                          onClick={() => setModal({ kind: "edit", user: u })}
                          className="rounded p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        {!isSelf &&
                          (u.active ? (
                            <button
                              type="button"
                              aria-label="Desactivar usuario"
                              onClick={() =>
                                setModal({
                                  kind: "deactivate",
                                  user: u,
                                  pendingTasks: pendingTasksFor(u.id),
                                })
                              }
                              className="rounded p-1 text-[var(--danger)] transition-colors hover:bg-[var(--danger-subtle)]"
                            >
                              <Power className="size-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              aria-label="Reactivar usuario"
                              onClick={() => {
                                toggleUserActive(u.id);
                                addToast(`${u.nombre} ha sido reactivado.`);
                              }}
                              className="rounded p-1 text-[var(--success)] transition-colors hover:bg-[var(--success-subtle)]"
                            >
                              <RotateCcw className="size-3.5" />
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal.kind === "create" && (
        <CreateUserModal
          onClose={() => setModal({ kind: "none" })}
          onCreate={async (name, email, password, role) => {
            try {
              await addUser({ name, email, password, role, active: true });
              setModal({ kind: "none" });
              addToast("Usuario creado correctamente.");
            } catch (err) {
              addToast(
                err?.response?.data?.error ||
                  "Error al crear usuario. Verifica la conexión con el servidor.",
                "error",
              );
            }
          }}
        />
      )}
      {modal.kind === "edit" && (
        <EditUserModal
          user={modal.user}
          onClose={() => setModal({ kind: "none" })}
          onSave={async (id, data) => {
            try {
              await updateUser(id, data);
              setModal({ kind: "none" });
              addToast("Cambios guardados correctamente.");
            } catch (err) {
              addToast(
                err?.response?.data?.error ||
                  "Error al actualizar usuario. Verifica la conexión con el servidor.",
                "error",
              );
            }
          }}
        />
      )}
      {modal.kind === "deactivate" && (
        <DeactivateUserModal
          user={modal.user}
          pendingTasks={modal.pendingTasks}
          onClose={() => setModal({ kind: "none" })}
          onConfirm={async () => {
            try {
              await toggleUserActive(modal.user.id);
              setModal({ kind: "none" });
              addToast(`${modal.user.nombre} ha sido desactivado.`);
            } catch (err) {
              addToast(
                err?.response?.data?.error ||
                  "Error al desactivar usuario. Verifica la conexión con el servidor.",
                "error",
              );
            }
          }}
        />
      )}
    </AppShell>
  );
}

function PasswordInputControlled({ value, onChange, invalid, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <TextInput
        type={show ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
      >
        {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
    </div>
  );
}

function CreateUserModal({ onClose, onCreate }) {
  const { users } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("operario");
  const [submitted, setSubmitted] = useState(false);

  const emailExists = users.some((u) => u.email === email.trim().toLowerCase());
  const nameError =
    submitted && !name.trim() ? "Este campo es obligatorio." : undefined;
  const emailError =
    submitted && emailExists
      ? "Ya existe un usuario registrado con este correo electrónico."
      : undefined;
  const confirmError =
    submitted && pass !== confirm ? "Las contraseñas no coinciden." : undefined;

  function handle() {
    setSubmitted(true);
    if (!name.trim() || emailExists || pass !== confirm || !pass) return;
    onCreate(name.trim(), email.trim().toLowerCase(), pass, role);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Crear nuevo usuario"
      footer={
        <>
          <ActionButton variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </ActionButton>
          <ActionButton onClick={handle}>Crear usuario</ActionButton>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Nombre completo" error={nameError}>
          <TextInput
            value={name}
            invalid={!!nameError}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Correo electrónico" error={emailError}>
          <TextInput
            type="email"
            value={email}
            invalid={!!emailError}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Contraseña">
          <PasswordInputControlled value={pass} onChange={setPass} />
        </Field>
        <Field label="Confirmar contraseña" error={confirmError}>
          <PasswordInputControlled
            value={confirm}
            onChange={setConfirm}
            invalid={!!confirmError}
          />
        </Field>
        <Field label="Rol">
          <SelectInput value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="supervisor">Supervisor de Almacén</option>
            <option value="operario">Operario de Almacén</option>
          </SelectInput>
        </Field>
      </div>
    </Modal>
  );
}

function EditUserModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.nombre);
  const [role, setRole] = useState(user.role);
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState("");

  function handleSave() {
    if (pass && pass !== confirm) {
      setConfirmError("Las contraseñas no coinciden.");
      return;
    }
    const data = { name: name.trim(), role };
    if (pass) data.password = pass;
    onSave(user.id, data);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Editar usuario"
      footer={
        <>
          <ActionButton variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </ActionButton>
          <ActionButton onClick={handleSave}>Guardar cambios</ActionButton>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Nombre completo">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Correo electrónico">
          <div className="relative">
            <TextInput readOnly value={user.email} className="pr-10" />
            <Lock className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
          </div>
        </Field>
        <Field label="Nuevo password">
          <PasswordInputControlled
            value={pass}
            onChange={setPass}
            placeholder="Dejar en blanco para no cambiar"
          />
        </Field>
        <Field label="Confirmar nuevo password" error={confirmError}>
          <PasswordInputControlled
            value={confirm}
            onChange={setConfirm}
            invalid={!!confirmError}
          />
        </Field>
        <Field label="Rol">
          <SelectInput value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="supervisor">Supervisor de Almacén</option>
            <option value="operario">Operario de Almacén</option>
          </SelectInput>
        </Field>
      </div>
    </Modal>
  );
}

function DeactivateUserModal({ user, pendingTasks, onClose, onConfirm }) {
  const hasPending = pendingTasks > 0;
  return (
    <Modal
      open
      onClose={onClose}
      title="Desactivar usuario"
      footer={
        <>
          <ActionButton variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </ActionButton>
          <ActionButton variant="danger" onClick={onConfirm}>
            {hasPending ? "Desactivar de todas formas" : "Desactivar"}
          </ActionButton>
        </>
      }
    >
      <p className="text-[13px] text-[var(--text-secondary)]">
        ¿Está seguro de que desea desactivar a{" "}
        <span className="font-medium text-[var(--text-primary)]">
          {user.nombre}
        </span>
        ? El usuario no podrá iniciar sesión hasta que sea reactivado.
      </p>
      {hasPending && (
        <div className="mt-4 flex items-start gap-2 rounded-sm border border-[var(--warning-subtle)] bg-[var(--warning-subtle)] px-3 py-2.5 text-[13px] text-[var(--warning)]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Este usuario tiene {pendingTasks} tareas pendientes asignadas. Si lo
            desactiva, dichas tareas quedarán sin responsable asignado.
          </p>
        </div>
      )}
    </Modal>
  );
}
