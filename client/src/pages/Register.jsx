import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showSuccess } from "../utils/toast";
import Loader from "../components/Loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Register = () => {
  const [form, setForm] = useState({ name: "", surname: "", email: "", password: "", isOrganizer: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await register(form);
    if (res.ok) {
      showSuccess("Registrazione avvenuta con successo");
      navigate("/dashboard");
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-2xl leading-none">🗓️</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">EFA</h1>
          <p className="text-sm text-muted-foreground">Crea il tuo account</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Mario"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="surname">Cognome</Label>
                <Input
                  id="surname"
                  name="surname"
                  placeholder="Rossi"
                  value={form.surname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nome@esempio.it"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center gap-3 rounded-md border border-input px-3 py-2.5">
              <input
                type="checkbox"
                id="isOrganizer"
                name="isOrganizer"
                checked={!!form.isOrganizer}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <Label htmlFor="isOrganizer" className="cursor-pointer">
                Organizzatore
              </Label>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Registrati
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Hai già un account? Accedi →
          </Link>
        </div>
      </div>
    </div>
  );
};
