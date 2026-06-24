import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function MemberDetail() {
  const [, params] = useRoute("/members/:id");
  const [, navigate] = useLocation();
  const memberId = params?.id ? Number(params.id) : null;

  const { data: member, isLoading } = trpc.members.getById.useQuery(
    { id: memberId! },
    { enabled: !!memberId }
  );

  const { data: history } = trpc.members.getHistory.useQuery(
    { memberId: memberId! },
    { enabled: !!memberId }
  );

  if (!memberId) {
    return <div className="text-center py-8">Member not found</div>;
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading member details...</div>;
  }

  if (!member) {
    return <div className="text-center py-8">Member not found</div>;
  }

  const borrowCount = history?.length || 0;
  const activeLoans = history?.filter((h: any) => h.status === "active").length || 0;
  const returnedLoans = history?.filter((h: any) => h.status === "returned").length || 0;
  const overdueLoans = history?.filter((h: any) => h.status === "overdue").length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/members")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Members
        </Button>
      </div>

      {/* Member Details */}
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {member.firstName} {member.lastName}
              </h1>
              <p className="text-lg text-muted">Member ID: {member.memberId}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted">Email</p>
                <p className="text-lg">{member.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Phone</p>
                <p className="text-lg">{member.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Join Date</p>
                <p className="text-lg">{new Date(member.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Status</p>
                <p className={`text-lg font-semibold ${member.status === "active" ? "text-green-600" : "text-red-600"}`}>
                  {member.status}
                </p>
              </div>
            </div>

            {member.address && (
              <div>
                <p className="text-sm text-muted">Address</p>
                <p className="text-foreground">{member.address}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-muted/30 p-6 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-muted">Total Borrows</p>
                <p className="text-3xl font-bold text-foreground">{borrowCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Active Loans</p>
                <p className="text-3xl font-bold text-blue-600">{activeLoans}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Returned</p>
                <p className="text-3xl font-bold text-green-600">{returnedLoans}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{overdueLoans}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Borrowing History */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Borrowing History</h2>
        <div className="overflow-x-auto">
          <table className="table-refined">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history && history.length > 0 ? (
                history.map((record: any) => (
                  <tr key={record.id}>
                    <td className="font-medium">{record.bookTitle}</td>
                    <td>{record.bookAuthor}</td>
                    <td>{new Date(record.borrowDate).toLocaleDateString()}</td>
                    <td>{new Date(record.dueDate).toLocaleDateString()}</td>
                    <td>{record.returnDate ? new Date(record.returnDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className={`badge-${record.status === "returned" ? "success" : record.status === "overdue" ? "danger" : "warning"}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted">
                    No borrowing history
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
