import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const borrowFormSchema = z.object({
  bookId: z.string().min(1, "Book is required").transform(v => Number(v)),
  memberId: z.string().min(1, "Member is required").transform(v => Number(v)),
  dueDate: z.string().min(1, "Due date is required"),
});

type BorrowFormValues = {
  bookId: number;
  memberId: number;
  dueDate: string;
};

export default function Borrowing() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: loans, isLoading, refetch } = trpc.loans.list.useQuery({});
  const { data: books } = trpc.books.list.useQuery({});
  const { data: members } = trpc.members.list.useQuery();

  const borrowMutation = trpc.loans.create.useMutation({
    onSuccess: () => {
      toast.success("Book borrowed successfully");
      refetch();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to borrow book");
    },
  });

  const returnMutation = trpc.loans.return.useMutation({
    onSuccess: () => {
      toast.success("Book returned successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to return book");
    },
  });

  const form = useForm<BorrowFormValues>({
    resolver: zodResolver(borrowFormSchema) as any,
    defaultValues: {
      bookId: 0,
      memberId: 0,
      dueDate: "",
    },
  });

  const onSubmit = (values: any) => {
    borrowMutation.mutate({
      bookId: Number(values.bookId),
      memberId: Number(values.memberId),
      dueDate: values.dueDate,
    });
  };

  const activeLoans = loans?.filter(loan => loan.status === "active") || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Borrowing System</h1>
          <p className="text-muted mt-2">Manage book checkouts and returns</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Checkout Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Checkout Book</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="bookId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book</FormLabel>
                      <FormControl>
                        <select className="input-refined" {...field}>
                          <option value="">Select a book</option>
                          {books?.map((book) => (
                            <option key={book.id} value={book.id}>
                              {book.title} ({book.availableCopies} available)
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member</FormLabel>
                      <FormControl>
                        <select className="input-refined" {...field}>
                          <option value="">Select a member</option>
                          {members?.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.firstName} {member.lastName}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <input type="date" className="input-refined" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={borrowMutation.isPending}>
                    Checkout
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Loans */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Active Loans</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="table-refined">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted">
                      Loading loans...
                    </td>
                  </tr>
                ) : activeLoans.length > 0 ? (
                  activeLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="font-medium">Book ID: {loan.bookId}</td>
                      <td>Member ID: {loan.memberId}</td>
                      <td>{new Date(loan.borrowDate).toLocaleDateString()}</td>
                      <td>
                        <span className={loan.isOverdue ? "badge-danger" : "badge-success"}>
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className={loan.status === "active" ? "badge-success" : "badge-warning"}>
                          {loan.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Mark this book as returned?")) {
                              returnMutation.mutate({ loanId: loan.id });
                            }
                          }}
                          disabled={returnMutation.isPending}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted">
                      No active loans
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
