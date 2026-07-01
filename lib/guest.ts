const GUEST_NAME_KEY = "veview_guest_name";

export function getGuestDisplayName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_NAME_KEY);
}

export function setGuestDisplayName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_NAME_KEY, name);
}
