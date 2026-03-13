import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUserList } from "@/components/admin/admin-user-list";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { getServerDictionary } from "@/lib/i18n";

export const metadata = {
  title: "Utilisateurs - Admin",
};

export default async function AdminUsersPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const t = await getServerDictionary();

  const [totalUsers, totalClients, totalDrivers, totalAdmins] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "DRIVER" } }),
      prisma.user.count({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      }),
    ]);

  return (
    <main className="container-app py-6 sm:py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8">
        <Users className="inline h-6 w-6 sm:h-8 sm:w-8 text-primary-500 mr-2 sm:mr-3" />
        {t.adminUsers.title}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4 mb-6 sm:mb-10">
        <Card className="border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="font-display text-xl sm:text-3xl font-black text-gray-900">
              {totalUsers}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">{t.adminUsers.totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="font-display text-xl sm:text-3xl font-black text-blue-600">
              {totalClients}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">{t.adminUsers.totalClients}</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="font-display text-xl sm:text-3xl font-black text-primary-600">
              {totalDrivers}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">{t.adminUsers.totalDrivers}</p>
          </CardContent>
        </Card>
        <Card className="border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="font-display text-xl sm:text-3xl font-black text-purple-600">
              {totalAdmins}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">{t.adminUsers.totalAdmins}</p>
          </CardContent>
        </Card>
      </div>

      {/* User list */}
      <Card className="border-0 shadow-card-lift">
        <CardHeader>
          <CardTitle className="font-display">
            {t.adminUsers.allUsers}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminUserList isSuperAdmin={isSuperAdmin} />
        </CardContent>
      </Card>
    </main>
  );
}
