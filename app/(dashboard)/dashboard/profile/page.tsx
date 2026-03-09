import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Car } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { getServerDictionary } from "@/lib/i18n";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

export const metadata: Metadata = {
  title: "Modifier mon profil",
};

export default async function ProfileEditPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const t = await getServerDictionary();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      city: true,
      role: true,
      driver: {
        select: {
          id: true,
          hourlyRate: true,
          bio: true,
          experienceYears: true,
          languages: true,
          cities: true,
          momoNumber: true,
          momoProvider: true,
          status: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      <main className="container-app max-w-2xl py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors text-sm mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.common.back}
        </Link>

        <h1 className="font-display text-3xl font-extrabold text-gray-900">
          {t.editProfile.title}
        </h1>
        <p className="mt-2 text-gray-600 mb-8">
          {t.editProfile.subtitle}
        </p>

        <ProfileEditForm initialData={user} />
      </main>
    </div>
  );
}
