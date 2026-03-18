import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ClipboardList, ArrowRight, BarChart2 } from "lucide-react";

import { fetchEvents } from "../services/eventsService";
import { fetchSubscriptions } from "../services/subscriptionsService";
import { Button } from "@/components/ui/button";

export const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const { data: mySubscriptions, isLoading: loadingSubs } = useQuery({
    queryKey: ["subscriptions", { user_id: user?.id }],
    queryFn: () => fetchSubscriptions({ user_id: user?.id }),
    enabled: !!user?.id && !user?.isOrganizer,
  });

  if (loading) return <p>loading...</p>;
  if (!user) return <p>Accesso negato</p>;

  const totalEvents = events?.length ?? 0;
  const mySubsCount = mySubscriptions?.length ?? 0;
  const checkedInCount = mySubscriptions?.filter((s) => s.checkinDone).length ?? 0;

  return (
    <div className="px-6 py-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Benvenuto nel gestionale formazione aziendale.
          </p>
          <p className="mt-1 text-sm">
            Utente:{" "}
            <span className="font-medium">{user.email}</span>
            {user.isOrganizer && (
              <span className="ml-2 inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/20">
                Organizzatore
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => logout()}>
          Logout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Events card — visible to all */}
        <div
          className="cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-border/80 group"
          onClick={() => navigate(user.isOrganizer ? "/events" : "/my-events")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
            {loadingEvents ? (
              <span className="text-xs text-muted-foreground">Caricamento...</span>
            ) : (
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <p className="text-2xl font-semibold">{totalEvents}</p>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            {user.isOrganizer ? "Eventi" : "Eventi disponibili"}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {user.isOrganizer
              ? "Gestisci gli eventi e i check-in dei partecipanti."
              : "Visualizza tutti gli eventi a cui puoi iscriverti."}
          </p>
        </div>

        {/* Organizer: quick link to checkin */}
        {user.isOrganizer && (
          <div
            className="cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-border/80 group"
            onClick={() => navigate("/checkin")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Pannello check-in</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Registra la presenza dei partecipanti agli eventi.
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate("/checkin"); }}>
                Vai agli eventi
              </Button>
            </div>
          </div>
        )}

        {/* Organizer: quick link to statistics */}
        {user.isOrganizer && (
          <div
            className="cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-border/80 group"
            onClick={() => navigate("/statistics")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Statistiche eventi</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Visualizza iscritti e percentuali di check-in per gli eventi passati.
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate("/event-statistics"); }}>
                Vai alle statistiche
              </Button>
            </div>
          </div>
        )}

        {/* Employee: my subscriptions */}
        {!user.isOrganizer && (
          <div
            className="cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-border/80 group"
            onClick={() => navigate("/subscriptions")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </div>
              {loadingSubs ? (
                <span className="text-xs text-muted-foreground">Caricamento...</span>
              ) : (
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <p className="text-2xl font-semibold">{mySubsCount}</p>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">Le mie iscrizioni</p>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Check-in effettuati</span>
                <span className="font-semibold text-foreground">{checkedInCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
