import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "./layouts/MainLayout";
import "./index.css";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import { Toaster } from "sonner";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EventDetailPage from "./pages/EventDetail";
import NotFoundPage from "./pages/NotFoundPage";
import PointHistoryPage from "./pages/PointHistoryPage";
import OrganizerDashboardPage from "./pages/OrganizerDashboardPage";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import OrganizerTransactionsPage from "./pages/OrganizerTransactionPage";
import OrganizerTransactionDetailPage from "./pages/OrganizerTransactionDetailPage";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/events/:id",
        element: <EventDetailPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          {
            path: "/profile/points",
            element: <PointHistoryPage />,
          },
        ],
      },
      {
        element: <RoleProtectedRoute allowedRole="ORGANIZER" />,
        children: [
          {
            path: "/organizer/dashboard",
            element: <OrganizerDashboardPage />,
          },
          {
            path: "/organizer/transactions",
            element: <OrganizerTransactionsPage />,
          },
          {
            path: "organizer/transactions/:transactionId",
            element: <OrganizerTransactionDetailPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/*",
    element: <NotFoundPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors></Toaster>
    </QueryClientProvider>
  </StrictMode>,
);
