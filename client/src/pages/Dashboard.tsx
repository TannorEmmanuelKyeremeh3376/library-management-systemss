import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { AlertCircle, BookOpen, Users, Clock, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: alerts, isLoading: alertsLoading } = trpc.dashboard.getOverdueAlerts.useQuery();
  const { data: activity } = trpc.dashboard.getRecentActivity.useQuery();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted">Welcome to your Library Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Books Stat */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">total books</p>
              <p className="stat-value">
                {statsLoading ? "—" : stats?.totalBooks || 0}
              </p>
            </div>
            <BookOpen className="w-12 h-12 text-accent/20" />
          </div>
        </div>

        {/* Active Borrows Stat */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">active borrows</p>
              <p className="stat-value">
                {statsLoading ? "—" : stats?.activeBorrows || 0}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500/20" />
          </div>
        </div>

        {/* Overdue Items Stat */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">overdue items</p>
              <p className="stat-value text-red-600">
                {statsLoading ? "—" : stats?.overdueItems || 0}
              </p>
            </div>
            <Clock className="w-12 h-12 text-red-500/20" />
          </div>
        </div>

        {/* Registered Members Stat */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">registered members</p>
              <p className="stat-value">
                {statsLoading ? "—" : stats?.registeredMembers || 0}
              </p>
            </div>
            <Users className="w-12 h-12 text-green-500/20" />
          </div>
        </div>
      </div>

      {/* Overdue Alerts */}
      {!alertsLoading && alerts && alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Overdue Alerts</h2>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} className="border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-400">
                  Book ID {alert.bookId} borrowed by Member ID {alert.memberId} is overdue since{" "}
                  {new Date(alert.dueDate).toLocaleDateString()}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activity && activity.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {activity.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {transaction.type.replace("_", " ")}
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-muted mt-1">{transaction.description}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
