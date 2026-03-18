import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import Loader from "../components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { CheckCircle, Clock } from "lucide-react";
import { showSuccess } from "@/utils/toast";

import { fetchEvents } from "../services/eventsService";
import {
  fetchSubscriptions,
  updateSubscription,
} from "../services/subscriptionsService";

// --- Checkin Panel ---
const CheckinPanel = ({ events }) => {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [checkinTimes, setCheckinTimes] = useState({});
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["subscriptions", { event_id: selectedEventId }],
    queryFn: () => fetchSubscriptions({ event_id: selectedEventId }),
    enabled: !!selectedEventId,
  });

  const handleToggleCheckin = async (sub) => {
    try {
      await updateSubscription(sub.id, { checkinDone: !sub.checkinDone, checkinTime: sub.checkinTime });
      showSuccess("Checkin aggiornato");
      queryClient.invalidateQueries({ queryKey: ["subscriptions", { event_id: selectedEventId }] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTime = async (sub) => {
    const time = checkinTimes[sub.id] ?? sub.checkinTime ?? "";
    try {
      await updateSubscription(sub.id, { checkinDone: sub.checkinDone, checkinTime: time || null });
      showSuccess("Orario checkin salvato");
      queryClient.invalidateQueries({ queryKey: ["subscriptions", { event_id: selectedEventId }] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="space-y-1.5 min-w-64">
          <Label className="text-xs">Seleziona evento</Label>
          <Select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">Scegli un evento...</option>
            {events?.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} — {ev.date}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <Loader />}

      {selectedEventId && !isLoading && subscriptions?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nessuna iscrizione per questo evento.</p>
      )}

      {subscriptions && subscriptions.length > 0 && (
        <div className="rounded-lg border bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">ID Iscrizione</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Checkin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Orario checkin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{sub.id}</td>
                  <td className="px-4 py-3">{sub.user?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sub.user?.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    {sub.checkinDone ? (
                      <Badge variant="success">Presente</Badge>
                    ) : (
                      <Badge variant="muted">Assente</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        className="h-7 w-32 text-xs"
                        value={checkinTimes[sub.id] ?? sub.checkinTime ?? ""}
                        onChange={(e) =>
                          setCheckinTimes((prev) => ({ ...prev, [sub.id]: e.target.value }))
                        }
                      />
                      <Button variant="ghost" size="icon-sm" onClick={() => handleSaveTime(sub)}>
                        <Clock className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant={sub.checkinDone ? "outline" : "default"}
                      size="xs"
                      onClick={() => handleToggleCheckin(sub)}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      {sub.checkinDone ? "Annulla" : "Checkin"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Main Checkin Page ---
export const Checkin = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pannello check-in</h1>
        <p className="text-sm text-muted-foreground">
          Seleziona un evento per gestire la presenza dei partecipanti.
        </p>
      </div>
      {isLoading ? <Loader /> : <CheckinPanel events={events} />}
    </div>
  );
};
