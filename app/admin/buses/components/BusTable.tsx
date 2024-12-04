"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Bus {
  ownerName: string;
  sourceCity: string;
  destinationCity: string;
  restStopsCities: string[];
  _id: string;
  busId: string;
  ownerId: string;
  staff: string[];
  busCapacity: number;
  seats: string[];
  source: string;
  destination: string;
  busPhotos: string[];
  bus3DModels: string[];
  earningPerDay: number;
  restStops: string[];
  busNumber: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/bus`;

export default function BusTable() {
  const router = useRouter();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  // Sorting and Filtering State
  // 'all', 'zero', 'non-zero'
  const [sortKey, setSortKey] = useState<string>("busNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // const busesPerPage = 5;

  const fetchBuses = async () => {
    setLoading(true);
    setNoData(false);
    setBuses([]);
    try {
      const response = await fetch(`${API_URL}/owner/list/ownerId`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to fetch buses");

      const data = await response.json();
      const busesWithDetails = await Promise.all(
        data.buses.map(
          async (bus: {
            ownerId: string;
            source: string;
            destination: string;
            restStops: string[];
          }) => {
            // Fetch owner name
            const ownerResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/users/${bus.ownerId}`,
              {
                method: "GET",
              }
            );
            const ownerData = await ownerResponse.json();
            const ownerName = ownerData.name || "Unknown Owner"; // Ensure fallback if owner name is not available

            // Fetch city names for source, destination, and rest stops
            const sourceResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/cities/city/${bus.source}`,
              {
                method: "GET",
              }
            );
            const sourceData = await sourceResponse.json();
            const sourceCity = sourceData.city.cityName || "Unknown City"; // Fallback if city name is not available

            const destinationResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/cities/city/${bus.destination}`,
              {
                method: "GET",
              }
            );
            const destinationData = await destinationResponse.json();
            console.log(destinationData.city.cityName);
            const destinationCity =
              destinationData.city.cityName || "Unknown City"; // Fallback if city name is not available

            const restStopsCities = await Promise.all(
              bus.restStops.map(async (restStopId: string) => {
                const restStopResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/cities/city/${restStopId}`,
                  {
                    method: "GET",
                  }
                );
                const restStopData = await restStopResponse.json();
                return restStopData.city.cityName || "Unknown City";
              })
            );

            // Return updated bus object with all details
            return {
              ...bus,
              ownerName: ownerName,
              sourceCity: sourceCity,
              destinationCity: destinationCity,
              restStopsCities: restStopsCities,
            };
          }
        )
      );
      console.log(busesWithDetails);
      setBuses(busesWithDetails);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching buses:", error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [currentPage, sortKey, sortOrder]);

  // Pagination handler
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Sorting handler
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Filter handler

  return (
    <div>
      {/* Controls for Sorting and Filtering */}
      <div className="flex items-center justify-between mb-6 space-x-4">
        {/* Filter by Seats */}
        {/* <select
          value={filterBySeats}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-4 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-sm"
        >
          <option value="all">All Buses</option>
          <option value="">Buses with 0 Seats</option>
          <option value="non-zero">Buses with Non-Zero Seats</option>
        </select> */}

        {/* Sort by Key */}
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="px-4 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-sm"
        >
          <option value="busNumber">Sort by Bus Number</option>
          <option value="busId">Sort by Bus ID</option>
          <option value="busCapacity">Sort by Bus Capacity</option>
          <option value="earningPerDay">Sort by Earning Per Day</option>
        </select>

        {/* Toggle Sort Order */}
        <button
          onClick={toggleSortOrder}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          {sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
        </button>
      </div>

      {/* Table Layout */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center text-black flex items-center justify-center h-96">
            Loading...
          </div>
        ) : noData ? (
          <div className="text-center text-black flex items-center justify-center h-96">
            No Buses Found
          </div>
        ) : (
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Bus Number
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Earning Per Day
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Rest Stops
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {buses.map((bus) => (
                <tr
                  key={bus._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {bus.busId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {bus.busNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {bus.busCapacity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    ₹{bus.earningPerDay}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {bus.ownerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {bus.sourceCity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {bus.destinationCity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {bus.restStopsCities.join(", ")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <button
                      onClick={() =>
                        router.push(`/admin/buses/${bus.busId}/edit`)
                      }
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      Edit Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-4 py-2 rounded-md ${
                currentPage === number
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700"
              } hover:bg-black hover:text-white transition-colors`}
            >
              {number}
            </button>
          )
        )}
      </div>
    </div>
  );
}
