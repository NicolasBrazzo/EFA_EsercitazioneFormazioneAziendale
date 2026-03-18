import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { fetchEventStatistics } from "../services/eventsService";
import Loader from "../components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const EventStatistics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ from: "", to: "" });

  if (user && !user.isOrganizer) {
    navigate("/dashboard");
    return null;
  }

  const { data: statistics, isLoading, error } = useQuery({
    queryKey: ["eventStatistics", appliedFilters],
    queryFn: () => fetchEventStatistics(appliedFilters),
    enabled: !!user?.isOrganizer,
  });

  const handleApply = () => {
    setAppliedFilters({ from, to });
  };

  const handleReset = () => {
    setFrom("");
    setTo("");
    setAppliedFilters({ from: "", to: "" });
  };

  return (
    <div className="px-6 py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Statistiche eventi</h1>
        <p className="text-sm text-muted-foreground">
          Visualizza iscritti, check-in e percentuale di partecipazione per gli eventi passati.
        </p>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="from">Dal</Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Al</Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={handleApply}>Applica</Button>
        <Button variant="outline" onClick={handleReset}>Reset</Button>
      </div>

      {/* Content */}
      {isLoading && <Loader />}
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Errore: {error.message}
        </div>
      )}

      {statistics && statistics.length > 0 && (
        <div className="rounded-lg border bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Titolo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Iscritti</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide min-w-48">% Partecipazione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {statistics.map((ev) => (
                <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{ev.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ev.date}</td>
                  <td className="px-4 py-3">{ev.iscritti}</td>
                  <td className="px-4 py-3">{ev.checkins}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${ev.percentuale}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">{ev.percentuale}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && statistics?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nessun evento passato trovato.</p>
      )}
    </div>
  );
};
