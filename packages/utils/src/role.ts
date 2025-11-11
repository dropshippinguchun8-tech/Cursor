export type UserRole = "admin" | "operator" | "targetolog" | "advertiser" | "affiliate";

export const roleLabels: Record<UserRole, { uz: string; ru: string; en: string }> = {
  admin: { uz: "Administrator", ru: "Администратор", en: "Administrator" },
  operator: { uz: "Operator", ru: "Оператор", en: "Operator" },
  targetolog: { uz: "Targetolog", ru: "Таргетолог", en: "Targetologist" },
  advertiser: { uz: "Reklamachi", ru: "Рекламодатель", en: "Advertiser" },
  affiliate: { uz: "Affiliate", ru: "Партнер", en: "Affiliate" }
};

export const userRoleHierarchy: UserRole[] = ["admin", "operator", "targetolog", "advertiser", "affiliate"];

export function canManage(actor: UserRole, target: UserRole): boolean {
  const actorIndex = userRoleHierarchy.indexOf(actor);
  const targetIndex = userRoleHierarchy.indexOf(target);
  return actorIndex !== -1 && targetIndex !== -1 && actorIndex <= targetIndex;
}
