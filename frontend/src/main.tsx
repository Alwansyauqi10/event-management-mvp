import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "sonner";

import "./index.css";

import MainLayout from "./layouts/MainLayout";
import OrganizerLayout from "./layouts/OrganizerLayout";

import EventDetailPage from "./pages/EventDetail";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PointHistoryPage from "./pages/PointHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import OrganizerDashboardPage from "./pages/OrganizerDashboardPage";

import CreateEventPage from "./pages/CreateEventPage";
import OrganizerTransactionDetailPage from "./pages/OrganizerTransactionDetailPage";
import OrganizerTransactionsPage from "./pages/OrganizerTransactionPage";

import RoleProtectedRoute from "./components/RoleProtectedRoute";
import OrganizerEventsPage from "./pages/OrganizerEventPage";
import OrganizerEventAttendeesPage from "./pages/OrganizerEventAttendeesPage";
import EditEventPage from "./pages/EditEventPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import CheckInPage from "./pages/CheckInPage";
import PaymentPage from "./pages/PaymentPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  // Halaman autentikasi
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
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
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },

      {
        element: <RoleProtectedRoute allowedRole="CUSTOMER" />,
        children: [
          {
            path: "/checkout",
            element: <CheckoutPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          {
            path: "/profile/points",
            element: <PointHistoryPage />,
          },
          {
            path: "/events/:id",
            element: <EventDetailPage />,
          },
          {
            path: "/payment/:transactionId",
            element: <PaymentPage />,
          },
          {
            path: "/transaction/history",
            element: <TransactionHistoryPage />,
          },
        ],
      },
    ],
  },

  {
    element: <RoleProtectedRoute allowedRole="ORGANIZER" />,
    children: [
      {
        element: <OrganizerLayout />,
        children: [
          {
            path: "/organizer/profile",
            element: <ProfilePage />,
          },
          {
            path: "/organizer/dashboard",
            element: <OrganizerDashboardPage />,
          },
          {
            path: "/organizer/events",
            element: <OrganizerEventsPage />,
          },
          {
            path: "/organizer/events/create",
            element: <CreateEventPage />,
          },
          {
            path: "/organizer/transactions",
            element: <OrganizerTransactionsPage />,
          },
          {
            path: "/organizer/transactions/:transactionId",
            element: <OrganizerTransactionDetailPage />,
          },
          {
            path: "/organizer/events/:eventId/attendees",
            element: <OrganizerEventAttendeesPage />,
          },
          {
            path: "/organizer/events/:eventId/check-in",
            element: <CheckInPage />,
          },
          {
            path: "/organizer/events/:eventId/edit",
            element: <EditEventPage />,
          },
        ],
      },
    ],
  },

  // Halaman tidak ditemukan
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  </StrictMode>,
);
