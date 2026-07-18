"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Package,
  AlertTriangle,
  XCircle,
  Pencil,
  Trash2,
  Filter,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/layout/DataTable";
import StatsCard from "@/components/shared/StatsCard";
import {
  inventoryApi,
  Product,
} from "@/features/inventory/api/inventoryApi";
import { cn, formatCurrency } from "@/lib/utils";
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
import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  unitPrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0),
  maxStock: z.coerce.number().min(0),
  barcode: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

function getStockBadge(stock: number, minStock: number) {
  if (stock === 0)
    return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
  if (stock <= minStock)
    return (
      <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    );
  return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", search, categoryFilter],
    queryFn: () =>
      inventoryApi.getProducts({
        perPage: 100,
        search,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: inventoryApi.getCategories,
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: inventoryApi.getBrands,
  });

  const createMutation = useMutation({
    mutationFn: inventoryApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created");
      setDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to create product"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      inventoryApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated");
      setDialogOpen(false);
      setEditingProduct(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      unitPrice: 0,
      costPrice: 0,
      minStock: 0,
      maxStock: 100,
    },
  });

  const products = productsData?.data?.data ?? [];
  const totalProducts = productsData?.data?.total ?? products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= p.minStock
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const categoryList = categories?.data ?? [];

  const openCreate = () => {
    setEditingProduct(null);
    reset({
      name: "",
      sku: "",
      description: "",
      categoryId: "",
      brandId: "",
      unitPrice: 0,
      costPrice: 0,
      minStock: 0,
      maxStock: 100,
      barcode: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku,
      description: product.description,
      categoryId: product.categoryId,
      brandId: product.brandId,
      unitPrice: product.unitPrice,
      costPrice: product.costPrice,
      minStock: product.minStock,
      maxStock: product.maxStock,
      barcode: product.barcode,
      isActive: product.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: data as any });
    } else {
      createMutation.mutate(data as any);
    }
  };

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "categoryName", header: "Category" },
    {
      accessorKey: "unitPrice",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-mono">
          {formatCurrency(row.original.unitPrice)}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => getStockBadge(row.original.stock, row.original.minStock),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => openEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => deleteMutation.mutate(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        action={{ label: "Add Product", icon: Plus, onClick: openCreate }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <StatsCard title="Total Products" value={totalProducts} icon={Package} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatsCard title="Active" value={activeCount} icon={Package} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatsCard title="Low Stock" value={lowStockCount} icon={AlertTriangle} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatsCard title="Out of Stock" value={outOfStockCount} icon={XCircle} />
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryList.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-40 bg-muted/30 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-muted-foreground/50" />
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>
                      {getStockBadge(product.stock, product.minStock)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-semibold">
                        {formatCurrency(product.unitPrice)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(product.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {products.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No products found
            </div>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DataTable
            columns={columns}
            data={products}
            searchValue={search}
            onSearchChange={setSearch}
            isLoading={isLoading}
          />
        </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...register("name")} placeholder="Product name" />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input {...register("sku")} placeholder="e.g. PROD-001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Product description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={watch("categoryId")}
                  onValueChange={(v) => setValue("categoryId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryList.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select
                  value={watch("brandId") || "none"}
                  onValueChange={(v) =>
                    setValue("brandId", v === "none" ? "" : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {(brands?.data ?? []).map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("unitPrice")}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("costPrice")}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Stock</Label>
                <Input type="number" {...register("minStock")} />
              </div>
              <div className="space-y-2">
                <Label>Max Stock</Label>
                <Input type="number" {...register("maxStock")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input {...register("barcode")} placeholder="Optional barcode" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? "Update" : "Create"} Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
