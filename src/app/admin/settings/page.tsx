"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SettingsData {
  customerService: string;
  email: string | null;
  whatsapp: string | null;
  slogan: string;
  location: string | null;
  shippingCost: number | null;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    customerService: "",
    email: "",
    whatsapp: "",
    slogan: "",
    shippingCost: 2500,
    location: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setSettings({
            customerService: res.data.customerService || "",
            email: res.data.email || "",
            whatsapp: res.data.whatsapp || "",
            slogan: res.data.slogan || "",
            location: res.data.location || "",
            shippingCost: res.data.shippingCost ? Number(res.data.shippingCost.toString()) : 2500,
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      toast({
        title: "Paramètres sauvegardés",
        description: "Les modifications ont été enregistrées avec succès.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="relative size-10 bg-brand-brown rounded-lg p-1">
                  <Image
                    src="/logo-eburnie.png"
                    alt="Eburnie"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="font-heading font-bold text-lg text-brand-brown">Eburnie</span>
                  <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
                </div>
              </Link>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="size-4" />
                Retour au dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="size-6" />
            Paramètres
          </h1>
          <p className="text-muted-foreground">
            Configurez les informations de votre boutique
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Textarea
                    id="slogan"
                    value={settings.slogan}
                    onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                    placeholder="Votre slogan..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Adresse / Localisation</Label>
                  <Input
                    id="location"
                    value={settings.location || ""}
                    onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                    placeholder="Abidjan, Côte d'Ivoire"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Frais de livraison (FCFA)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    value={settings.shippingCost || ""}
                    onChange={(e) => setSettings({ ...settings, shippingCost: e.target.value ? Number(e.target.value) : null })}
                    placeholder="2500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerService">Numéro service client</Label>
                  <Input
                    id="customerService"
                    value={settings.customerService}
                    onChange={(e) => setSettings({ ...settings, customerService: e.target.value })}
                    placeholder="+225 07 00 00 00 00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email de contact</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || ""}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="contact@eburnie.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsapp || ""}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    placeholder="+225 07 00 00 00 00"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-12 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Sauvegarder les paramètres
                </>
              )}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
