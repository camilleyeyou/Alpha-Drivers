import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Globe,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db/prisma";
import { getSignedUrl } from "@/lib/supabase";
import { getServerDictionary } from "@/lib/i18n";
import { DocumentReviewCard } from "@/components/admin/document-review-card";
import { DriverActions } from "@/components/admin/driver-actions";
import { AdminDriverDetail } from "@/components/admin/admin-driver-detail";

export default async function AdminDriverDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const t = await getServerDictionary();

  const driver = await prisma.driver.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          city: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
      documents: true,
    },
  });

  if (!driver) notFound();

  // Generate signed URLs for documents
  const documentsWithUrls = await Promise.all(
    driver.documents.map(async (doc) => {
      let signedUrl: string | null = null;
      try {
        signedUrl = await getSignedUrl(doc.fileUrl);
      } catch {
        // File may not exist
      }
      return {
        id: doc.id,
        type: doc.type,
        status: doc.status,
        signedUrl,
        originalName: doc.originalName,
        rejectionReason: doc.rejectionReason,
        reviewedAt: doc.reviewedAt?.toISOString() || null,
      };
    })
  );

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: typeof CheckCircle }
  > = {
    PENDING_PAYMENT: {
      label: t.dashboard.statusPending,
      color: "bg-gray-100 text-gray-700",
      icon: CreditCard,
    },
    PENDING_VERIFICATION: {
      label: t.dashboard.statusVerifying,
      color: "bg-accent-100 text-accent-800",
      icon: Clock,
    },
    VERIFIED: {
      label: t.dashboard.statusVerified,
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
    REJECTED: {
      label: t.dashboard.statusRejected,
      color: "bg-red-100 text-red-700",
      icon: XCircle,
    },
    SUSPENDED: {
      label: t.dashboard.statusSuspended,
      color: "bg-orange-100 text-orange-700",
      icon: AlertTriangle,
    },
  };

  const currentStatus = statusConfig[driver.status] || statusConfig.PENDING_PAYMENT;

  return (
    <main className="container-app py-10">
      {/* Back button */}
      <Link href="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {t.admin.back}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-gray-900">
            {driver.user.firstName} {driver.user.lastName}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={currentStatus.color}>
              <currentStatus.icon className="h-3.5 w-3.5 mr-1" />
              {currentStatus.label}
            </Badge>
            <Badge variant="secondary">
              {driver.registrationPaid ? (
                <span className="flex items-center gap-1 text-green-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {t.admin.registrationPaid}: {t.admin.yes}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500">
                  {t.admin.registrationPaid}: {t.admin.no}
                </span>
              )}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info */}
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="font-display text-base">
                {t.admin.personalInfo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">{t.admin.phone}</p>
                    <p className="font-medium">{driver.user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">{t.admin.email}</p>
                    <p className="font-medium">{driver.user.email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">{t.admin.city}</p>
                    <p className="font-medium">{driver.user.city || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">{t.admin.registeredAt}</p>
                    <p className="font-medium">
                      {new Date(driver.user.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">{t.admin.hourlyRate}</p>
                    <p className="font-medium">
                      {driver.hourlyRate.toLocaleString("fr-FR")} FCFA/h
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">{t.admin.experience}</p>
                    <p className="font-medium">
                      {driver.experienceYears || 0} {t.admin.years}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">{t.admin.languages}</p>
                    <p className="font-medium">{driver.languages.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">{t.admin.activeCities}</p>
                    <p className="font-medium">
                      {driver.cities.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
              {driver.bio && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-1">{t.admin.bio}</p>
                  <p className="text-gray-700">{driver.bio}</p>
                </div>
              )}
              {driver.rejectionReason && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                    <XCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">
                        {t.dashboard.reason}
                      </p>
                      <p className="text-sm">{driver.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <FileText className="h-5 w-5 text-primary-500" />
                {t.admin.documents}
                <Badge variant="secondary" className="ml-2">
                  {documentsWithUrls.length}/5
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documentsWithUrls.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {t.admin.noDocuments}
                </p>
              ) : (
                <AdminDriverDetail
                  documents={documentsWithUrls}
                  driverId={driver.id}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div>
          <DriverActions
            driverId={driver.id}
            currentStatus={driver.status}
          />
        </div>
      </div>
    </main>
  );
}
