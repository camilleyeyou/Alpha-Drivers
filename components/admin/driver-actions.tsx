"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";

export function DriverActions({
  driverId,
  currentStatus,
}: {
  driverId: string;
  currentStatus: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [showConfirm, setShowConfirm] = useState<
    "verify" | "suspend" | null
  >(null);

  async function handleVerify() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}/verify`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
        setShowConfirm(null);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  async function handleReject() {
    if (reason.length < 10) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: reason }),
      });
      if (res.ok) {
        router.refresh();
        setShowReject(false);
        setReason("");
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  async function handleSuspend() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}/suspend`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
        setShowConfirm(null);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle className="font-display text-base">
          {t.admin.actions}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Verify Button */}
        {(currentStatus === "PENDING_VERIFICATION" ||
          currentStatus === "REJECTED") && (
          <>
            {showConfirm === "verify" ? (
              <div className="space-y-3 p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-800">
                  {t.admin.verifyConfirm}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirm(null)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {t.admin.back}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleVerify}
                    disabled={loading}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t.admin.verify}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => setShowConfirm("verify")}
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t.admin.verify}
              </Button>
            )}
          </>
        )}

        {/* Reject Button */}
        {currentStatus !== "REJECTED" && (
          <>
            {showReject ? (
              <div className="space-y-3 p-4 bg-red-50 rounded-xl">
                <h4 className="font-display font-bold text-red-800 text-sm">
                  {t.admin.rejectTitle}
                </h4>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t.admin.rejectReasonPlaceholder}
                  className="w-full rounded-lg border-2 border-red-200 p-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowReject(false);
                      setReason("");
                    }}
                    disabled={loading}
                    className="flex-1"
                  >
                    {t.admin.back}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReject}
                    disabled={loading || reason.length < 10}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {t.admin.rejectConfirm}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowReject(true)}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t.admin.reject}
              </Button>
            )}
          </>
        )}

        {/* Suspend Button */}
        {currentStatus === "VERIFIED" && (
          <>
            {showConfirm === "suspend" ? (
              <div className="space-y-3 p-4 bg-orange-50 rounded-xl">
                <p className="text-sm text-orange-800">
                  {t.admin.suspendConfirm}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirm(null)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {t.admin.back}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSuspend}
                    disabled={loading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {t.admin.suspend}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={() => setShowConfirm("suspend")}
                disabled={loading}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t.admin.suspend}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
