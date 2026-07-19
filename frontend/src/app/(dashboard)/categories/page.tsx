"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  FolderTree,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import { inventoryApi, Category } from "@/features/inventory/api/inventoryApi";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

function CategoryTree({
  categories,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  level = 0,
}: {
  categories: Category[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  level?: number;
}) {
  return (
    <>
      {categories.map((cat) => (
        <div key={cat.id}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 border-b hover:bg-muted/50",
              level > 0 && "border-l-2 border-l-muted"
            )}
            style={{ paddingLeft: `${(level + 1) * 1.5}rem` }}
          >
            {cat.children && cat.children.length > 0 ? (
              <button
                onClick={() => onToggle(cat.id)}
                className="p-0.5 hover:bg-muted rounded"
              >
                {expanded.has(cat.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 font-medium">{cat.name}</span>
            <span className="text-sm text-muted-foreground">
              {cat.productCount} products
            </span>
            <Badge variant={cat.isActive ? "default" : "secondary"}>
              {cat.isActive ? "Active" : "Inactive"}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(cat)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(cat.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
          <AnimatePresence>
            {expanded.has(cat.id) && cat.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CategoryTree
                  categories={cat.children}
                  expanded={expanded}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  level={level + 1}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: inventoryApi.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: inventoryApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
      setDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      inventoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated");
      setDialogOpen(false);
      setEditingCategory(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", parentId: null, isActive: true },
  });

  const categories = categoriesData?.data?.results ?? [];
  const flatCategories = categories.reduce<Category[]>((acc, c) => {
    acc.push(c);
    if (c.children) acc.push(...c.children);
    return acc;
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditingCategory(null);
    reset({ name: "", description: "", parentId: null, isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      description: cat.description,
      parentId: cat.parentId,
      isActive: cat.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        action={{ label: "Add Category", icon: Plus, onClick: openCreate }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border bg-card"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
          <span className="w-5" />
          <span className="w-5" />
          <span className="flex-1">Name</span>
          <span className="w-24 text-right">Products</span>
          <span className="w-20">Status</span>
          <span className="w-20">Actions</span>
        </div>

        <CategoryTree
          categories={categories}
          expanded={expanded}
          onToggle={toggleExpand}
          onEdit={openEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
        />

        {categories.length === 0 && !isLoading && (
          <div className="px-4 py-12 text-center text-muted-foreground">
            No categories found
          </div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Category name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Optional description..." />
            </div>
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select
                value={watch("parentId") ?? "none"}
                onValueChange={(v) =>
                  setValue("parentId", v === "none" ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent (root category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent</SelectItem>
                  {flatCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
