import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Loader from "../components/Loader";
import { showSuccess } from "@/utils/toast";
import { useAuth } from "../context/AuthContext";

import { fetchEvents } from "../services/eventsService";
import { fetchSubscriptions, createSubscription } from "../services/subscriptionsService";

export const MyEvents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const { data: mySubscriptions } = useQuery({
    queryKey: ["subscriptions", { user_id: user?.id }],
    queryFn: () => fetchSubscriptions({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const subscribedEventIds = new Set(mySubscriptions?.map((s) => s.event_id) ?? []);

  const handleSubscribe = async (eventId) => {
    try {
      await createSubscription({ user_id: user.id, event_id: eventId });
      showSuccess("Iscrizione effettuata con successo");
      await queryClient.invalidateQueries({ queryKey: ["subscriptions", { user_id: user.id }] });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Eventi disponibili</h1>
        <p className="text-sm text-muted-foreground">
          Iscriviti agli eventi entro il giorno precedente alla data dell'evento.
        </p>
      </div>

      {isLoading && <Loader />}
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Errore nel caricamento degli eventi.
        </div>
      )}

      {events && events.length > 0 && (
        <div className="rounded-lg border bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Titolo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Descrizione</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((ev) => {
                const isSubscribed = subscribedEventIds.has(ev.id);
                return (
                  <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{ev.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ev.date}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{ev.description || "—"}</td>
                    <td className="px-4 py-3">
                      {isSubscribed ? (
                        <Badge variant="success">Iscritto</Badge>
                      ) : (
                        <Button size="xs" onClick={() => handleSubscribe(ev.id)}>
                          Iscriviti
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && events?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nessun evento disponibile.</p>
      )}
    </div>
  );
};
