import {
  Home,
  PackagePlus,
  ClipboardList,
  Search,
  Bell,
  Users,
  CheckSquare,
  ListPlus,
} from 'lucide-react'

// Catálogo de todas las rutas disponibles en la app
const ITEMS = {
  inicio: { label: 'Inicio', href: '/inicio', icon: Home },
  ingreso: { label: 'Registrar Ingreso de Lote', href: '/ingreso', icon: PackagePlus },
  requerimientos: { label: 'Gestión de Requerimientos', href: '/requerimientos', icon: ClipboardList },
  inventario: { label: 'Consulta de Inventario', href: '/inventario', icon: Search },
  alertas: { label: 'Alertas y Monitoreo', href: '/alertas', icon: Bell },
  usuarios: { label: 'Gestión de Usuarios', href: '/usuarios', icon: Users },
  responsabilidades: { label: 'Asignar Responsabilidades', href: '/responsabilidades', icon: CheckSquare },
  insumosRegistro: { label: 'Registrar Insumo', href: '/insumosRegistro', icon: ListPlus },
}

// Navegación filtrada por rol — cada rol ve solo las rutas que le corresponden
//   • jefe       → gestión completa (insumos, inventario, usuarios, responsabilidades)
//   • supervisor → operaciones (requerimientos, inventario, alertas)
//   • operario   → táctico (ingreso de lotes, requerimientos, inventario)
export const NAV_BY_ROLE = {
  jefe: [ITEMS.inicio, ITEMS.insumosRegistro, ITEMS.inventario, ITEMS.usuarios, ITEMS.responsabilidades],
  supervisor: [ITEMS.inicio, ITEMS.requerimientos, ITEMS.inventario, ITEMS.alertas],
  operario: [ITEMS.inicio, ITEMS.ingreso, ITEMS.requerimientos, ITEMS.inventario],
}
