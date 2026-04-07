"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  role: "customer" | "employee";
};

export default function Sidebar({ role }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [isManagementOpen, setIsManagementOpen] = useState(
    pathname.startsWith("/employee/management"),
  );

  const managementSubLinks = [
    { label: "Customers", href: "/employee/management/customers" },
    { label: "Employees", href: "/employee/management/employees" },
    { label: "Hotels", href: "/employee/management/hotels" },
    { label: "Rooms", href: "/employee/management/rooms" },
  ];

  /**
   * Clears the session via the API and local storage,
   * then redirects to the login page.
   */
  const handleLogout = async () => {
    try {
      // 1. Call the logout API to clear server-side cookies
      await fetch("/api/logout", { method: "POST" });

      // 2. Clear local storage to remove UI-specific data
      localStorage.clear();

      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  return (
    <aside className="flex w-60 flex-col border-r border-gray-200 bg-white min-h-screen">
      {/* Logo Section */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 9.75L12 3l9 6.75V21H3V9.75z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">e-Hotels</p>
          <p className="text-xs text-gray-500">Management System</p>
        </div>
      </div>

      {/* Auth Section */}
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              Signed in as
            </span>
            <span className="text-xs font-bold text-blue-600 capitalize">
              {role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-gray-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {role === "customer" ? (
          <>
            <SidebarLink
              href="/customer"
              icon={<SearchIcon />}
              label="Search Rooms"
              active={pathname.startsWith("/customer/search")}
            />
            <SidebarLink
              href="/customer/bookings"
              icon={<BookingIcon />}
              label="My Bookings"
              active={pathname.startsWith("/customer/bookings")}
            />
          </>
        ) : (
          <>
            <SidebarLink
              href="/employee/checkin"
              icon={<FrontDeskIcon />}
              label="Front Desk"
              active={pathname.startsWith("/employee/checkin")}
            />

            <div>
              <button
                onClick={() => setIsManagementOpen(!isManagementOpen)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  pathname.startsWith("/employee/management")
                    ? "text-blue-700 bg-blue-50/50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ManagementIcon />
                  Management
                </div>
                <svg
                  className={`h-4 w-4 transition-transform ${isManagementOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isManagementOpen && (
                <div className="mt-1 ml-9 space-y-1 border-l border-gray-100">
                  {managementSubLinks.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`block rounded-md px-3 py-2 text-xs font-medium transition ${
                        pathname === sub.href
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <SidebarLink
              href="/employee/reports"
              icon={<ReportsIcon />}
              label="Reports"
              active={pathname.startsWith("/employee/reports")}
            />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-5 py-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          © 2026 e-Hotels Consortium
        </p>
      </div>
    </aside>
  );
}

/**
 * Reusable Nav Link Component
 */
function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-blue-50 font-bold text-blue-700"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

/* --- Icons --- */
const SearchIcon = () => (
  <svg
    className="h-4 w-4 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
    />
  </svg>
);
const BookingIcon = () => (
  <svg
    className="h-4 w-4 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const ProfileIcon = () => (
  <svg
    className="h-4 w-4 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);
const FrontDeskIcon = () => (
  <svg
    className="h-4 w-4 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const ManagementIcon = () => (
  <svg
    className="h-4 w-4 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const ReportsIcon = () => (
  <svg
    className="h-4 w-4 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);
