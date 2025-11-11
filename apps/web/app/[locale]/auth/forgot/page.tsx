"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from "@cpamarket/ui";
import { forgotPasswordAction } from "./actions";

const schema = z.object({
  email: z.string().email()
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema)
  });
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await forgotPasswordAction(params.locale, values.email);
        pushToast({
          title: t("auth.resetPasswordTitle"),
          description: "Check your inbox for reset instructions",
          variant: "success"
        });
      } catch (error: any) {
        pushToast({
          title: "Error",
          description: error.message ?? "Failed to send reset email",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
      <Card className="w-full max-w-md border border-slate-200 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">{t("auth.forgotPassword")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "..." : t("auth.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
