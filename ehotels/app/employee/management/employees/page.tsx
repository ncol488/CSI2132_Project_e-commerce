"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/sidebar";

type EmployeeRow = {
  employeeID: number;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  ssnSin: string;
  hotelID: number;
  roleName: string | null;
};

type EmployeeForm = {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  ssnSin: string;
  hotelID: string;
  roleName: string;
};

const emptyForm: EmployeeForm = {
  firstName: "",
  lastName: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  ssnSin: "",
  hotelID: "",
  roleName: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [editingEmployeeID, setEditingEmployeeID] = useState<number | null>(
    null,
  );

  async function fetchEmployees() {
    try {
      setLoading(true);
      const response = await fetch("/api/employees");
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not load employees.",
        });
        return;
      }
      setEmployees(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load employees." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
      return (
        e.employeeID.toString().includes(q) ||
        fullName.includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.province.toLowerCase().includes(q) ||
        e.ssnSin.toLowerCase().includes(q) ||
        e.hotelID.toString().includes(q) ||
        (e.roleName || "").toLowerCase().includes(q)
      );
    });
  }, [employees, search]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingEmployeeID(null);
  }

  function startEdit(employee: EmployeeRow) {
    setEditingEmployeeID(employee.employeeID);
    setForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      street: employee.street,
      city: employee.city,
      province: employee.province,
      postalCode: employee.postalCode,
      ssnSin: employee.ssnSin,
      hotelID: String(employee.hotelID),
      roleName: employee.roleName || "",
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const isEditing = editingEmployeeID !== null;
      const payload = { ...form, hotelID: Number(form.hotelID) };
      const response = await fetch(
        isEditing ? `/api/employees/${editingEmployeeID}` : "/api/employees",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not save employee.",
        });
        return;
      }
      setMessage({
        type: "success",
        text: isEditing
          ? `Employee ${editingEmployeeID} updated.`
          : `Employee created with ID ${data.employeeID}.`,
      });
      resetForm();
      fetchEmployees();
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    }
  }

  async function handleDelete(employeeID: number) {
    if (!window.confirm(`Delete employee ${employeeID}?`)) return;
    setMessage(null);
    try {
      const response = await fetch(`/api/employees/${employeeID}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not delete employee.",
        });
        return;
      }
      setMessage({ type: "success", text: `Employee ${employeeID} deleted.` });
      if (editingEmployeeID === employeeID) resetForm();
      fetchEmployees();
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar role="employee" />

        <section className="flex-1 overflow-auto">
          <div className="border-b border-gray-200 bg-white px-8 py-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Employee Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View, add, edit, and delete employee records
            </p>
          </div>

          <div className="border-b border-gray-200 bg-white px-8">
            <div className="flex gap-6">
              {[
                { label: "Customers", href: "/employee/management/customers" },
                { label: "Employees", href: "/employee/management/employees" },
                { label: "Hotels", href: "/employee/management/hotels" },
                { label: "Rooms", href: "/employee/management/rooms" },
              ].map((tab) => (
                <a
                  key={tab.href}
                  href={tab.href}
                  className={`border-b-2 py-3.5 text-sm font-semibold transition ${
                    tab.label === "Employees"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </a>
              ))}
            </div>
          </div>

          <div className="p-8">
            {message && (
              <div
                className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Form */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  {editingEmployeeID
                    ? `Edit Employee #${editingEmployeeID}`
                    : "Add New Employee"}
                </h3>
                {editingEmployeeID && (
                  <button
                    onClick={resetForm}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid gap-4 md:grid-cols-2"
              >
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Street</label>
                  <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Province</label>
                  <input
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Postal Code</label>
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>SSN / SIN</label>
                  <input
                    name="ssnSin"
                    value={form.ssnSin}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Hotel ID</label>
                  <input
                    name="hotelID"
                    type="number"
                    min="1"
                    value={form.hotelID}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Role Name</label>
                  <input
                    name="roleName"
                    value={form.roleName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Manager, Receptionist"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {editingEmployeeID ? "Save Changes" : "Add Employee"}
                  </button>
                </div>
              </form>
            </div>

            {/* Search */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg
                  className="h-4 w-4 text-gray-400"
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
                Search Employees
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, province, employee ID, hotel ID, role, or SSN/SIN..."
                className={inputClass}
              />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {[
                        "Employee ID",
                        "Name",
                        "City",
                        "Province",
                        "Hotel ID",
                        "Role",
                        "SSN / SIN",
                        "Actions",
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-10 text-center text-sm text-gray-400"
                        >
                          Loading employees...
                        </td>
                      </tr>
                    ) : filteredEmployees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-10 text-center text-sm text-gray-400"
                        >
                          No employees found.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr
                          key={employee.employeeID}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {employee.employeeID}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {employee.firstName} {employee.lastName}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {employee.city}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {employee.province}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {employee.hotelID}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {employee.roleName || "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {employee.ssnSin}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(employee)}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(employee.employeeID)
                                }
                                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
