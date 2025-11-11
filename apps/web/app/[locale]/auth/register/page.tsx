"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from "@cpamarket/ui";
import { registerAction } from "./actions";

const schema = z
  .object({
    username: z.string().min(3),
    fullName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    role: z.enum(["affiliate", "advertiser", "targetologist"])
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage({ params }: { params: { locale: string } }) {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "affiliate"
    }
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await registerAction(params.locale, {
          username: values.username,
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          role: values.role
        });
        pushToast({
          title: t("auth.registerTitle"),
          description: "Check your email to verify your account",
          variant: "success"
        });
        router.push(`/${params.locale}/auth/login`);
      } catch (error: any) {
        pushToast({
          title: "Error",
          description: error.message ?? "Registration failed",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
      <Card className="w-full max-w-xl border border-slate-200 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">{t("auth.registerTitle")}</CardTitle>
          <p className="text-sm text-slate-500">{t("common.brand")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-slate-700">Username</label>
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...form.register("username")}
              />
              {form.formState.errors.username ? (
                <p className="text-xs text-red-600">{form.formState.errors.username.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-slate-700">{t("auth.email")}</label>
              <input
                type="email"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-slate-700">{t("auth.password")}</label>
              <input
                type="password"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-slate-700">{t("auth.confirmPassword")}</label>
              <input
                type="password"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword ? (
                <p className="text-xs text-red-600">{form.formState.errors.confirmPassword.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...form.register("fullName")}
              />
              {form.formState.errors.fullName ? (
                <p className="text-xs text-red-600">{form.formState.errors.fullName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">{t("auth.role")}</label>
              <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...form.register("role")}
              >
                <option value="affiliate">Affiliate</option>
                <option value="advertiser">Advertiser</option>
                <option value="targetologist">Targetologist</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "..." : t("auth.submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
