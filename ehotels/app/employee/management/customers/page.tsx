"use client";

//handle customer changes

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

export default function CustomerPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<CustomerForm>(emptyForm);

  // if null = add customer mode, or else edit mode
  const [editingCustomerID, setEditingCustomerID] = useState<number | null>(null);

  async function fetchCustomers() {
    try {
      setLoading(true);

      const response = await fetch("/api/customers");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not load customers.");
        return;
      }

      setCustomers(data);
    } catch (error) {
      setMessage("Failed to load customers.");
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

    return customers.filter((customer) => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();

      return (
        customer.customerID.toString().includes(q) ||
        fullName.includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.city.toLowerCase().includes(q) ||
        customer.province.toLowerCase().includes(q) ||
        customer.idValue.toLowerCase().includes(q)
      );
    });
  }, [customers, search]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      const isEditing = editingCustomerID !== null;

      const response = await fetch(
        isEditing ? `/api/customers/${editingCustomerID}` : "/api/customers",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not save customer.");
        return;
      }

      setMessage(
        isEditing
          ? `Customer ${editingCustomerID} updated successfully.`
          : `Customer created successfully with ID ${data.customerID}.`
      );

      resetForm();
      fetchCustomers();
    } catch (error) {
      setMessage("Something went wrong while saving the customer.");
    }
  }

  async function handleDelete(customerID: number) {
    const confirmed = window.confirm(
      `Are you sure you want to delete customer ${customerID}?`
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const response = await fetch(`/api/customers/${customerID}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not delete customer.");
        return;
      }

      setMessage(`Customer ${customerID} deleted successfully.`);

      // if user deletes the row currently being edited, reset the form
      if (editingCustomerID === customerID) {
        resetForm();
      }

      fetchCustomers();
    } catch (error) {
      setMessage("Something went wrong while deleting the customer.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        <aside className="flex w-72 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900">e-Hotels</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>

          <div className="border-b border-gray-200 p-4">
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                Customer
              </button>
              <button className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                Employee
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">

            <Link
              href="/employee#management"
              className="block rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
            >
              Management
            </Link>

            <Link
              href="/customer"
              className="block rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
            >
              Customers
            </Link>
            
            <Link
              href="/employee/management/employees"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Employees
            </Link>

            <Link
              href="/employee/management/hotels"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Hotels
            </Link>

            <Link
              href="/employee/management/rooms"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Rooms
            </Link>

          </nav>
        </aside>

        <section className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-6xl">
          <header className="mb-6">
            <h2 className="text-4xl font-bold text-gray-900">Customer Management</h2>
            <p className="mt-2 text-gray-600">
              View, add, edit, and delete customer records
            </p>
          </header>

          {message && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              {message}
            </div>
          )}

          {/* Add / Edit form */}
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingCustomerID ? `Edit Customer #${editingCustomerID}` : "Add New Customer"}
              </h3>

              {editingCustomerID && (
                <button
                  onClick={resetForm}
                  className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  First Name
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email" 
                value={form.email} 
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Street
                </label>
                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  City
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Province
                </label>
                <input
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Postal Code
                </label>
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  ID Type
                </label>
                <select
                  name="idType"
                  value={form.idType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select ID type</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driver's License</option>
                  <option value="SIN">SIN</option>
                  <option value="SSN">SSN</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  ID Value
                </label>
                <input
                  name="idValue"
                  value={form.idValue}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  {editingCustomerID ? "Save Changes" : "Add Customer"}
                </button>
              </div>
            </form>
          </section>

          {/* Search */}
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="search-customers"
              className="mb-3 block text-lg font-semibold text-gray-700"
            >
              Search Customers
            </label>

            <input
              id="search-customers"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city, province, ID value, or customer ID..."
              className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </section>

          {/* Customer table */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-sm uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Customer ID</th>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">City</th>
                    <th className="px-6 py-4 font-semibold">Province</th>
                    <th className="px-6 py-4 font-semibold">ID Type</th>
                    <th className="px-6 py-4 font-semibold">ID Value</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr className="border-t border-gray-200">
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Loading customers...
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr className="border-t border-gray-200">
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr
                        key={customer.customerID}
                        className="border-t border-gray-200 text-base text-gray-800"
                      >
                        <td className="px-6 py-5 font-medium">{customer.customerID}</td>
                        <td className="px-6 py-5">
                          {customer.firstName} {customer.lastName}
                        </td>
                        <td className="px-6 py-5">{customer.email}</td>
                        <td className="px-6 py-5">{customer.city}</td>
                        <td className="px-6 py-5">{customer.province}</td>
                        <td className="px-6 py-5">{customer.idType}</td>
                        <td className="px-6 py-5">{customer.idValue}</td>
                        <td className="px-6 py-5">
                          <div className="flex gap-3">
                            <button
                              onClick={() => startEdit(customer)}
                              className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(customer.customerID)}
                              className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
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
          </section>
          </div>
        </section>
      </div>
    </main>
  );
}