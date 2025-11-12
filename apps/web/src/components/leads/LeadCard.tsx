"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LeadListItem, LeadStatus, LeadStatusLog } from "../../types/leads";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from "@cpamarket/ui";
import { formatDistanceToNow } from "date-fns";

type TransitionAction = {
  status: LeadStatus;
  label?: string;
};

type LeadCardProps = {
  lead: LeadListItem;
  transitions?: TransitionAction[];
  onTransition?: (leadId: string, status: LeadStatus, comment: string) => Promise<void>;
  onClaim?: (leadId: string, comment: string) => Promise<void>;
  disableActions?: boolean;
  children?: React.ReactNode;
};

export function LeadCard({ lead, transitions = [], onTransition, onClaim, disableActions, children }: LeadCardProps) {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsSubmitting(true);
    try {
      await action();
      setComment("");
      pushToast({
        title: t("notifications.statusUpdated"),
        variant: "success"
      });
    } catch (error: any) {
      pushToast({
        title: t("notifications.error"),
        description: error?.message ?? "Unexpected error",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusLogs = (logs?: LeadStatusLog[]) => {
    if (!logs || logs.length === 0) {
      return <p className="text-sm text-slate-500">{t("empty.noData")}</p>;
    }

    return (
      <ol className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {log.previousStatus ? `${t(`status.${log.previousStatus}`)} → ` : ""}
                {t(`status.${log.newStatus}`)}
              </span>
              <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
            </div>
            <p className="mt-1 text-sm text-slate-700">{log.comment}</p>
            {log.user ? (
              <p className="mt-1 text-xs text-slate-400">
                {log.user.username} · {log.user.role}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    );
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">{lead.customerName}</CardTitle>
          <Badge variant="secondary">{t(`status.${lead.status}`)}</Badge>
        </div>
        <p className="text-sm text-slate-500">{lead.customerPhone}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
          {lead.customerEmail ? <div>{lead.customerEmail}</div> : null}
          {lead.product ? (
            <div>
              <span className="font-medium text-slate-700">{t("lead.product")}:</span> {lead.product.title}
            </div>
          ) : null}
          {lead.operator ? (
            <div>
              <span className="font-medium text-slate-700">{t("lead.operator")}:</span> {lead.operator.username}
            </div>
          ) : null}
          {lead.targetologist ? (
            <div>
              <span className="font-medium text-slate-700">{t("lead.targetologist")}:</span> {lead.targetologist.username}
            </div>
          ) : null}
          {lead.client ? (
            <div>
              <span className="font-medium text-slate-700">{t("lead.client")}:</span> {lead.client.username}
            </div>
          ) : null}
        </div>

        {onClaim || transitions.length > 0 ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor={`comment-${lead.id}`}>
              {t("lead.comment")}
            </label>
            <textarea
              id={`comment-${lead.id}`}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder={t("lead.addCommentPlaceholder")}
              disabled={disableActions}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {onClaim ? (
            <Button
              variant="secondary"
              disabled={disableActions || isSubmitting || comment.trim().length === 0}
              onClick={() =>
                handleAction(async () => {
                  if (!onClaim) return;
                  await onClaim(lead.id, comment.trim());
                })
              }
            >
              {t("lead.takeLead")}
            </Button>
          ) : null}

          {transitions.map((action) => (
            <Button
              key={action.status}
              disabled={disableActions || isSubmitting || comment.trim().length === 0 || !onTransition}
              onClick={() =>
                handleAction(async () => {
                  if (!onTransition) return;
                  await onTransition(lead.id, action.status, comment.trim());
                })
              }
            >
              {action.label ?? t(`status.${action.status}`)}
            </Button>
          ))}
        </div>

        {children}

        <div>
          <h4 className="text-sm font-semibold text-slate-700">{t("lead.statusHistory")}</h4>
          <div className="mt-2">{renderStatusLogs(lead.statusLogs)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
