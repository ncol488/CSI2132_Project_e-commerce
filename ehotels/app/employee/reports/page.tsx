"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/sidebar";

type AvailableRoomRow = {
  area: string;
  availableRooms: number;
  totalRooms?: number;
};

type HotelCapacityRow = {
  hotelID: number;
  hotelName?: string;
  city: string;
  totalCapacity: number;
  occupiedBeds?: number;
};

function BarChart({
  data,
  bars,
  xKey,
}: {
  data: Record<string, any>[];
  bars: { key: string; color: string; label: string }[];
  xKey: string;
}) {
  const allValues = data.flatMap((d) => bars.map((b) => Number(d[b.key] ?? 0)));
  const max = Math.max(...allValues, 1);
  const chartHeight = 200;
  const barWidth = 40;
  const barGap = 6;
  const groupGap = 28;
  const paddingLeft = 44;
  const groupWidth = bars.length * (barWidth + barGap) - barGap;
  const totalWidth = paddingLeft + data.length * (groupWidth + groupGap);

  return (
    <div className="overflow-x-auto">
      <svg
        width={totalWidth}
        height={chartHeight + 56}
        style={{ display: "block" }}
      >
        {/* Y axis grid + labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = Math.round(chartHeight - pct * chartHeight);
          const val = Math.round(max * pct * 10) / 10;
          return (
            <g key={pct}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={totalWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 6}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="#9ca3af"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars + x labels */}
        {data.map((d, i) => {
          const groupX = paddingLeft + i * (groupWidth + groupGap);
          const labelX = groupX + groupWidth / 2;
          const label = String(d[xKey]);
          return (
            <g key={i}>
              {bars.map((bar, j) => {
                const val = Number(d[bar.key] ?? 0);
                const barH = Math.max(
                  (val / max) * chartHeight,
                  val > 0 ? 2 : 0,
                );
                const x = groupX + j * (barWidth + barGap);
                const y = chartHeight - barH;
                return (
                  <g key={bar.key}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      fill={bar.color}
                      rx={3}
                    />
                    {val > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize={10}
                        fill={bar.color}
                        fontWeight="700"
                      >
                        {val}
                      </text>
                    )}
                  </g>
                );
              })}
              <text
                x={labelX}
                y={chartHeight + 18}
                textAnchor="middle"
                fontSize={10}
                fill="#6b7280"
                transform={`rotate(-18, ${labelX}, ${chartHeight + 18})`}
              >
                {label.length > 16 ? label.slice(0, 15) + "…" : label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex justify-center gap-6">
        {bars.map((bar) => (
          <div key={bar.key} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: bar.color }}
            />
            <span className="text-xs font-medium" style={{ color: bar.color }}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [availableRoomsPerArea, setAvailableRoomsPerArea] = useState<
    AvailableRoomRow[]
  >([]);
  const [hotelTotalCapacity, setHotelTotalCapacity] = useState<
    HotelCapacityRow[]
  >([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const response = await fetch("/api/reports");
        const data = await response.json();
        if (!response.ok) {
          setMessage(data.error || "Could not load reports.");
          return;
        }
        setAvailableRoomsPerArea(data.availableRoomsPerArea || []);
        setHotelTotalCapacity(data.hotelTotalCapacity || []);
      } catch {
        setMessage("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar role="employee" />

        <section className="flex-1 overflow-auto">
          <div className="border-b border-gray-200 bg-white px-8 py-6">
            <h2 className="text-3xl font-bold text-gray-900">Reports</h2>
            <p className="mt-1 text-sm text-gray-500">
              Database views — available rooms per area and hotel capacity
            </p>
          </div>

          <div className="p-8">
            {message && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </div>
            )}

            {loading ? (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-400 shadow-sm">
                Loading reports...
              </div>
            ) : (
              <div className="space-y-8">
                {/* Card 1 — Available Rooms Per Area */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div
                    className="flex items-center gap-3 px-6 py-5"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 100%)",
                    }}
                  >
                    <svg
                      className="h-5 w-5 shrink-0 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Available Rooms per Area
                      </h3>
                      <p className="text-xs text-blue-100">
                        Room availability across all locations
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <BarChart
                      data={availableRoomsPerArea.map((r) => ({
                        area: r.area,
                        availableRooms: r.availableRooms,
                        totalRooms: r.totalRooms ?? r.availableRooms,
                      }))}
                      xKey="area"
                      bars={[
                        {
                          key: "availableRooms",
                          color: "#4c6ef5",
                          label: "Available Rooms",
                        },
                        {
                          key: "totalRooms",
                          color: "#dee2e6",
                          label: "Total Rooms",
                        },
                      ]}
                    />

                    <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-5 py-3 text-xs font-semibold text-gray-600">
                              Area
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">
                              Available Rooms
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">
                              Total Rooms
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">
                              Occupancy Rate
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableRoomsPerArea.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-5 py-8 text-center text-sm text-gray-400"
                              >
                                No data found.
                              </td>
                            </tr>
                          ) : (
                            availableRoomsPerArea.map((row) => {
                              const total =
                                row.totalRooms ?? row.availableRooms;
                              const occupancy =
                                total > 0
                                  ? (
                                      ((total - row.availableRooms) / total) *
                                      100
                                    ).toFixed(1)
                                  : "0.0";
                              return (
                                <tr
                                  key={row.area}
                                  className="border-t border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="px-5 py-3.5 font-medium text-gray-900">
                                    {row.area}
                                  </td>
                                  <td className="px-5 py-3.5 text-right font-semibold text-green-600">
                                    {row.availableRooms}
                                  </td>
                                  <td className="px-5 py-3.5 text-right text-gray-700">
                                    {total}
                                  </td>
                                  <td className="px-5 py-3.5 text-right text-gray-700">
                                    {occupancy}%
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Card 2 — Hotel Capacity Overview */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div
                    className="flex items-center gap-3 px-6 py-5"
                    style={{
                      background:
                        "linear-gradient(135deg, #862e9c 0%, #e64980 100%)",
                    }}
                  >
                    <svg
                      className="h-5 w-5 shrink-0 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Hotel Capacity Overview
                      </h3>
                      <p className="text-xs text-pink-100">
                        Total beds and capacity per hotel
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <BarChart
                      data={hotelTotalCapacity.map((r) => ({
                        name: r.hotelName ?? `Hotel #${r.hotelID}`,
                        totalCapacity: r.totalCapacity,
                        occupiedBeds: r.occupiedBeds ?? 0,
                        availableCapacity:
                          r.totalCapacity - (r.occupiedBeds ?? 0),
                      }))}
                      xKey="name"
                      bars={[
                        {
                          key: "totalCapacity",
                          color: "#7048e8",
                          label: "Total Beds",
                        },
                        {
                          key: "occupiedBeds",
                          color: "#e64980",
                          label: "Occupied Beds",
                        },
                        {
                          key: "availableCapacity",
                          color: "#69db7c",
                          label: "Available Capacity",
                        },
                      ]}
                    />

                    <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-5 py-3 text-xs font-semibold text-gray-600">
                              Hotel Name
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">
                              Total Beds
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">
                              Occupied Beds
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">
                              Available Capacity
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">
                              Utilization
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {hotelTotalCapacity.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-5 py-8 text-center text-sm text-gray-400"
                              >
                                No data found.
                              </td>
                            </tr>
                          ) : (
                            hotelTotalCapacity.map((row) => {
                              const occupied = row.occupiedBeds ?? 0;
                              const available = row.totalCapacity - occupied;
                              const utilization =
                                row.totalCapacity > 0
                                  ? (
                                      (occupied / row.totalCapacity) *
                                      100
                                    ).toFixed(1)
                                  : "0.0";
                              return (
                                <tr
                                  key={row.hotelID}
                                  className="border-t border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="px-5 py-3.5 font-medium text-gray-900">
                                    {row.hotelName ?? `Hotel #${row.hotelID}`}
                                  </td>
                                  <td className="px-5 py-3.5 text-right text-gray-700">
                                    {row.totalCapacity}
                                  </td>
                                  <td className="px-5 py-3.5 text-right font-semibold text-purple-600">
                                    {occupied}
                                  </td>
                                  <td className="px-5 py-3.5 text-right font-semibold text-green-600">
                                    {available}
                                  </td>
                                  <td className="px-5 py-3.5 text-right">
                                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                                      {utilization}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
