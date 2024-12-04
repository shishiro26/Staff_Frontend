"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface AssistanceRequest {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    seatNumber: string;
  };
  userName: string;
  type: string;
  customRequest?: string;
  seatNumber: string;
  status: string;
  createdAt: string;
}

const API_URL = "http://localhost:5000/api/assistanceRequest";

export default function AssistanceRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  // Fetch Assistance Requests
  const fetchRequests = async () => {
    setLoading(true);
    setNoData(false);
    setRequests([]);
    try {
      const response = await fetch(API_URL, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      console.log(data);
      setRequests(data.data || []);
      if (data.data.length === 0) setNoData(true);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`${API_URL}/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      fetchRequests(); // Refresh the list after update
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-700">
          Assistance Requests
        </h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center text-black flex items-center justify-center h-96">
            Loading...
          </div>
        ) : noData ? (
          <div className="text-center text-black flex items-center justify-center h-96">
            No Assistance Requests Found
          </div>
        ) : (
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Seat Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Custom Request</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <TableRow
                  key={request._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="text-sm font-medium text-gray-900">
                    {request._id}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {request.userName}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {request.seatNumber}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {request.type}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {request.customRequest || "N/A"}
                  </TableCell>
                  <TableCell
                    className={`text-sm font-semibold ${
                      request.status === "Pending"
                        ? "text-yellow-600"
                        : request.status === "In Progress"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {request.status}
                  </TableCell>
                  <TableCell className="text-sm space-x-1">
                    <Button
                      onClick={() =>
                        updateRequestStatus(request._id, "In Progress")
                      }
                      variant={"outline"}
                      size={"sm"}
                    >
                      In Progress
                    </Button>
                    <Button
                      onClick={() =>
                        updateRequestStatus(request._id, "Completed")
                      }
                      variant={"default"}
                      size={"sm"}
                    >
                      Complete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
