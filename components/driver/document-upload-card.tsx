"use client";

import { useState, useRef } from "react";
import {
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Camera,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";

type ExistingDoc = {
  id: string;
  type: string;
  status: string;
  rejectionReason: string | null;
};

export function DocumentUploadCard({
  docType,
  existingDoc,
  onUploaded,
}: {
  docType: string;
  existingDoc: ExistingDoc | null;
  onUploaded: () => void;
}) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusConfig: Record<
    string,
    { icon: typeof Clock; color: string; label: string }
  > = {
    PENDING: {
      icon: Clock,
      color: "bg-accent-100 text-accent-800",
      label: t.driverDocuments.status.PENDING,
    },
    APPROVED: {
      icon: CheckCircle,
      color: "bg-green-100 text-green-700",
      label: t.driverDocuments.status.APPROVED,
    },
    REJECTED: {
      icon: XCircle,
      color: "bg-red-100 text-red-700",
      label: t.driverDocuments.status.REJECTED,
    },
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", docType);

      const res = await fetch("/api/drivers/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.driverDocuments.uploadError);
      } else {
        setSuccess(true);
        onUploaded();
      }
    } catch {
      setError(t.driverDocuments.uploadError);
    }

    setUploading(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const config = existingDoc
    ? statusConfig[existingDoc.status] || statusConfig.PENDING
    : null;

  const canUpload =
    !existingDoc ||
    existingDoc.status === "REJECTED" ||
    success;

  return (
    <Card className="border-0">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display font-bold text-gray-900">
              {t.driverDocuments.types[docType as keyof typeof t.driverDocuments.types]}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {t.driverDocuments.descriptions[docType as keyof typeof t.driverDocuments.descriptions]}
            </p>
          </div>
          {config && existingDoc && !success && (
            <Badge className={config.color}>
              <config.icon className="h-3.5 w-3.5 mr-1" />
              {config.label}
            </Badge>
          )}
          {success && (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              {t.driverDocuments.uploadSuccess}
            </Badge>
          )}
        </div>

        {/* Rejection reason */}
        {existingDoc?.status === "REJECTED" &&
          existingDoc.rejectionReason &&
          !success && (
            <div className="mt-3 flex items-start gap-1.5 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">
                  {t.driverDocuments.rejectionReason}
                </span>{" "}
                {existingDoc.rejectionReason}
              </div>
            </div>
          )}

        {/* Upload area */}
        {(canUpload || !existingDoc) && (
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id={`file-${docType}`}
            />
            <label
              htmlFor={`file-${docType}`}
              className={`flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed p-4 cursor-pointer transition-colors ${
                uploading
                  ? "border-gray-200 bg-gray-50 cursor-wait"
                  : "border-primary-300 bg-primary-50/50 hover:bg-primary-50 hover:border-primary-400"
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-5 w-5 text-primary-500 animate-spin" />
                  <span className="text-sm font-medium text-primary-600">
                    {t.driverDocuments.uploading}
                  </span>
                </>
              ) : existingDoc?.status === "REJECTED" ? (
                <>
                  <Upload className="h-5 w-5 text-primary-500" />
                  <span className="text-sm font-medium text-primary-600">
                    {t.driverDocuments.reupload}
                  </span>
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5 text-primary-500" />
                  <span className="text-sm font-medium text-primary-600">
                    {t.driverDocuments.uploadButton}
                  </span>
                </>
              )}
            </label>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {t.driverDocuments.maxSize}
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
