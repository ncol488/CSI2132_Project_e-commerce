"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

//add and list employees, similar to customer management page

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

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [editingEmployeeID, setEditingEmployeeID] = useState<number | null>(null);

  async function fetchEmployees() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/employees");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not load employees.");
        return;
      }

      setEmployees(data);
    } catch (error) {
      setMessage("Failed to load employees.");
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

    return employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();

      return (
        employee.employeeID.toString().includes(q) ||
        fullName.includes(q) ||
        employee.city.toLowerCase().includes(q) ||
        employee.province.toLowerCase().includes(q) ||
        employee.ssnSin.toLowerCase().includes(q) ||
        employee.hotelID.toString().includes(q) ||
        (employee.roleName || "").toLowerCase().includes(q)
      );
    });
  }, [employees, search]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        street: form.street,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,
        ssnSin: form.ssnSin,
        hotelID: Number(form.hotelID),
        roleName: form.roleName,
      };

      const isEditing = editingEmployeeID !== null;

      const response = await fetch(
        isEditing ? `/api/employees/${editingEmployeeID}` : "/api/employees",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not save employee.");
        return;
      }

      setMessage(
        isEditing
          ? `Employee ${editingEmployeeID} updated successfully.`
          : `Employee created successfully with ID ${data.employeeID}.`
      );

      resetForm();
      fetchEmployees();
    } catch (error) {
      setMessage("Something went wrong while saving the employee.");
    }
  }

  async function handleDelete(employeeID: number) {
    const confirmed = window.confirm(
      `Are you sure you want to delete employee ${employeeID}?`
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const response = await fetch(`/api/employees/${employeeID}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not delete employee.");
        return;
      }

      setMessage(`Employee ${employeeID} deleted successfully.`);

      if (editingEmployeeID === employeeID) {
        resetForm();
      }

      fetchEmployees();
    } catch (error) {
      setMessage("Something went wrong while deleting the employee.");
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
              <Link
                href="/"
                className="flex-1 rounded-xl bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-600"
              >
                Customer
              </Link>

              <Link
                href="/employee"
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white"
              >
                Employee
              </Link>
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
              href="/employee/management/customers"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Customers
            </Link>

            <Link
              href="/employee/management/employees"
              className="block rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
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

        <section className="flex-1 p-8">
          <header className="mb-6">
            <h2 className="text-4xl font-bold text-gray-900">Employee Management</h2>
            <p className="mt-2 text-gray-600">
              View, add, edit, and delete employee records
            </p>
          </header>

          {message && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              {message}
            </div>
          )}

          {/* Add and Edit form */}
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingEmployeeID
                  ? `Edit Employee #${editingEmployeeID}`
                  : "Add New Employee"}
              </h3>

              {editingEmployeeID && (
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
                  SSN / SIN
                </label>
                <input
                  name="ssnSin"
                  value={form.ssnSin}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Hotel ID
                </label>
                <input
                  name="hotelID"
                  type="number"
                  min="1"
                  value={form.hotelID}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Role Name
                </label>
                <input
                  name="roleName"
                  value={form.roleName}
                  onChange={handleChange}
                  required
                  placeholder="Enter any role name"
                  className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  {editingEmployeeID ? "Save Changes" : "Add Employee"}
                </button>
              </div>
            </form>
          </section>

          {/* Search */}
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="search-employees"
              className="mb-3 block text-lg font-semibold text-gray-700"
            >
              Search Employees
            </label>

            <input
              id="search-employees"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city, province, employee ID, hotel ID, role, or SSN/SIN..."
              className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </section>

          {/* Employee table */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-sm uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Employee ID</th>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">City</th>
                    <th className="px-6 py-4 font-semibold">Province</th>
                    <th className="px-6 py-4 font-semibold">Hotel ID</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">SSN / SIN</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr className="border-t border-gray-200">
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        Loading employees...
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr className="border-t border-gray-200">
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No employees found.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee.employeeID}
                        className="border-t border-gray-200 text-base text-gray-800"
                      >
                        <td className="px-6 py-5 font-medium">{employee.employeeID}</td>
                        <td className="px-6 py-5">
                          {employee.firstName} {employee.lastName}
                        </td>
                        <td className="px-6 py-5">{employee.city}</td>
                        <td className="px-6 py-5">{employee.province}</td>
                        <td className="px-6 py-5">{employee.hotelID}</td>
                        <td className="px-6 py-5">{employee.roleName || "No role"}</td>
                        <td className="px-6 py-5">{employee.ssnSin}</td>
                        <td className="px-6 py-5">
                          <div className="flex gap-3">
                            <button
                              onClick={() => startEdit(employee)}
                              className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(employee.employeeID)}
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
        </section>
      </div>
    </main>
  );
}