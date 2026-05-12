"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  FileText,
  Check,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

type CheckoutStep = "shipping" | "payment" | "confirmation";

export function CheckoutContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const { items, clearCart, getTotalPrice } = useCartStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    note: "",
  });

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled || !json?.data) return;
        setFormData((prev) => ({
          ...prev,
          phone: prev.phone || json.data.phone || "",
        }));
      } catch (error) {
        console.error("Failed to prefill checkout from profile:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  const totalPrice = getTotalPrice();
  const shippingThreshold = 50000;
  const shippingCost = totalPrice >= shippingThreshold ? 0 : 2500;
  const finalTotal = totalPrice + shippingCost;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async () => {
    if (!formData.phone.trim()) {
      toast({
        title: "Téléphone requis",
        description: "Veuillez renseigner un numéro de téléphone pour valider la commande.",
        variant: "warning",
      });
      setCurrentStep("shipping");
      return;
    }
    setIsSubmitting(true);
    try {
      const orderData = {
        phone: formData.phone,
        addressLine: formData.address,
        city: formData.city,
        note: formData.note,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de la commande");
      }

      const json = await res.json();
      const orderId = json.data.id;

      clearCart();
      router.push(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error("Order error:", error);
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Erreur lors de la commande", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && currentStep !== "confirmation") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="size-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="size-16 text-muted-foreground" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-brand-brown mb-3">
            Votre panier est vide
          </h1>
          <p className="text-muted-foreground mb-8">
            Ajoutez des produits à votre panier avant de passer commande.
          </p>
          <Link href="/products">
            <Button size="lg">
              Voir les produits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { id: "shipping", label: "Livraison", icon: Truck },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "confirmation", label: "Confirmation", icon: Check },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Accueil
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/cart" className="hover:text-foreground transition-colors">
          Panier
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">Commande</span>
      </nav>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : steps.findIndex((s) => s.id === currentStep) > index
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <step.icon className="size-4" />
              <span className="text-sm font-medium hidden sm:inline">
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-0.5 mx-2 ${
                  steps.findIndex((s) => s.id === currentStep) > index
                    ? "bg-green-500"
                    : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Confirmation Step */}
      {currentStep === "confirmation" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center py-12"
        >
          <div className="size-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="size-12 text-green-600" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-brand-brown mb-3">
            Commande confirmée !
          </h1>
          <p className="text-muted-foreground mb-2">
            Merci pour votre commande. Vous recevrez un email de confirmation
            sous peu.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Numéro de commande : <span className="font-mono font-medium">#EB2024001</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products">
              <Button>
                Continuer mes achats
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline">
                Suivre ma commande
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Shipping & Payment Steps */}
      {currentStep !== "confirmation" && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Shipping Form */}
            {currentStep === "shipping" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="text-primary" data-icon />
                      Adresse de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Téléphone <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+221 77 123 45 67"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="address" className="text-sm font-medium">
                        Adresse
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <Input
                          id="address"
                          name="address"
                          placeholder="Numéro et nom de rue"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="city" className="text-sm font-medium">
                        Ville
                      </label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Dakar"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="note" className="text-sm font-medium">
                        Note (optionnel)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-muted-foreground size-4" />
                        <Input
                          id="note"
                          name="note"
                          placeholder="Instructions de livraison..."
                          value={formData.note}
                          onChange={handleInputChange}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="mt-4"
                      onClick={() => setCurrentStep("payment")}
                      disabled={!formData.phone.trim()}
                    >
                      Continuer vers le paiement
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Payment Step */}
            {currentStep === "payment" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="text-primary" data-icon />
                      Mode de paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    {/* Payment Options */}
                    <div className="border-2 border-primary rounded-xl p-4 bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="size-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="size-2.5 rounded-full bg-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Paiement à la livraison</p>
                          <p className="text-sm text-muted-foreground">
                            Payez en espèces lors de la réception de votre
                            commande
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-xl p-4 opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className="size-5 rounded-full border-2 border-muted-foreground" />
                        <div>
                          <p className="font-medium text-muted-foreground">
                            Paiement en ligne
                            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                              Bientôt disponible
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Carte bancaire, Orange Money, Wave
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Delivery Summary */}
                    <div className="bg-muted/50 rounded-xl p-4">
                      <h4 className="font-medium mb-3">Adresse de livraison</h4>
                      <p className="text-sm text-muted-foreground">
                        {session?.user?.name}
                        <br />
                        {formData.address}
                        <br />
                        {formData.city}
                        <br />
                        {formData.phone}
                      </p>
                      <Button
                        variant="link"
                        className="p-0 h-auto mt-2"
                        onClick={() => setCurrentStep("shipping")}
                      >
                        Modifier
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep("shipping")}
                      >
                        Retour
                      </Button>
                      <Button
                        size="lg"
                        className="flex-1"
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Traitement en cours...
                          </span>
                        ) : (
                          <>
                            Confirmer la commande
                            <span className="text-primary-foreground/70 ml-2">
                              {formatPrice(finalTotal)}
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle>Votre commande</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Items */}
                <div className="max-h-[300px] overflow-y-auto flex flex-col gap-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative size-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 size-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-primary font-semibold mt-1">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Gratuite</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
