"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from "@cpamarket/ui";
import { resetPasswordAction } from "./actions";

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage({ params }: { params: { locale: string } }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (values: FormValues) => {
    if (!token) {
      pushToast({ title: "Error", description: "Reset token missing", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        await resetPasswordAction(params.locale, { token, password: values.password });
        pushToast({ title: "Password updated", description: "You can now sign in", variant: "success" });
        router.push(`/${params.locale}/auth/login`);
      } catch (error: any) {
        pushToast({
          title: "Error",
          description: error.message ?? "Failed to reset password",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
      <Card className="w-full max-w-md border border-slate-200 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">
            {t("auth.resetPasswordTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "..." : t("auth.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
