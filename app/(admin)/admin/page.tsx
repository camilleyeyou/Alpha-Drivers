import Link from "next/link";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Phone,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db/prisma";
import { getServerDictionary } from "@/lib/i18n";
import { AdminDriverList } from "@/components/admin/admin-driver-list";

export default async function AdminDashboardPage() {
  const t = await getServerDictionary();

  const [total, pending, verified, rejected, suspended] = await Promise.all([
    prisma.driver.count(),
    prisma.driver.count({ where: { status: "PENDING_VERIFICATION" } }),
    prisma.driver.count({ where: { status: "VERIFIED" } }),
    prisma.driver.count({ where: { status: "REJECTED" } }),
    prisma.driver.count({ where: { status: "SUSPENDED" } }),
  ]);

  const recentPending = await prisma.driver.findMany({
    where: { status: "PENDING_VERIFICATION" },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          city: true,
        },
      },
      documents: {
        select: { type: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const stats = [
    {
      label: t.admin.totalDrivers,
      value: total,
      icon: Users,
      color: "bg-primary-50 text-primary-600",
    },
    {
      label: t.admin.pendingVerification,
      value: pending,
      icon: Clock,
      color: "bg-accent-50 text-accent-600",
    },
    {
      label: t.admin.verifiedDrivers,
      value: verified,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      label: t.admin.rejectedDrivers,
      value: rejected,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <main className="container-app py-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
          {t.admin.dashboard}
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6 sm:mb-10">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl ${stat.color}`}
                >
                  <stat.icon className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <p className="font-display text-xl sm:text-3xl font-black text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Drivers */}
      {pending > 0 && (
        <Card className="border-0 mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Clock className="h-5 w-5 text-accent-500" />
              {t.admin.recentPending}
              <Badge className="ml-2 bg-accent-100 text-accent-800">
                {pending}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPending.map((driver) => (
                <Link
                  key={driver.id}
                  href={`/admin/drivers/${driver.id}`}
                  className="flex items-start sm:items-center justify-between gap-3 rounded-2xl border p-3 sm:p-4 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="font-display font-bold text-gray-900 text-sm sm:text-base">
                      {driver.user.firstName} {driver.user.lastName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {driver.user.phone}
                      </span>
                      {driver.user.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {driver.user.city}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {driver.documents.map((doc) => (
                        <Badge
                          key={doc.type}
                          variant="secondary"
                          className={`text-xs ${
                            doc.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : doc.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {t.admin.documentType[doc.type as keyof typeof t.admin.documentType]}
                        </Badge>
                      ))}
                      {driver.documents.length === 0 && (
                        <span className="text-xs text-gray-400">
                          {t.admin.noDocuments}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline text-sm text-gray-500">
                      {new Date(driver.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Drivers List */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Users className="h-5 w-5 text-primary-500" />
            {t.admin.allDrivers}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminDriverList />
        </CardContent>
      </Card>
    </main>
  );
}
