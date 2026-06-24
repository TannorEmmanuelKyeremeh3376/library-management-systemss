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
import { Plus, Search, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().min(1, "ISBN is required"),
  genre: z.string().min(1, "Genre is required"),
  category: z.string().min(1, "Category is required"),
  publisher: z.string().optional(),
  publishedYear: z.coerce.number().optional(),
  totalCopies: z.coerce.number().int().positive().default(1),
  description: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export default function Books() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [category, setCategory] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: books, isLoading, refetch } = trpc.books.list.useQuery({
    search,
    genre,
    category,
  });

  const addMutation = trpc.books.add.useMutation({
    onSuccess: () => {
      toast.success("Book added successfully");
      refetch();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add book");
    },
  });

  const updateMutation = trpc.books.update.useMutation({
    onSuccess: () => {
      toast.success("Book updated successfully");
      refetch();
      setIsOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update book");
    },
  });

  const deleteMutation = trpc.books.delete.useMutation({
    onSuccess: () => {
      toast.success("Book deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete book");
    },
  });

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema) as any,
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      genre: "",
      category: "",
      totalCopies: 1,
    },
  });

  const onSubmit = (values: BookFormValues) => {
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
          <h1 className="text-4xl font-bold text-foreground">Books</h1>
          <p className="text-muted mt-2">Manage your library catalog</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Book" : "Add New Book"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isbn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISBN</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalCopies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Copies</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="publisher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publisher</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="publishedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Published Year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea className="input-refined min-h-24" {...field} />
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
                    {editingId ? "Update" : "Add"} Book
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Input
            placeholder="Filter by genre..."
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder="Filter by category..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      {/* Books Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="table-refined">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Genre</th>
                <th>Category</th>
                <th>Copies</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted">
                    Loading books...
                  </td>
                </tr>
              ) : books && books.length > 0 ? (
                books.map((book) => (
                  <tr key={book.id}>
                    <td className="font-medium">
                      <button
                        onClick={() => navigate(`/books/${book.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        {book.title}
                      </button>
                    </td>
                    <td>{book.author}</td>
                    <td className="font-mono text-sm">{book.isbn}</td>
                    <td>{book.genre}</td>
                    <td>{book.category}</td>
                    <td className="text-center">{book.totalCopies}</td>
                    <td className="text-center">
                      <span className={book.availableCopies > 0 ? "badge-success" : "badge-danger"}>
                        {book.availableCopies}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(book.id);
                            form.reset({
                              title: book.title,
                              author: book.author,
                              isbn: book.isbn,
                              genre: book.genre,
                              category: book.category,
                              publisher: book.publisher || undefined,
                              publishedYear: book.publishedYear || undefined,
                              totalCopies: book.totalCopies,
                              description: book.description || undefined,
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
                            if (confirm("Are you sure you want to delete this book?")) {
                              deleteMutation.mutate({ id: book.id });
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
                  <td colSpan={8} className="text-center py-8 text-muted">
                    No books found
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
