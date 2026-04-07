"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/sidebar";

type CustomerRow = {
  customerID: number;
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  idType: string;
  idValue: string;
};

type CustomerForm = {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  idType: string;
  idValue: string;
};

const emptyForm: CustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  idType: "",
  idValue: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function CustomerPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [editingCustomerID, setEditingCustomerID] = useState<number | null>(
    null,
  );

  async function fetchCustomers() {
    try {
      setLoading(true);
      const response = await fetch("/api/customers");
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not load customers.",
        });
        return;
      }
      setCustomers(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load customers." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      return (
        c.customerID.toString().includes(q) ||
        fullName.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q) ||
        c.idValue.toLowerCase().includes(q)
      );
    });
  }, [customers, search]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingCustomerID(null);
  }

  function startEdit(customer: CustomerRow) {
    setEditingCustomerID(customer.customerID);
    setForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      street: customer.street,
      city: customer.city,
      province: customer.province,
      postalCode: customer.postalCode,
      idType: customer.idType,
      idValue: customer.idValue,
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const isEditing = editingCustomerID !== null;
      const response = await fetch(
        isEditing ? `/api/customers/${editingCustomerID}` : "/api/customers",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not save customer.",
        });
        return;
      }
      setMessage({
        type: "success",
        text: isEditing
          ? `Customer ${editingCustomerID} updated.`
          : `Customer created with ID ${data.customerID}.`,
      });
      resetForm();
      fetchCustomers();
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    }
  }

  async function handleDelete(customerID: number) {
    if (!window.confirm(`Delete customer ${customerID}?`)) return;
    setMessage(null);
    try {
      const response = await fetch(`/api/customers/${customerID}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not delete customer.",
        });
        return;
      }
      setMessage({ type: "success", text: `Customer ${customerID} deleted.` });
      if (editingCustomerID === customerID) resetForm();
      fetchCustomers();
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar role="employee" />

        <section className="flex-1 overflow-auto">
          {/* Page header */}
          <div className="border-b border-gray-200 bg-white px-8 py-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Customer Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View, add, edit, and delete customer records
            </p>
          </div>

          {/* Sub-nav tabs */}
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
                    tab.label === "Customers"
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

            {/* Add / Edit form */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  {editingCustomerID
                    ? `Edit Customer #${editingCustomerID}`
                    : "Add New Customer"}
                </h3>
                {editingCustomerID && (
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
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
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
                  <label className={labelClass}>ID Type</label>
                  <select
                    name="idType"
                    value={form.idType}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select ID type</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVING_LICENSE">Driver's License</option>
                    <option value="SIN">SIN</option>
                    <option value="SSN">SSN</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>ID Value</label>
                  <input
                    name="idValue"
                    value={form.idValue}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {editingCustomerID ? "Save Changes" : "Add Customer"}
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
                Search Customers
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, province, ID value, or customer ID..."
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
                        "Customer ID",
                        "Name",
                        "Email",
                        "City",
                        "Province",
                        "ID Type",
                        "ID Value",
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
                          Loading customers...
                        </td>
                      </tr>
                    ) : filteredCustomers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-10 text-center text-sm text-gray-400"
                        >
                          No customers found.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr
                          key={customer.customerID}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {customer.customerID}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {customer.firstName} {customer.lastName}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {customer.email}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {customer.city}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {customer.province}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {customer.idType}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {customer.idValue}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(customer)}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(customer.customerID)
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
