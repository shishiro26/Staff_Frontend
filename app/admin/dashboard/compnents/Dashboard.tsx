"use client";

export default function Dashboard() {
  const handleLogout = () => {
    // Implement your logout logic here
    console.log("User logged out");
    // Example: Redirect to login page
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-5xl font-semibold text-black justify-center items-center">
        Welcome to the Staff Dashboard
      </h1>

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 items-end justify-end"
      >
        Logout
      </button>
    </div>
  );
}
