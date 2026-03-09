"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/context";

type Driver = {
  id: string;
  status: string;
  hourlyRate: number;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    phone: string;
    city: string | null;
  };
  documents: { type: string; status: string }[];
};

const TABS = ["all", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", "SUSPENDED"] as const;

export function AdminDriverList() {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const tabLabels: Record<string, string> = {
    all: t.admin.tabs.all,
    PENDING_VERIFICATION: t.admin.tabs.pending,
    VERIFIED: t.admin.tabs.verified,
    REJECTED: t.admin.tabs.rejected,
    SUSPENDED: t.admin.tabs.suspended,
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, status]);

  async function fetchDrivers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (search) params.set("search", search);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/drivers?${params}`);
      const data = await res.json();
      setDrivers(data.drivers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      // ignore
    }
    setLoading(false);
  }

  function handleSearch() {
    setPage(1);
    fetchDrivers();
  }

  const statusColors: Record<string, string> = {
    PENDING_PAYMENT: "bg-gray-100 text-gray-700",
    PENDING_VERIFICATION: "bg-accent-100 text-accent-800",
    VERIFIED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    SUSPENDED: "bg-orange-100 text-orange-700",
  };

  const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: t.dashboard.statusPending,
    PENDING_VERIFICATION: t.dashboard.statusVerifying,
    VERIFIED: t.dashboard.statusVerified,
    REJECTED: t.dashboard.statusRejected,
    SUSPENDED: t.dashboard.statusSuspended,
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant={status === tab ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
          >
            {tabLabels[tab]}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t.admin.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>{t.driversList.search}</Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          {t.common.loading}
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t.admin.noDrivers}
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map((driver) => (
            <Link
              key={driver.id}
              href={`/admin/drivers/${driver.id}`}
              className="flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-display font-bold text-gray-900">
                    {driver.user.firstName} {driver.user.lastName}
                  </p>
                  <Badge
                    className={`text-xs ${statusColors[driver.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {statusLabels[driver.status] || driver.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {driver.user.phone}
                  </span>
                  {driver.user.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {driver.user.city}
                    </span>
                  )}
                  <span>
                    {driver.hourlyRate.toLocaleString("fr-FR")} FCFA/h
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {driver.documents.length}/5 docs
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t.admin.previous}
          </Button>
          <span className="text-sm text-gray-600">
            {t.admin.page} {page} {t.admin.of} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t.admin.next}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
