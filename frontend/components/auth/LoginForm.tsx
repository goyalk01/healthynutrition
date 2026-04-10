"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (data: LoginValues) => void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-border bg-card px-3 py-2"
          {...register("email")}
        />
        {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email.message}</p> : null}
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-border bg-card px-3 py-2"
          {...register("password")}
        />
        {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password.message}</p> : null}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
