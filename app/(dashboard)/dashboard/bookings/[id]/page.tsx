import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  MapPin,
  Calendar,
  Clock,
  User,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Circle,
} from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { getServerDictionary } from "@/lib/i18n";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { BookingActions } from "@/components/booking/booking-actions";
import { BookingChat } from "@/components/booking/booking-chat";

export const metadata: Metadata = {
  title: "Détails de la réservation",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-indigo-100 text-indigo-800",
  IN_PROGRESS: "bg-primary-100 text-primary-800",
  COMPLETED: "bg-green-100 text-green-800",
  RELEASED: "bg-green-100 text-green-800",
  DISPUTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const t = await getServerDictionary();

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
        },
      },
      driver: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!booking) notFound();

  const userId = session.user.id;
  const isClient = booking.clientId === userId;
  const isDriver = booking.driver.userId === userId;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);

  if (!isClient && !isDriver && !isAdmin) notFound();

  const statusLabel =
    (t.bookingDetail.status as Record<string, string>)[booking.status] ||
    booking.status;
  const statusColor = STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-800";

  // Build timeline
  const timelineSteps = [
    { label: t.bookingDetail.created, date: booking.createdAt, done: true },
    { label: t.bookingDetail.paidAt, date: booking.status !== "PENDING" && booking.status !== "CANCELLED" ? booking.createdAt : null, done: !["PENDING", "CANCELLED"].includes(booking.status) },
    { label: t.bookingDetail.confirmedAt, date: booking.confirmedAt, done: !!booking.confirmedAt },
    { label: t.bookingDetail.startedAt, date: booking.startedAt, done: !!booking.startedAt },
    { label: t.bookingDetail.completedAt, date: booking.completedAt, done: !!booking.completedAt },
    { label: t.bookingDetail.releasedAt, date: booking.releasedAt, done: !!booking.releasedAt },
  ];

  if (booking.cancelledAt) {
    timelineSteps.push({
      label: t.bookingDetail.cancelledAt,
      date: booking.cancelledAt,
      done: true,
    });
  }

  const otherPerson = isDriver ? booking.client : booking.driver.user;
  const otherLabel = isDriver ? t.bookingDetail.client : t.bookingDetail.driver;

  return (
    <div className="min-h-screen bg-gray-50">
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
        </div>
      </header>

      <main className="container-app max-w-4xl py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors text-sm mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.common.back}
        </Link>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t.bookingDetail.title}
          </h1>
          <Badge className={`text-sm px-3 py-1 ${statusColor}`}>
            {statusLabel}
          </Badge>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Other person */}
            <Card className="border-0 shadow-card-lift">
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm text-gray-500 mb-3">{otherLabel}</p>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary-500/20">
                    <AvatarImage src={otherPerson.avatarUrl || undefined} />
                    <AvatarFallback className="bg-dark-700 text-lg font-bold text-white">
                      {getInitials(otherPerson.firstName, otherPerson.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-display font-bold text-gray-900">
                      {otherPerson.firstName} {otherPerson.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{otherPerson.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip details */}
            <Card className="border-0 shadow-card-lift">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  {t.bookingDetail.tripDetails}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t.bookingDetail.dateLabel}</p>
                    <p className="font-medium">{formatDate(booking.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t.bookingDetail.timeLabel}</p>
                    <p className="font-medium">{formatTime(booking.startDate)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.bookingDetail.durationLabel}</p>
                  <p className="font-medium">{booking.hoursBooked} {t.bookingDetail.hoursUnit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.bookingDetail.pickup}</p>
                  <p className="font-medium">{booking.pickupLocation}</p>
                </div>
                {booking.dropoffLocation && (
                  <div>
                    <p className="text-sm text-gray-500">{t.bookingDetail.dropoff}</p>
                    <p className="font-medium">{booking.dropoffLocation}</p>
                  </div>
                )}
                {booking.specialRequests && (
                  <div>
                    <p className="text-sm text-gray-500">{t.bookingDetail.specialRequestsLabel}</p>
                    <p className="text-gray-700 text-sm mt-1">{booking.specialRequests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price breakdown */}
            <Card className="border-0 shadow-card-lift">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-500" />
                  {t.bookingDetail.priceBreakdown}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {t.bookingDetail.driverFee} ({booking.hoursBooked}h)
                  </span>
                  <span className="font-medium">{formatCurrency(booking.driverFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.bookingDetail.platformFee}</span>
                  <span className="font-medium">{formatCurrency(booking.platformFee)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-display font-bold text-gray-900">
                    {t.bookingDetail.total}
                  </span>
                  <span className="font-display text-xl font-black text-primary-600">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Transactions */}
            {booking.transactions.length > 0 && (
              <Card className="border-0 shadow-card-lift">
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    {t.bookingDetail.transactions}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {booking.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between rounded-xl border p-4 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{tx.description || tx.type}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(tx.createdAt)} {formatTime(tx.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(tx.amount)}</p>
                          <Badge
                            variant="secondary"
                            className={`text-xs mt-1 ${
                              tx.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : tx.status === "FAILED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            <BookingChat
              bookingId={booking.id}
              currentUserId={userId}
              bookingStatus={booking.status}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="border-0 shadow-card-lift">
              <CardContent className="p-6">
                <BookingActions
                  bookingId={booking.id}
                  status={booking.status}
                  isClient={isClient}
                  isDriver={isDriver}
                  totalAmount={booking.totalAmount}
                  driverFee={booking.driverFee}
                />
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-card-lift">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  {t.bookingDetail.timeline}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timelineSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {step.done ? (
                          <CheckCircle className="h-5 w-5 text-primary-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            step.done ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.done && step.date && (
                          <p className="text-xs text-gray-500">
                            {formatDate(step.date)} {formatTime(step.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
