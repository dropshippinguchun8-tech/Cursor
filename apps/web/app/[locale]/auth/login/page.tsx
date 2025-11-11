"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from "@cpamarket/ui";
import { loginAction } from "./actions";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage({ params }: { params: { locale: string } }) {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const { t } = useTranslation();
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await loginAction(params.locale, values);
        pushToast({ title: t("auth.loginTitle"), description: "Success", variant: "success" });
        router.push(`/${params.locale}/dashboard`);
      } catch (error: any) {
        pushToast({
          title: "Error",
          description: error.message ?? "Login failed",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
      <Card className="w-full max-w-md border border-slate-200 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">{t("auth.loginTitle")}</CardTitle>
          <p className="text-sm text-slate-500">{t("common.brand")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{t("auth.email")}</label>
              <input
                type="email"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...register("email")}
              />
              {formState.errors.email ? (
                <p className="text-xs text-red-600">{formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{t("auth.password")}</label>
              <input
                type="password"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...register("password")}
              />
              {formState.errors.password ? (
                <p className="text-xs text-red-600">{formState.errors.password.message}</p>
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
