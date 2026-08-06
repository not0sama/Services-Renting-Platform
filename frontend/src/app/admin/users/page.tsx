"use client";

import { useEffect, useState } from "react";
import {
  Users, Search, ShieldOff, ShieldCheck, ChevronLeft, ChevronRight,
} from "lucide-react";
import api from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  customer: "text-blue-700 bg-blue-50",
  provider: "text-violet-700 bg-violet-50",
  admin: "text-red-700 bg-red-50",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    api.get<User[]>(`/admin/users?${params}`)
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, roleFilter]);
  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search]);

  const toggleStatus = async (user: User) => {
    const endpoint = user.is_active ? "suspend" : "reactivate";
    await api.patch(`/admin/users/${user.id}/${endpoint}`, {});
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm bg-white"
        >
          <option value="">All Roles</option>
          <option value="customer">Customers</option>
          <option value="provider">Providers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">User</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Joined</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-5 py-3">
                    <div className="h-5 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[user.role] ?? ""}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.is_active ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
                    }`}>
                      {user.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleStatus(user)}
                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                        user.is_active
                          ? "text-red-600 hover:bg-red-50 border border-red-100"
                          : "text-emerald-600 hover:bg-emerald-50 border border-emerald-100"
                      }`}
                    >
                      {user.is_active ? <><ShieldOff className="w-3 h-3" /> Suspend</> : <><ShieldCheck className="w-3 h-3" /> Activate</>}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Page {page}</span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={users.length < 20}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
