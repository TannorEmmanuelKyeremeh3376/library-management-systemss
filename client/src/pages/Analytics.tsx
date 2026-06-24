import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Analytics() {
  const { data: mostBorrowedBooks } = trpc.analytics.getMostBorrowedBooks.useQuery({ limit: 10 });
  const { data: mostActiveMembers } = trpc.analytics.getMostActiveMembers.useQuery({ limit: 10 });
  const { data: monthlyTrends } = trpc.analytics.getMonthlyTrends.useQuery();

  const booksChartData = mostBorrowedBooks?.map(book => ({
    name: book.title,
    borrows: book.borrowCount,
  })) || [];

  const membersChartData = mostActiveMembers?.map(member => ({
    name: `${member.firstName} ${member.lastName}`,
    borrows: member.borrowCount,
  })) || [];

  const trendsChartData = monthlyTrends?.map(trend => ({
    month: trend.month,
    borrows: trend.borrowCount,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Analytics & Reports</h1>
        <p className="text-muted mt-2">Library borrowing insights and trends</p>
      </div>

      {/* Most Borrowed Books */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Most Borrowed Books</h2>
        <Card className="p-6">
          {booksChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={booksChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="borrows" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Most Active Members */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Most Active Members</h2>
        <Card className="p-6">
          {membersChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={membersChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="borrows" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Monthly Borrowing Trends */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Monthly Borrowing Trends</h2>
        <Card className="p-6">
          {trendsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="borrows" stroke="#8884D8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted">
              No data available
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
