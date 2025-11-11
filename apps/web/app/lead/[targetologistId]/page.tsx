import { Suspense } from "react";
import { ReferralLeadForm } from "./referral-form";

export const dynamic = "force-dynamic";

export default function ReferralLandingPage({ params }: { params: { targetologistId: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">CPAMaRKeT Lead Form</h1>
          <p className="text-sm text-slate-600">
            Fill in your contact details and we will call you shortly.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-sm text-slate-500">Loading...</div>}>
          <ReferralLeadForm targetologistId={params.targetologistId} />
        </Suspense>
      </div>
    </main>
  );
}
