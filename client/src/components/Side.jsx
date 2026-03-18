import { useState } from "react";
import { BarChart2, CalendarDays, ClipboardCheck, ClipboardList, LayoutDashboard, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ORGANIZER_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",       path: "/dashboard" },
  { icon: CalendarDays,    label: "Gestione eventi", path: "/events" },
  { icon: ClipboardCheck,  label: "Check-in",        path: "/checkin" },
  { icon: Users,           label: "Gestione utenti",   path: "/users" },
  { icon: BarChart2,       label: "Statistiche eventi", path: "/statistics" },
];

const EMPLOYEE_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",         path: "/dashboard" },
  { icon: CalendarDays,    label: "Eventi",            path: "/my-events" },
  { icon: ClipboardList,   label: "Le mie iscrizioni", path: "/subscriptions" },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const menuItems = user?.isOrganizer ? ORGANIZER_ITEMS : EMPLOYEE_ITEMS;

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-50 h-full bg-sidebar",
        "transition-all duration-300 ease-in-out border-r border-sidebar-border",
        isOpen ? "w-64" : "w-16",
      ].join(" ")}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-sidebar-primary">
            <span className="text-sidebar-primary-foreground font-bold text-lg">
              🗓️
            </span>
          </div>
          {isOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-sidebar-foreground text-sm font-medium whitespace-nowrap">
                Formazione aziendale
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              ].join(" ")
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {isOpen && (
              <span className="overflow-hidden whitespace-nowrap text-sm">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
