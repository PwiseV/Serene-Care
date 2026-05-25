"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface Specialty {
  _id: string;
  name: string;
}

interface Props {
  specialties: Specialty[];
}

export default function DoctorSearchForm({ specialties }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/doctors?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className={`flex flex-col md:flex-row gap-3 transition-opacity ${isPending ? "opacity-60" : ""}`}>
      <div className="flex-1 flex items-center gap-3 bg-surface-container-low px-4 rounded-xl border border-outline-variant/30 focus-within:border-primary transition-colors">
        <span className="material-symbols-outlined text-outline">search</span>
        <input
          type="text"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Tìm theo tên bác sĩ..."
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-3 text-on-surface font-sans"
          onChange={(e) => updateFilter("search", e.target.value)}
        />
      </div>

      <select
        defaultValue={searchParams.get("specialtyId") ?? ""}
        className="bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:outline-none rounded-xl px-4 py-3 text-on-surface font-sans min-w-[200px] transition-colors"
        onChange={(e) => updateFilter("specialtyId", e.target.value)}
      >
        <option value="">Tất cả chuyên khoa</option>
        {specialties.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
