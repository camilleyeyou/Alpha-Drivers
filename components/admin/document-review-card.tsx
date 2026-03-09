"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";

type Document = {
  id: string;
  type: string;
  status: string;
  signedUrl: string | null;
  originalName: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
};

export function DocumentReviewCard({
  doc,
  driverId,
  onReviewed,
}: {
  doc: Document;
  driverId: string;
  onReviewed: () => void;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState("");

  const statusConfig: Record<
    string,
    { icon: typeof Clock; color: string; label: string }
  > = {
    PENDING: {
      icon: Clock,
      color: "bg-accent-100 text-accent-800",
      label: t.admin.documentStatus.PENDING,
    },
    APPROVED: {
      icon: CheckCircle,
      color: "bg-green-100 text-green-700",
      label: t.admin.documentStatus.APPROVED,
    },
    REJECTED: {
      icon: XCircle,
      color: "bg-red-100 text-red-700",
      label: t.admin.documentStatus.REJECTED,
    },
  };

  const config = statusConfig[doc.status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  async function handleReview(status: "APPROVED" | "REJECTED") {
    setLoading(true);
    try {
      const body: any = { status };
      if (status === "REJECTED" && reason) {
        body.rejectionReason = reason;
      }

      const res = await fetch(
        `/api/admin/drivers/${driverId}/documents/${doc.id}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        onReviewed();
        setShowRejectInput(false);
        setReason("");
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  return (
    <Card className="border-0 overflow-hidden">
      <CardContent className="p-0">
        {/* Document Preview */}
        <div className="aspect-[4/3] bg-gray-100 relative">
          {doc.signedUrl ? (
            <img
              src={doc.signedUrl}
              alt={t.admin.documentType[doc.type as keyof typeof t.admin.documentType]}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText className="h-12 w-12" />
              <p className="mt-2 text-sm">Image non disponible</p>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={config.color}>
              <StatusIcon className="h-3.5 w-3.5 mr-1" />
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Info & Actions */}
        <div className="p-4">
          <h4 className="font-display font-bold text-gray-900">
            {t.admin.documentType[doc.type as keyof typeof t.admin.documentType]}
          </h4>
          {doc.originalName && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {doc.originalName}
            </p>
          )}

          {doc.status === "REJECTED" && doc.rejectionReason && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {doc.rejectionReason}
            </div>
          )}

          {doc.status === "PENDING" && (
            <div className="mt-3 space-y-2">
              {showRejectInput ? (
                <div className="space-y-2">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t.admin.rejectReasonPlaceholder}
                    className="w-full rounded-lg border-2 border-gray-200 p-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowRejectInput(false);
                        setReason("");
                      }}
                      disabled={loading}
                      className="flex-1"
                    >
                      {t.admin.back}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReview("REJECTED")}
                      disabled={loading || reason.length < 10}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {t.admin.rejectConfirm}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReview("APPROVED")}
                    disabled={loading}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t.admin.approveDoc}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRejectInput(true)}
                    disabled={loading}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {t.admin.rejectDoc}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
