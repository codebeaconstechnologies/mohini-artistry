import { useState, type ReactNode } from "react";
import type { ShippingAddressInput } from "@mohini-artistry/shared";
import { INDIAN_STATES, DEFAULT_STATE, MAHARASHTRA_CITIES } from "@mohini-artistry/shared";

const OTHER_CITY = "__other__";
const inputClass =
  "w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none";

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-teal">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export interface AddressFormProps {
  value: ShippingAddressInput;
  onChange: (value: ShippingAddressInput) => void;
  errors?: Partial<Record<keyof ShippingAddressInput, string>>;
}

export default function AddressForm({ value, onChange, errors }: AddressFormProps) {
  const isMaharashtra = value.state === DEFAULT_STATE;
  const isKnownCity = (MAHARASHTRA_CITIES as readonly string[]).includes(value.city);
  const [cityMode, setCityMode] = useState<"select" | "custom">(
    isMaharashtra && value.city !== "" && !isKnownCity ? "custom" : "select"
  );

  function set<K extends keyof ShippingAddressInput>(key: K, val: ShippingAddressInput[K]) {
    onChange({ ...value, [key]: val });
  }

  function handleStateChange(state: string) {
    onChange({ ...value, state, city: "" });
    setCityMode("select");
  }

  function handleCitySelect(selected: string) {
    if (selected === OTHER_CITY) {
      setCityMode("custom");
      set("city", "");
    } else {
      setCityMode("select");
      set("city", selected);
    }
  }

  return (
    <div className="space-y-4">
      <Field label="Full name" error={errors?.fullName}>
        <input type="text" autoComplete="name" value={value.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputClass} />
      </Field>
      <Field label="Phone" error={errors?.phone}>
        <input
          type="tel"
          autoComplete="tel"
          placeholder="10-digit mobile number"
          value={value.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Address line 1" error={errors?.address1}>
        <input
          type="text"
          autoComplete="address-line1"
          value={value.address1}
          onChange={(e) => set("address1", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Address line 2 (optional)">
        <input
          type="text"
          autoComplete="address-line2"
          value={value.address2 ?? ""}
          onChange={(e) => set("address2", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="State" error={errors?.state}>
          <select value={value.state} onChange={(e) => handleStateChange(e.target.value)} className={inputClass}>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="City" error={errors?.city}>
          {isMaharashtra ? (
            cityMode === "select" ? (
              <select value={value.city} onChange={(e) => handleCitySelect(e.target.value)} className={inputClass}>
                <option value="" disabled>
                  Select a city
                </option>
                {MAHARASHTRA_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value={OTHER_CITY}>Other…</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={value.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={inputClass}
                  placeholder="Enter your city"
                />
                <button type="button" onClick={() => setCityMode("select")} className="shrink-0 text-xs font-medium text-turquoise underline">
                  Pick from list
                </button>
              </div>
            )
          ) : (
            <input
              type="text"
              value={value.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputClass}
              placeholder="Enter your city"
            />
          )}
        </Field>
      </div>

      <Field label="Pincode" error={errors?.pincode}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={value.pincode}
          onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
          className={inputClass}
        />
      </Field>
    </div>
  );
}
