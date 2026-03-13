"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Phone,
  MapPin,
  Mail,
  Calendar,
  Shield,
  ShieldPlus,
  ShieldMinus,
  Car,
  UserIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/context";

type UserRecord = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  email: string | null;
  role: string;
  city: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  driver: { id: string; status: string } | null;
};

const ROLE_TABS = ["all", "CLIENT", "DRIVER", "ADMIN"] as const;

interface AdminUserListProps {
  isSuperAdmin?: boolean;
}

export function AdminUserList({ isSuperAdmin = false }: AdminUserListProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    userId: string;
    newRole: string;
    userName: string;
  } | null>(null);

  const tabLabels: Record<string, string> = {
    all: t.admin.tabs.all,
    CLIENT: t.adminUsers.roleClient,
    DRIVER: t.adminUsers.roleDriver,
    ADMIN: "Admin",
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role !== "all") params.set("role", role);
      if (search) params.set("search", search);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      // ignore
    }
    setLoading(false);
  }

  function handleSearch() {
    setPage(1);
    fetchUsers();
  }

  const roleColors: Record<string, string> = {
    CLIENT: "bg-blue-100 text-blue-700",
    DRIVER: "bg-primary-100 text-primary-700",
    ADMIN: "bg-purple-100 text-purple-700",
    SUPER_ADMIN: "bg-red-100 text-red-700",
  };

  const roleLabels: Record<string, string> = {
    CLIENT: t.adminUsers.roleClient,
    DRIVER: t.adminUsers.roleDriver,
    ADMIN: "Admin",
    SUPER_ADMIN: "Super Admin",
  };

  async function handleRoleChange(userId: string, newRole: string) {
    setChangingRole(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch {
      // ignore
    }
    setChangingRole(null);
    setConfirmAction(null);
  }

  const ROLE_OPTIONS = [
    { value: "CLIENT", label: t.adminUsers.roleClient },
    { value: "ADMIN", label: "Admin" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
  ];

  const RoleIcon = ({ userRole }: { userRole: string }) => {
    if (userRole === "DRIVER") return <Car className="h-4 w-4 text-primary-500" />;
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN")
      return <Shield className="h-4 w-4 text-purple-500" />;
    return <UserIcon className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ROLE_TABS.map((tab) => (
          <Button
            key={tab}
            variant={role === tab ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setRole(tab);
              setPage(1);
            }}
          >
            {tabLabels[tab]}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t.adminUsers.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>{t.driversList.search}</Button>
      </div>

      {/* Stats bar */}
      <div className="mb-4 text-sm text-gray-500">
        {total} {t.adminUsers.usersFound}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          {t.common.loading}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t.adminUsers.noUsers}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border p-3 sm:p-4 transition-all duration-200 hover:bg-gray-50"
            >
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <RoleIcon userRole={user.role} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                      <p className="font-display font-bold text-gray-900 text-sm sm:text-base">
                        {user.firstName || ""} {user.lastName || ""}
                        {!user.firstName && !user.lastName && user.phone}
                      </p>
                      <Badge
                        className={`text-xs ${roleColors[user.role] || "bg-gray-100 text-gray-700"}`}
                      >
                        {roleLabels[user.role] || user.role}
                      </Badge>
                      {!user.isActive && (
                        <Badge className="text-xs bg-red-100 text-red-700">
                          {t.adminUsers.inactive}
                        </Badge>
                      )}
                      {user.driver && (
                        <Badge
                          className={`text-xs ${
                            user.driver.status === "VERIFIED"
                              ? "bg-green-100 text-green-700"
                              : user.driver.status === "PENDING_VERIFICATION"
                              ? "bg-accent-100 text-accent-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {user.driver.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        {user.phone}
                      </span>
                      {user.email && (
                        <span className="hidden sm:flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {user.email}
                        </span>
                      )}
                      {user.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                          {user.city}
                        </span>
                      )}
                      <span className="hidden sm:flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>
                {user.driver && (
                  <a
                    href={`/admin/drivers/${user.driver.id}`}
                    className="text-primary-500 hover:text-primary-600 shrink-0"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </a>
                )}
              </div>
              {/* Role management — SUPER_ADMIN only, shown below on mobile */}
              {isSuperAdmin && user.role !== "DRIVER" && (
                <div className="mt-2 sm:mt-3 pl-12 sm:pl-14">
                  {confirmAction?.userId === user.id ? (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2">
                      <span className="text-xs text-purple-700">
                        {t.adminUsers.confirmRoleChange
                          .replace("{name}", user.firstName || user.phone)
                          .replace("{role}", roleLabels[confirmAction.newRole] || confirmAction.newRole)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          disabled={changingRole === user.id}
                          onClick={() => handleRoleChange(user.id, confirmAction.newRole)}
                        >
                          {changingRole === user.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            t.adminUsers.confirm
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => setConfirmAction(null)}
                        >
                          {t.adminUsers.cancel}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {user.role === "CLIENT" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                          onClick={() =>
                            setConfirmAction({
                              userId: user.id,
                              newRole: "ADMIN",
                              userName: user.firstName || user.phone,
                            })
                          }
                        >
                          <ShieldPlus className="h-3.5 w-3.5" />
                          {t.adminUsers.makeAdmin}
                        </Button>
                      )}
                      {user.role === "ADMIN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() =>
                            setConfirmAction({
                              userId: user.id,
                              newRole: "CLIENT",
                              userName: user.firstName || user.phone,
                            })
                          }
                        >
                          <ShieldMinus className="h-3.5 w-3.5" />
                          {t.adminUsers.removeAdmin}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t.admin.previous}
          </Button>
          <span className="text-sm text-gray-600">
            {t.admin.page} {page} {t.admin.of} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t.admin.next}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
