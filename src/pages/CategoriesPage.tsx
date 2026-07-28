import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { listCategories, createCategory } from "../services/categoryService";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { Category } from "../types";

const schema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export default function CategoriesPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string }>({ resolver: zodResolver(schema) });

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const onSubmit = async (data: { name: string }) => {
    await createCategory(data.name);
    reset();
    categoriesQuery.refetch();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-sky-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card title="Manage Categories">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-700">Category Name</span>
              <input
                {...register("name")}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              {errors.name && (
                <p className="mt-2 text-xs text-rose-500">
                  {errors.name.message}
                </p>
              )}
            </label>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Category"}
            </Button>
          </form>
        </Card>
        <Card title="Default Categories">
          <div className="space-y-3">
            {(categoriesQuery.data ?? []).map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 text-slate-900 shadow-soft"
              >
                <p>{category.name}</p>
                <div className="space-x-2 text-slate-500">
                  <button type="button">Edit</button>
                  <button type="button">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
