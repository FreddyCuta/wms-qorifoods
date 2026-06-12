import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  ALERTS,
  INSUMOS,
  INVENTORY,
  REQUIREMENTS,
  TASKS,
  USERS,
} from "./data.js";

const AppContext = createContext(null);
  
export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(USERS);
  const [inventory] = useState(INVENTORY);
  const [insumos, setInsumos] = useState(INSUMOS);
  const [requirements, setRequirements] = useState(REQUIREMENTS);
  const [alerts, setAlerts] = useState(ALERTS);
  const [tasks, setTasks] = useState(TASKS);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const login = useCallback((user) => setCurrentUser(user), []);
  const logout = useCallback(() => setCurrentUser(null), []);

  const setRole = useCallback(
    (role) => {
      const found = users.find((u) => u.role === role && u.active);
      if (found) setCurrentUser(found);
    },
    [users],
  );

  const completeTask = useCallback((id) => {
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "completada" ? "pendiente" : "completada",
            }
          : t,
      ),
    );
  }, []);

  const attendRequirement = useCallback((id) => {
    setRequirements((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const insufficient = r.insumos.some((i) => i.stock < i.cantidad);
        return { ...r, estado: insufficient ? "parcial" : "atendido" };
      }),
    );
  }, []);

  const attendAlert = useCallback((id) => {
    setAlerts((as) =>
      as.map((a) =>
        a.id === id
          ? {
              ...a,
              atendida: {
                fecha: "06/06/2026 a las 14:45",
                por: "María Flores",
              },
            }
          : a,
      ),
    );
  }, []);

  const toggleUserActive = useCallback((id) => {
    setUsers((us) =>
      us.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    );
  }, []);

  const addUser = useCallback((u) => {
    setUsers((us) => [
      ...us,
      { ...u, id: Math.random().toString(36).slice(2) },
    ]);
  }, []);

  const assignTask = useCallback(
    (assigneeId, description) => {
      const assignee = users.find((u) => u.id === assigneeId);
      if (assignee) {
        setTasks((ts) => [
          {
            id: Math.random().toString(36).slice(2),
            assigneeId,
            assigneeName: assignee.name,
            description,
            timestamp: "Ahora",
            status: "pendiente",
          },
          ...ts,
        ]);
      }
    },
    [users],
  );

  const addInsumo = useCallback((insumo) => {
    setInsumos((ins) => [...ins, insumo]);
  }, []);

  const activeAlertCount = useMemo(
    () => alerts.filter((a) => !a.atendida).length,
    [alerts],
  );
  const pendingReqCount = useMemo(
    () => requirements.filter((r) => r.estado === "pendiente").length,
    [requirements],
  );

  const value = {
    currentUser,
    users,
    inventory,
    insumos,
    requirements,
    alerts,
    tasks,
    toasts,
    activeAlertCount,
    pendingReqCount,
    login,
    logout,
    setRole,
    addToast,
    dismissToast,
    completeTask,
    attendRequirement,
    attendAlert,
    toggleUserActive,
    addUser,
    assignTask,
    addInsumo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
