import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Loader from "../components/Loader";
import { showSuccess } from "@/utils/toast";
import { useAuth } from "../context/AuthContext";

import { fetchEvents } from "../services/eventsService";
import {
  fetchSubscriptions,
  deleteSubscription,
} from "../services/subscriptionsService";

export const Subscriptions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const {
    data: mySubscriptions,
    isLoading: loadingSubs,
    error: subsError,
  } = useQuery({
    queryKey: ["subscriptions", { user_id: user?.id }],
    queryFn: () => fetchSubscriptions({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const handleCancel = async (sub) => {
    if (!window.confirm("Sei sicuro di voler annullare questa iscrizione?")) return;
    try {
      await deleteSubscription(sub.id);
      showSuccess("Iscrizione annullata");
      await queryClient.invalidateQueries({ queryKey: ["subscriptions", { user_id: user.id }] });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const getEventTitle = (eventId) => events?.find((e) => e.id === eventId)?.title ?? eventId;
  const getEventDate = (eventId) => events?.find((e) => e.id === eventId)?.date ?? "—";

  const today = new Date().toISOString().split("T")[0];
  const isPast = (dateStr) => dateStr < today;

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Le mie iscrizioni</h1>
        <p className="text-sm text-muted-foreground">
          Puoi annullare un'iscrizione entro il giorno precedente all'evento.
        </p>
      </div>

      {loadingSubs && <Loader />}
      {subsError && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Errore nel caricamento delle iscrizioni.
        </div>
      )}

      {mySubscriptions && mySubscriptions.length > 0 && (
        <div className="rounded-lg border bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Evento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Data evento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Orario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mySubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{getEventTitle(sub.event_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{getEventDate(sub.event_id)}</td>
                  <td className="px-4 py-3">
                    {sub.checkinDone ? (
                      <Badge variant="success">Presente</Badge>
                    ) : (
                      <Badge variant="muted">—</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sub.checkinTime || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {isPast(getEventDate(sub.event_id)) ? (
                      <span className="text-xs text-muted-foreground">Evento passato</span>
                    ) : (
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => handleCancel(sub)}
                      >
                        Annulla
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loadingSubs && !subsError && mySubscriptions?.length === 0 && (
        <p className="text-sm text-muted-foreground">Non sei iscritto a nessun evento.</p>
      )}
    </div>
  );
};
