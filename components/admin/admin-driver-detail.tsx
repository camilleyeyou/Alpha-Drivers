"use client";

import { useRouter } from "next/navigation";
import { DocumentReviewCard } from "./document-review-card";

type Document = {
  id: string;
  type: string;
  status: string;
  signedUrl: string | null;
  originalName: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
};

export function AdminDriverDetail({
  documents,
  driverId,
}: {
  documents: Document[];
  driverId: string;
}) {
  const router = useRouter();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {documents.map((doc) => (
        <DocumentReviewCard
          key={doc.id}
          doc={doc}
          driverId={driverId}
          onReviewed={() => router.refresh()}
        />
      ))}
    </div>
  );
}
