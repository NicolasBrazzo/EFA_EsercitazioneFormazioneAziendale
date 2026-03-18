import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import Loader from "../components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { showSuccess } from "@/utils/toast";

import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../services/eventsService";
import { sortByField } from "../utils/sortHelpers";
import { EVENTS_COLUMN_LABELS } from "../constants/columnLabels";

// --- Sort Icon ---
const SortIcon = ({ field, sortField, sortDirection }) => {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
  return sortDirection === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 text-foreground" />
    : <ChevronDown className="h-3.5 w-3.5 text-foreground" />;
};

// --- Event Form ---
const EventForm = ({ initialData, onSubmit, error }) => {
  const [formState, setFormState] = useState({
    title: initialData?.title || "",
    date: initialData?.date || "",
    description: initialData?.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formState);
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="title">Titolo</Label>
        <Input
          id="title"
          name="title"
          placeholder="Nome evento"
          value={formState.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formState.date}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Descrizione</Label>
        <Input
          id="description"
          name="description"
          placeholder="Descrizione opzionale"
          value={formState.description}
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
      <div className="flex justify-end pt-1">
        <Button type="submit" size="sm">Salva</Button>
      </div>
    </form>
  );
};

// --- Main Events Page ---
export const Events = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formError, setFormError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("desc");
  const queryClient = useQueryClient();

  const SORT_CONFIG = {
    title: { type: "string" },
    date: { type: "date" },
  };

  const handleSort = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("desc");
      return;
    }
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const sortedEvents =
    events && sortField
      ? sortByField(events, sortField, sortDirection, SORT_CONFIG)
      : events || [];

  const handleSubmit = async (formData) => {
    try {
      setFormError(null);
      if (editingItem) {
        await updateEvent(editingItem.id, formData);
        showSuccess("Evento aggiornato con successo");
      } else {
        await createEvent(formData);
        showSuccess("Evento creato con successo");
      }
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (ev) => {
    if (!window.confirm(`Sei sicuro di voler eliminare l'evento "${ev.title}"?`)) return;
    try {
      await deleteEvent(ev.id);
      showSuccess("Evento eliminato con successo");
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gestione eventi</h1>
          <p className="text-sm text-muted-foreground">
            Crea, modifica ed elimina gli eventi.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setFormError(null);
            setIsModalOpen(true);
          }}
        >
          Aggiungi evento
        </Button>
      </div>

      {/* Events Table */}
      {isLoading && <Loader />}
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Errore: {error.message}
        </div>
      )}

      {events && events.length > 0 && (
        <div className="rounded-lg border bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {EVENTS_COLUMN_LABELS.id}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("title")}
                  title="Clicca per ordinare per titolo"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {EVENTS_COLUMN_LABELS.title}
                    <SortIcon field="title" sortField={sortField} sortDirection={sortDirection} />
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("date")}
                  title="Clicca per ordinare per data"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {EVENTS_COLUMN_LABELS.date}
                    <SortIcon field="date" sortField={sortField} sortDirection={sortDirection} />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {EVENTS_COLUMN_LABELS.description}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{ev.id}</td>
                  <td className="px-4 py-3 font-medium">{ev.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ev.date}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{ev.description || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingItem(ev);
                          setFormError(null);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => handleDelete(ev)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && events?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nessun evento presente.</p>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          setFormError(null);
        }}
        title={editingItem ? "Modifica evento" : "Nuovo evento"}
      >
        <EventForm initialData={editingItem} onSubmit={handleSubmit} error={formError} />
      </Modal>
    </div>
  );
};
