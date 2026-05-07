// Type re-exports for backward compatibility.
// All real data now comes from the database via server actions.
export type { Lead, Deal, Listing, Contact, Task } from "@/lib/store";

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";
export type LeadSource = "Website" | "Referral" | "Zillow" | "Facebook" | "Instagram" | "Walk-in";

// Reference data used by the dashboard chart (12-month synthetic series).
export const overviewChart = [
  { label: "Jan", primary: 18, secondary: 8 },
  { label: "Feb", primary: 22, secondary: 11 },
  { label: "Mar", primary: 30, secondary: 14 },
  { label: "Apr", primary: 28, secondary: 16 },
  { label: "May", primary: 38, secondary: 21 },
  { label: "Jun", primary: 45, secondary: 25 },
  { label: "Jul", primary: 52, secondary: 30 },
  { label: "Aug", primary: 48, secondary: 28 },
  { label: "Sep", primary: 60, secondary: 34 },
  { label: "Oct", primary: 65, secondary: 39 },
  { label: "Nov", primary: 70, secondary: 41 },
  { label: "Dec", primary: 78, secondary: 46 },
];
