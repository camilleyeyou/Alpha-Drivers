"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle,
  Play,
  Flag,
  Banknote,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/utils";

interface BookingActionsProps {
  bookingId: string;
  status: string;
  isClient: boolean;
  isDriver: boolean;
  totalAmount: number;
  driverFee: number;
}

export function BookingActions({
  bookingId,
  status,
  isClient,
  isDriver,
  totalAmount,
  driverFee,
}: BookingActionsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const callAction = async (action: string) => {
    setLoading(action);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.bookingDetail.actionError);
      } else {
        setSuccess(
          action === "pay"
            ? t.bookingDetail.paymentInitiated
            : t.bookingDetail.actionSuccess
        );
        router.refresh();
      }
    } catch {
      setError(t.bookingDetail.actionError);
    } finally {
      setLoading(null);
      setConfirmAction(null);
    }
  };

  const actions: {
    key: string;
    label: string;
    loadingLabel: string;
    icon: typeof CreditCard;
    variant: "default" | "accent" | "destructive" | "outline";
    show: boolean;
    confirmTitle: string;
    confirmDesc: string;
  }[] = [
    {
      key: "pay",
      label: t.bookingDetail.actions.pay,
      loadingLabel: t.bookingDetail.actions.paying,
      icon: CreditCard,
      variant: "accent",
      show: status === "PENDING" && isClient,
      confirmTitle: t.bookingDetail.confirmDialog.payTitle,
      confirmDesc: t.bookingDetail.confirmDialog.payDesc.replace("{amount}", formatCurrency(totalAmount)),
    },
    {
      key: "confirm",
      label: t.bookingDetail.actions.confirm,
      loadingLabel: t.bookingDetail.actions.confirming,
      icon: CheckCircle,
      variant: "default",
      show: status === "PAID" && isDriver,
      confirmTitle: t.bookingDetail.confirmDialog.confirmTitle,
      confirmDesc: t.bookingDetail.confirmDialog.confirmDesc,
    },
    {
      key: "start",
      label: t.bookingDetail.actions.start,
      loadingLabel: t.bookingDetail.actions.starting,
      icon: Play,
      variant: "default",
      show: status === "CONFIRMED" && isDriver,
      confirmTitle: t.bookingDetail.confirmDialog.startTitle,
      confirmDesc: t.bookingDetail.confirmDialog.startDesc,
    },
    {
      key: "complete",
      label: t.bookingDetail.actions.complete,
      loadingLabel: t.bookingDetail.actions.completing,
      icon: Flag,
      variant: "default",
      show: status === "IN_PROGRESS" && isDriver,
      confirmTitle: t.bookingDetail.confirmDialog.completeTitle,
      confirmDesc: t.bookingDetail.confirmDialog.completeDesc,
    },
    {
      key: "release",
      label: t.bookingDetail.actions.release,
      loadingLabel: t.bookingDetail.actions.releasing,
      icon: Banknote,
      variant: "accent",
      show: status === "COMPLETED" && isClient,
      confirmTitle: t.bookingDetail.confirmDialog.releaseTitle,
      confirmDesc: t.bookingDetail.confirmDialog.releaseDesc.replace("{amount}", formatCurrency(driverFee)),
    },
  ];

  const canCancel =
    ["PENDING", "PAID", "CONFIRMED"].includes(status) && (isClient || isDriver);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-600">
          {success}
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmAction && (
        <Card className="border-2 border-primary-500">
          <CardContent className="p-6">
            <h3 className="font-display font-bold text-gray-900">
              {actions.find((a) => a.key === confirmAction)?.confirmTitle ||
                t.bookingDetail.confirmDialog.cancelTitle}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {confirmAction === "cancel"
                ? t.bookingDetail.confirmDialog.cancelDesc
                : actions.find((a) => a.key === confirmAction)?.confirmDesc}
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => callAction(confirmAction)}
                disabled={!!loading}
                variant={confirmAction === "cancel" ? "destructive" : "default"}
              >
                {loading === confirmAction && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t.bookingDetail.confirmDialog.proceed}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmAction(null)}
                disabled={!!loading}
              >
                {t.bookingDetail.confirmDialog.back}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      {!confirmAction && (
        <div className="space-y-3">
          {actions
            .filter((a) => a.show)
            .map((action) => (
              <Button
                key={action.key}
                className="w-full"
                size="lg"
                variant={action.variant}
                onClick={() => setConfirmAction(action.key)}
                disabled={!!loading}
              >
                <action.icon className="mr-2 h-5 w-5" />
                {action.label}
              </Button>
            ))}

          {canCancel && (
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={() => setConfirmAction("cancel")}
              disabled={!!loading}
            >
              <XCircle className="mr-2 h-5 w-5" />
              {t.bookingDetail.actions.cancel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
