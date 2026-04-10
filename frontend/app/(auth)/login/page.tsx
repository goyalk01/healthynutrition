"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

const loginSchema = z.object({
  email: z.string().min(1, "ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [lastPayload, setLastPayload] = useState<LoginFormValues | null>(null);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/\d/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;
    return score;
  }, [passwordValue]);

  const strengthWidthClass = ["w-0", "w-1/4", "w-2/4", "w-3/4", "w-full"][passwordStrength];

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setHasNetworkError(false);
      setLastPayload(data);
      const response = await api.post("/auth/login", data);

      const { accessToken, user } = response.data.data;

      setAuth(accessToken, user);
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (error) {
      const err = error as {
        response?: {
          status?: number;
          data?: { error?: { message?: string } };
        };
      };

      const status = err.response?.status;
      const message = err.response?.data?.error?.message;

      if (!status) {
        setHasNetworkError(true);
        toast.error("Network timeout. Please retry.");
        return;
      }

      toast.error(message || "Invalid credentials");
    }
  };

  return (
    <div className="grid min-h-screen w-full bg-background lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#22d3ee,transparent_30%),radial-gradient(circle_at_80%_80%,#10b981,transparent_35%),linear-gradient(130deg,#05253f,#063451_60%,#064e3b)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.2em] backdrop-blur">
          NutriSense AI
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-3xl font-bold shadow-2xl backdrop-blur">
            NS
          </div>
          <h1 className="max-w-lg text-5xl font-semibold leading-tight">
            Precision nutrition that adapts to your daily life.
          </h1>
          <p className="mt-4 max-w-md text-cyan-50/90">
            Track meals, habits, and AI recommendations with a unified dashboard built for consistency.
          </p>
        </motion.div>
        <p className="text-sm text-cyan-100/80">Fuel better choices, one meal at a time.</p>
      </div>

      <div className="flex w-full items-center justify-center p-8 sm:p-12 lg:p-20">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card/70 p-8 shadow-xl backdrop-blur"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-foreground">Welcome back</h2>
            <p className="mt-1 text-muted-foreground">Sign in to continue your health streak.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                ID / Email
              </label>
              <input
                id="email"
                type="text"
                placeholder="Enter any ID"
                className={`w-full rounded-lg border bg-background/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.email ? "border-red-500" : "border-input"
                }`}
                {...register("email")}
              />
              {errors.email ? <p className="text-sm text-red-500">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border bg-background/50 px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errors.password ? "border-red-500" : "border-input"
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all ${strengthWidthClass}`} />
              </div>

              {errors.password ? <p className="text-sm text-red-500">{errors.password.message}</p> : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {hasNetworkError && lastPayload ? (
              <button
                type="button"
                onClick={() => void onSubmit(lastPayload)}
                className="w-full rounded-lg border border-border py-2 text-sm text-foreground hover:bg-muted"
              >
                Retry last attempt
              </button>
            ) : null}
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-cyan-500 hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
