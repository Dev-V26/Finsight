import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AppShell from "../components/layout/AppShell";
import { Card, CardContent } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";

export default function ProtectedRoute() {
  // Support both `loading` and `authLoading` naming (backend logic unchanged)
  const { loading, authLoading, isAuthenticated } = useAuth();
  const isLoading = Boolean(loading ?? authLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return isAuthenticated ? (
    <AppShell>
      <Outlet />
    </AppShell>
  ) : (
    <Navigate to="/login" replace />
  );
}
