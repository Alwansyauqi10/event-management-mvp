import { Navigate, Outlet } from "react-router";
import { useProfile } from "../hooks/useProfile";

type RoleProtectedRouteProps = {
  allowedRole: "ORGANIZER" | "CUSTOMER";
};

export default function RoleProtectedRoute({
  allowedRole,
}: RoleProtectedRouteProps) {
  const token = localStorage.getItem("accessToken");
  const { data: user, isPending, isError } = useProfile();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isPending) {
    return <p className="p-6">Memeriksa akses...</p>;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === "CUSTOMER") {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/organizer/dashboard" replace />;
    }
  }

  return <Outlet />;
}
