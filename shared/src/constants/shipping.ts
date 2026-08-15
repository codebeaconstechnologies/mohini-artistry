/** All monetary constants are in paise (INR x 100). */
export const FREE_SHIPPING_THRESHOLD_PAISE = 199_900; // > ₹1999
export const FIRST_ORDER_FREE_SHIPPING_THRESHOLD_PAISE = 50_000; // > ₹500, first order only
export const STANDARD_SHIPPING_FEE_PAISE = 7_900; // ₹79 flat

export const INDIAN_STATES = [
  "Maharashtra",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
] as const;

export const DEFAULT_STATE = "Maharashtra";

export const MAHARASHTRA_CITIES = [
  "Pune",
  "Mumbai",
  "Nagpur",
  "Nashik",
  "Thane",
  "Aurangabad (Chhatrapati Sambhajinagar)",
  "Solapur",
  "Kolhapur",
  "Amravati",
  "Navi Mumbai",
  "Satara",
  "Sangli",
];
