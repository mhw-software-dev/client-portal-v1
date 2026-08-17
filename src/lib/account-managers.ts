export type AccountManagerContact = {
  email: string;
  phone: string;
  tel: string;
};

const ACCOUNT_MANAGER_CONTACTS: Record<string, AccountManagerContact> = {
  "tina brulport": {
    email: "tbrulport@mhwlivemusic.com",
    phone: "(305) 414-1309",
    tel: "+13054141309",
  },
};

export function getAccountManagerContact(
  accountManager?: string,
): AccountManagerContact | null {
  const normalizedName = accountManager?.trim().toLowerCase();

  if (!normalizedName) return null;

  return ACCOUNT_MANAGER_CONTACTS[normalizedName] ?? null;
}
