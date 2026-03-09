import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/db/prisma";
import { getServerDictionary } from "@/lib/i18n";
import { DocumentUploadList } from "@/components/driver/document-upload-list";

const REQUIRED_DOCS = [
  "CNI_FRONT",
  "CNI_BACK",
  "DRIVING_LICENSE_FRONT",
  "DRIVING_LICENSE_BACK",
  "PROFILE_PHOTO",
] as const;

export default async function DriverDocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role !== "DRIVER" || !session.user.driverId) {
    redirect("/dashboard");
  }

  const t = await getServerDictionary();

  const documents = await prisma.document.findMany({
    where: { driverId: session.user.driverId },
  });

  const existingDocs = documents.map((doc) => ({
    id: doc.id,
    type: doc.type,
    status: doc.status,
    rejectionReason: doc.rejectionReason,
  }));

  const allUploaded = REQUIRED_DOCS.every((type) =>
    existingDocs.some((d) => d.type === type)
  );

  const allApproved = REQUIRED_DOCS.every((type) =>
    existingDocs.some((d) => d.type === type && d.status === "APPROVED")
  );

  return (
    <main className="container-app py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.common.back}
      </Link>

      <div className="mb-10">
        <h1 className="font-display text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary-500" />
          {t.driverDocuments.title}
        </h1>
        <p className="mt-2 text-gray-600">{t.driverDocuments.subtitle}</p>
      </div>

      {allUploaded && (
        <Card className="border-0 mb-8 border-l-4 border-l-primary-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
              {allApproved ? (
                <CheckCircle className="h-7 w-7 text-primary-600" />
              ) : (
                <AlertCircle className="h-7 w-7 text-accent-600" />
              )}
            </div>
            <p className="text-gray-700">{t.driverDocuments.allUploaded}</p>
          </CardContent>
        </Card>
      )}

      <DocumentUploadList
        requiredDocs={[...REQUIRED_DOCS]}
        existingDocs={existingDocs}
      />
    </main>
  );
}
