import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Car,
  Calendar,
  CreditCard,
  Star,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Upload,
  ChevronRight,
  User,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/db/prisma";
import { getServerDictionary } from "@/lib/i18n";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { booking?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user;
  const isDriver = user.role === "DRIVER";
  const t = await getServerDictionary();
  const bookingCreated = searchParams.booking === "created";

  // Get driver data if applicable
  let driver = null;
  let bookings: any[] = [];

  if (isDriver && user.driverId) {
    driver = await prisma.driver.findUnique({
      where: { id: user.driverId },
      include: {
        documents: { select: { type: true, status: true } },
      },
    });
  }

  // Get recent bookings
  const bookingsRaw = await prisma.booking.findMany({
    where: isDriver
      ? { driverId: user.driverId ?? undefined }
      : { clientId: user.id },
    include: {
      driver: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      client: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  bookings = bookingsRaw;

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: typeof CheckCircle }
  > = {
    PENDING_PAYMENT: {
      label: t.dashboard.statusPending,
      color: "bg-accent-100 text-accent-800",
      icon: CreditCard,
    },
    PENDING_VERIFICATION: {
      label: t.dashboard.statusVerifying,
      color: "bg-blue-100 text-blue-800",
      icon: Clock,
    },
    VERIFIED: {
      label: t.dashboard.statusVerified,
      color: "bg-primary-100 text-primary-800",
      icon: CheckCircle,
    },
    SUSPENDED: {
      label: t.dashboard.statusSuspended,
      color: "bg-red-100 text-red-800",
      icon: AlertCircle,
    },
    REJECTED: {
      label: t.dashboard.statusRejected,
      color: "bg-red-100 text-red-800",
      icon: AlertCircle,
    },
  };

  const driverStatus = driver
    ? statusConfig[driver.status] || statusConfig.PENDING_PAYMENT
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — Dark */}
      <header className="bg-dark-900 border-b border-white/10">
        <div className="container-app flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 shadow-glow-green">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Alpha<span className="text-primary-400">Drivers</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              {user.firstName} {user.lastName}
            </span>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                <LogOut className="mr-2 h-4 w-4" />
                {t.common.back}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-app py-10">
        {/* Booking success banner */}
        {bookingCreated && (
          <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm font-medium text-green-800">
              {t.dashboard.bookingCreated}
            </p>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-extrabold text-gray-900">
            {t.dashboard.welcome.replace("{name}", user.firstName || "Utilisateur")}
          </h1>
          <p className="mt-2 text-gray-600">
            {isDriver ? t.dashboard.subtitleDriver : t.dashboard.subtitleClient}
          </p>
        </div>

        {/* Driver Status Banner */}
        {isDriver && driver && driverStatus && (
          <Card className={`mb-10 border-0 ${driver.status === "PENDING_PAYMENT" || driver.status === "PENDING_VERIFICATION" ? "border-l-4 border-l-primary-500" : ""}`}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${driverStatus.color}`}
                >
                  <driverStatus.icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-gray-900">
                    Statut: {driverStatus.label}
                  </h2>
                  {driver.status === "PENDING_PAYMENT" && (
                    <p className="text-sm text-gray-600">
                      {t.dashboard.paymentPending}
                    </p>
                  )}
                  {driver.status === "PENDING_VERIFICATION" && (
                    <p className="text-sm text-gray-600">
                      {t.dashboard.verifying}
                    </p>
                  )}
                  {driver.status === "VERIFIED" && (
                    <p className="text-sm text-gray-600">
                      {t.dashboard.active}
                    </p>
                  )}
                  {driver.status === "REJECTED" && driver.rejectionReason && (
                    <p className="text-sm text-red-600">
                      {t.dashboard.reason} {driver.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
              {driver.status === "PENDING_PAYMENT" && (
                <Button variant="accent">{t.dashboard.payNow}</Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            {isDriver && driver && (
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-0">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                      <Calendar className="h-7 w-7 text-primary-600" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-black text-gray-900">
                      {driver.totalTrips}
                    </p>
                    <p className="text-sm text-gray-600">{t.dashboard.statTrips}</p>
                  </CardContent>
                </Card>
                <Card className="border-0">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50">
                      <Star className="h-7 w-7 text-accent-600" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-black text-gray-900">
                      {Number(driver.avgRating).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600">{t.dashboard.statRating}</p>
                  </CardContent>
                </Card>
                <Card className="border-0">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                      <CreditCard className="h-7 w-7 text-green-600" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-black text-gray-900">
                      {driver.totalEarnings.toLocaleString("fr-FR")}
                    </p>
                    <p className="text-sm text-gray-600">{t.dashboard.statEarnings}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Bookings */}
            <Card className="border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Calendar className="h-5 w-5 text-primary-500" />
                  {isDriver ? t.dashboard.recentBookings : t.dashboard.myBookings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="mx-auto h-14 w-14 text-gray-300" />
                    <p className="mt-4 font-display font-bold text-gray-600">{t.dashboard.noBookings}</p>
                    {!isDriver && (
                      <Link href="/drivers/douala" className="mt-4 inline-block">
                        <Button variant="outline" size="sm">
                          {t.dashboard.findDriver}
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                      >
                        <div>
                          <p className="font-display font-bold text-gray-900">
                            {isDriver
                              ? `${booking.client.firstName} ${booking.client.lastName}`
                              : `${booking.driver.user.firstName} ${booking.driver.user.lastName}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-primary-500" />
                            {booking.pickupLocation}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(booking.startDate).toLocaleDateString(
                              "fr-FR"
                            )}{" "}
                            - {booking.hoursBooked}h
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-gray-900">
                            {booking.totalAmount.toLocaleString("fr-FR")} FCFA
                          </p>
                          <Badge
                            variant="secondary"
                            className="mt-1 text-xs"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-display">
                  <User className="h-5 w-5 text-primary-500" />
                  {t.dashboard.myProfile}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.dashboard.name}</span>
                  <span className="font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.dashboard.phoneLabel}</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.dashboard.cityLabel}</span>
                  <span className="font-medium">{user.city || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.dashboard.role}</span>
                  <Badge variant="secondary">
                    {user.role === "DRIVER" ? t.dashboard.roleDriver : t.dashboard.roleClient}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Driver Quick Actions */}
            {isDriver && driver && (
              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="text-base font-display">{t.dashboard.quickActions}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {driver.status === "PENDING_PAYMENT" && (
                    <Button className="w-full justify-between" variant="outline">
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary-500" />
                        {t.dashboard.payRegistration}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                  <Link href="/dashboard/documents">
                    <Button className="w-full justify-between" variant="outline">
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-primary-500" />
                        {t.dashboard.myDocuments}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button className="w-full justify-between" variant="outline">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary-500" />
                        {t.dashboard.editProfile}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Client Quick Actions */}
            {!isDriver && (
              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="text-base font-display">{t.dashboard.quickActions}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/drivers/douala">
                    <Button
                      className="w-full justify-between"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary-500" />
                        {t.dashboard.findDriver}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/register/driver">
                    <Button
                      className="w-full justify-between mt-2"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary-500" />
                        {t.dashboard.becomeDriver}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button
                      className="w-full justify-between mt-2"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary-500" />
                        {t.dashboard.editProfile}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
