"use client";

import { useId, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const WEEKS_PER_MONTH = 4.33;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  format,
  prefix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  format: (value: number) => React.ReactNode;
  prefix?: string;
}) {
  const id = useId();
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-[30px]">
      <div className="mb-3.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[15px] font-semibold text-ink-2">
          {label}
        </label>
        <output htmlFor={id} className="font-serif text-[22px] leading-none font-bold text-brand-hot">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="sfo-range"
        style={{
          background: `linear-gradient(90deg, #e6116b 0%, #ff3d8b ${percent}%, #f4d5e2 ${percent}%, #f4d5e2 100%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-xs text-grey">
        <span>
          {prefix}
          {min}
        </span>
        <span>
          {prefix}
          {max}
        </span>
      </div>
    </div>
  );
}

export function EarningsCalculator() {
  const [photos, setPhotos] = useState(10);
  const [price, setPrice] = useState(5);
  const weekly = photos * price;
  const monthly = Math.round(weekly * WEEKS_PER_MONTH);

  return (
    <section
      id="calculator"
      className="bg-[radial-gradient(1000px_360px_at_50%_-10%,rgba(255,61,139,.08),transparent_60%),linear-gradient(180deg,#fff_0%,#fff7fb_100%)] px-3.5 py-12 sm:px-5 md:py-20"
    >
      <div className="mx-auto max-w-[760px]">
        <SectionHeading
          badge="Earnings calculator"
          title={
            <>
              See what you could <em>earn</em>
            </>
          }
          subtitle="Drag the sliders to estimate your potential income. Just a guide — your real results depend on effort and consistency."
          className="mb-9 md:mb-11"
        />

        <div className="rounded-[18px] border border-line-2 bg-white px-5 py-6 shadow-[0_18px_40px_rgba(230,17,107,.08)] sm:rounded-[22px] sm:p-[34px]">
          <Slider label="Photos per week" value={photos} min={1} max={50} onChange={setPhotos} format={(v) => v} />
          <Slider
            label="Price per photo"
            value={price}
            min={1}
            max={50}
            onChange={setPrice}
            prefix="$"
            format={(v) => (
              <>
                <span className="text-base">$</span>
                {v}
              </>
            )}
          />

          <div className="mt-[30px] grid grid-cols-1 gap-4 sm:grid-cols-2" aria-live="polite">
            <div className="rounded-2xl border border-line-2 bg-[#fff9fc] px-5 py-[22px] text-center">
              <div className="mb-2 text-xs font-bold tracking-[0.8px] text-grey uppercase">Per week</div>
              <div className="font-serif text-[clamp(28px,5vw,38px)] leading-none font-bold text-brand-hot">
                {money.format(weekly)}
              </div>
            </div>
            <div className="bg-gradient-brand rounded-2xl px-5 py-[22px] text-center shadow-[0_14px_30px_rgba(230,17,107,.30)]">
              <div className="mb-2 text-xs font-bold tracking-[0.8px] text-white/85 uppercase">Per month</div>
              <div className="font-serif text-[clamp(28px,5vw,38px)] leading-none font-bold text-white">
                {money.format(monthly)}
              </div>
            </div>
          </div>

          <p className="mx-auto mt-[22px] max-w-[520px] text-center text-[12.5px] leading-relaxed text-[#999]">
            Estimates are illustrative and not a guarantee of income. Monthly figures assume roughly 4.33 weeks per
            month.
          </p>
        </div>
      </div>
    </section>
  );
}
