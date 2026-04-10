"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/(?=.*[A-Z])(?=.*\d)/, "Password must include an uppercase letter and number"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (data: RegisterValues) => void;
  submitting?: boolean;
}) {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password", "");
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthClass = ["w-0", "w-1/4", "w-2/4", "w-3/4", "w-full"][strength];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          placeholder="Name"
          className="w-full rounded-lg border border-border bg-card px-3 py-2"
          {...register("name")}
        />
        {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name.message}</p> : null}
      </div>
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
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 ${strengthClass}`} />
        </div>
        {errors.password ? (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
      >
        {submitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
