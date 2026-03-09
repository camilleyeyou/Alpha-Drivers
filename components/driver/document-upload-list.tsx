"use client";

import { useRouter } from "next/navigation";
import { DocumentUploadCard } from "./document-upload-card";

type ExistingDoc = {
  id: string;
  type: string;
  status: string;
  rejectionReason: string | null;
};

export function DocumentUploadList({
  requiredDocs,
  existingDocs,
}: {
  requiredDocs: string[];
  existingDocs: ExistingDoc[];
}) {
  const router = useRouter();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {requiredDocs.map((docType) => {
        const existing = existingDocs.find((d) => d.type === docType) || null;
        return (
          <DocumentUploadCard
            key={docType}
            docType={docType}
            existingDoc={existing}
            onUploaded={() => router.refresh()}
          />
        );
      })}
    </div>
  );
}
