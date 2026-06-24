import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function BookDetail() {
  const [, params] = useRoute("/books/:id");
  const [, navigate] = useLocation();
  const bookId = params?.id ? Number(params.id) : null;

  const { data: book, isLoading } = trpc.books.getById.useQuery(
    { id: bookId! },
    { enabled: !!bookId }
  );

  const { data: borrowHistory } = trpc.books.getHistory.useQuery(
    { bookId: bookId! },
    { enabled: !!bookId }
  );

  if (!bookId) {
    return <div className="text-center py-8">Book not found</div>;
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading book details...</div>;
  }

  if (!book) {
    return <div className="text-center py-8">Book not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/books")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Books
        </Button>
      </div>

      {/* Book Details */}
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{book.title}</h1>
              <p className="text-lg text-muted">by {book.author}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted">ISBN</p>
                <p className="font-mono text-lg">{book.isbn}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Genre</p>
                <p className="text-lg">{book.genre}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Category</p>
                <p className="text-lg">{book.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Published</p>
                <p className="text-lg">{book.publishedYear || "N/A"}</p>
              </div>
            </div>

            {book.description && (
              <div>
                <p className="text-sm text-muted mb-2">Description</p>
                <p className="text-foreground leading-relaxed">{book.description}</p>
              </div>
            )}

            {book.publisher && (
              <div>
                <p className="text-sm text-muted">Publisher</p>
                <p className="text-foreground">{book.publisher}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-muted/30 p-6 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-muted">Total Copies</p>
                <p className="text-3xl font-bold text-foreground">{book.totalCopies}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Available Copies</p>
                <p className={`text-3xl font-bold ${book.availableCopies > 0 ? "text-green-600" : "text-red-600"}`}>
                  {book.availableCopies}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">Borrowed Copies</p>
                <p className="text-3xl font-bold text-foreground">{book.totalCopies - book.availableCopies}</p>
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
                <th>Member</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {borrowHistory && borrowHistory.length > 0 ? (
                borrowHistory.map((record: any) => (
                  <tr key={record.id}>
                    <td className="font-medium">{record.memberName}</td>
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
                  <td colSpan={5} className="text-center py-8 text-muted">
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
