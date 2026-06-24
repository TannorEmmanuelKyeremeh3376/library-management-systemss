import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Edit2, History } from "lucide-react";
import { toast } from "sonner";

const memberFormSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

export default function Members() {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const { data: members, isLoading, refetch } = trpc.members.list.useQuery();
  const { data: history } = trpc.members.getHistory.useQuery(
    { memberId: selectedMemberId! },
    { enabled: !!selectedMemberId }
  );

  const addMutation = trpc.members.add.useMutation({
    onSuccess: () => {
      toast.success("Member registered successfully");
      refetch();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to register member");
    },
  });

  const updateMutation = trpc.members.update.useMutation({
    onSuccess: () => {
      toast.success("Member updated successfully");
      refetch();
      setIsOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member");
    },
  });

  const deleteMutation = trpc.members.delete.useMutation({
    onSuccess: () => {
      toast.success("Member deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete member");
    },
  });

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema) as any,
    defaultValues: {
      memberId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = (values: MemberFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...values });
    } else {
      addMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Members</h1>
          <p className="text-muted mt-2">Manage library members</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Register Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Member" : "Register New Member"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <textarea className="input-refined" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Update" : "Register"} Member
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="table-refined">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted">
                    Loading members...
                  </td>
                </tr>
              ) : members && members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.id}>
                    <td className="font-mono text-sm">{member.memberId}</td>
                    <td className="font-medium">
                      <button
                        onClick={() => navigate(`/members/${member.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        {member.firstName} {member.lastName}
                      </button>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.phone || "—"}</td>
                    <td>{new Date(member.joinDate).toLocaleDateString()}</td>
                    <td>
                      <span className={member.status === "active" ? "badge-success" : "badge-warning"}>
                        {member.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMemberId(member.id)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(member.id);
                            form.reset({
                              memberId: member.memberId,
                              firstName: member.firstName,
                              lastName: member.lastName,
                              email: member.email,
                              phone: member.phone || undefined,
                              address: member.address || undefined,
                            });
                            setIsOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this member?")) {
                              deleteMutation.mutate({ id: member.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Borrowing History */}
      {selectedMemberId && history && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Borrowing History</h2>
            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">{record.bookTitle}</p>
                      <p className="text-sm text-muted">{record.bookAuthor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{record.status}</p>
                      <p className="text-xs text-muted">
                        Due: {new Date(record.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-4">No borrowing history</p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
