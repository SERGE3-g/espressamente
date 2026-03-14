"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, DashboardStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, MessageSquare, Wrench, Coffee, Users, ArrowRight } from "lucide-react";

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stats.get()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Prodotti attivi",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      bg: "bg-brand-100",
      iconColor: "text-brand-600",
      href: "/prodotti",
    },
    {
      label: "Richieste contatto",
      value: stats?.pendingContacts ?? 0,
      icon: MessageSquare,
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      href: "/contatti",
    },
    {
      label: "Richieste assistenza",
      value: stats?.pendingServices ?? 0,
      icon: Wrench,
      bg: "bg-sky-50",
      iconColor: "text-sky-600",
      href: "/assistenza",
    },
    {
      label: "Richieste comodato",
      value: stats?.pendingComodato ?? 0,
      icon: Coffee,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      href: "/comodato",
    },
    {
      label: "Clienti",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      href: "/clienti",
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-900">Panoramica</h1>
        <p className="text-sm text-muted-foreground mt-1">Riepilogo attività e richieste</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-card-hover transition-shadow duration-200 cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-300" />
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-brand-900">{card.value}</p>
                )}
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRequests type="contacts" />
        <RecentRequests type="comodato" />
      </div>
    </>
  );
}

const statusVariant: Record<string, "success" | "warning" | "secondary" | "info"> = {
  NUOVO: "warning",
  IN_LAVORAZIONE: "info",
  COMPLETATO: "success",
  CHIUSO: "secondary",
};

function RecentRequests({ type }: { type: "contacts" | "comodato" }) {
  const [items, setItems] = useState<Array<{ id: number; fullName: string; createdAt: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = type === "contacts"
      ? api.contacts.getAll(0)
      : api.comodato.getAll(0);

    fetch
      .then((res) => setItems(res.content.slice(0, 5)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [type]);

  const title = type === "contacts" ? "Ultime richieste contatto" : "Ultime richieste comodato";
  const href = type === "contacts" ? "/contatti" : "/comodato";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link href={href} className="text-xs text-brand-500 hover:text-brand-700 font-medium transition-colors">
          Vedi tutte
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nessuna richiesta</p>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-brand-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-brand-800">{item.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Badge variant={statusVariant[item.status] || "secondary"}>
                  {item.status.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
