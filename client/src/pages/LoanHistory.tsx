import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function LoanHistory() {
  const [search, setSearch] = useState("");

  const { data: loans, isLoading } = trpc.loans.list.useQuery({});

  const filteredLoans = loans?.filter(loan =>
    search === "" || 
    loan.id.toString().includes(search) ||
    loan.bookId.toString().includes(search) ||
    loan.memberId.toString().includes(search)
  ) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Loan History</h1>
        <p className="text-muted mt-2">Complete audit trail of all borrowing transactions</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input
          placeholder="Search by loan ID, book ID, or member ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loans Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="table-refined">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Book ID</th>
                <th>Member ID</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Overdue</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted">
                    Loading loan history...
                  </td>
                </tr>
              ) : filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="font-mono text-sm">#{loan.id}</td>
                    <td className="font-mono">{loan.bookId}</td>
                    <td className="font-mono">{loan.memberId}</td>
                    <td>{new Date(loan.borrowDate).toLocaleDateString()}</td>
                    <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className={`badge-${loan.status === "returned" ? "success" : loan.status === "overdue" ? "danger" : "warning"}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td>
                      <span className={loan.isOverdue ? "badge-danger" : "badge-success"}>
                        {loan.isOverdue ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted">
                    No loans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted mb-2">Total Loans</p>
          <p className="text-3xl font-bold text-foreground">{loans?.length || 0}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted mb-2">Active</p>
          <p className="text-3xl font-bold text-blue-600">{loans?.filter(l => l.status === "active").length || 0}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted mb-2">Returned</p>
          <p className="text-3xl font-bold text-green-600">{loans?.filter(l => l.status === "returned").length || 0}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted mb-2">Overdue</p>
          <p className="text-3xl font-bold text-red-600">{loans?.filter(l => l.isOverdue).length || 0}</p>
        </Card>
      </div>
    </div>
  );
}
