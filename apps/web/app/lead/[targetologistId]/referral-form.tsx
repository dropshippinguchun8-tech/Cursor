"use client";

import { useState, useTransition } from "react";
import { useToast, Button } from "@cpamarket/ui";
import { clientApiFetch } from "../../../src/lib/api";

type Props = {
  targetologistId: string;
};

export function ReferralLeadForm({ targetologistId }: Props) {
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: ""
  });

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        await clientApiFetch("/api/leads", {
          method: "POST",
          body: JSON.stringify({
            targetologistId,
            customerName: form.customerName,
            customerPhone: form.customerPhone,
            customerEmail: form.customerEmail || undefined
          })
        });
        pushToast({
          title: "Thank you!",
          description: "Your request has been received.",
          variant: "success"
        });
        setForm({ customerName: "", customerPhone: "", customerEmail: "" });
      } catch (error: any) {
        pushToast({
          title: "Error",
          description: error?.message ?? "Failed to submit lead",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Full name</label>
        <input
          required
          value={form.customerName}
          onChange={handleChange("customerName")}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Phone number</label>
        <input
          required
          value={form.customerPhone}
          onChange={handleChange("customerPhone")}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email (optional)</label>
        <input
          type="email"
          value={form.customerEmail}
          onChange={handleChange("customerEmail")}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "..." : "Submit"}
      </Button>
    </form>
  );
}
