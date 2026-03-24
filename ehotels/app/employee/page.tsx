import Link from "next/link";

const frontDeskLinks = [
  {
    title: "Check-In Desk",
    description: "Search bookings and convert them into rentings during guest check-in.",
    href: "/employee/checkin",
  },
  {
    title: "Walk-In Renting",
    description: "Create a renting for customers without a prior booking.",
    href: "/employee/walkin",
  },
  {
    title: "Record Payment",
    description: "Attach and record a payment for an existing renting.",
    href: "/employee/payments",
  },
];

const managementLinks = [
  {
    title: "Manage Customers",
    description: "Add, edit, delete, and review customer information.",
    href: "/employee/management/customers",
  },
  {
    title: "Manage Employees",
    description: "Update employee roles, addresses, and employee records.",
    href: "/employee/management/employees",
  },
  {
    title: "Manage Hotels",
    description: "Edit hotel records, chain information, and hotel details.",
    href: "/employee/management/hotels",
  },
  {
    title: "Manage Rooms",
    description: "Update room price, amenities, availability, and damages/problems.",
    href: "/employee/management/rooms",
  },
];

export default function EmployeeDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="w-64 border-r border-gray-200 bg-white p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900">e-Hotels</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>

          <div className="mb-8 flex gap-2">
            <button className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600">
              Customer
            </button>
            <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white">
              Employee
            </button>
          </div>

          <nav className="space-y-2">
            <a
              href="#frontdesk"
              className="block rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
            >
              Front Desk
            </a>
            <a
              href="#management"
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Management
            </a>
            <a
              href="#reports"
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Reports
            </a>
          </nav>
        </aside>

        <section className="flex-1 p-8">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Employee Control Center</h2>
            <p className="mt-2 text-gray-600">
              Manage front desk operations, update hotel records, and view reports.
            </p>
          </header>

          <section id="frontdesk" className="mb-10">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Front Desk Operations</h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {frontDeskLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section id="management" className="mb-10">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Management</h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              {managementLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section id="reports">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Reports</h3>
            <Link
              href="/employee/reports"
              className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h4 className="text-lg font-semibold text-gray-900">View Reports</h4>
              <p className="mt-2 text-sm text-gray-600">
                See available rooms per area and total room capacity per hotel.
              </p>
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}