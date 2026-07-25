"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export type FaqItem = { question: string; answer: string; group?: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [items, query]);

  const groups = useMemo(() => {
    const order: string[] = [];
    for (const item of filtered) {
      const g = item.group ?? "";
      if (!order.includes(g)) order.push(g);
    }
    return order.map((g) => ({ group: g, items: filtered.filter((i) => (i.group ?? "") === g) }));
  }, [filtered]);

  return (
    <div className="flex flex-col gap-lg">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm câu hỏi..."
          className="w-full rounded-2xl border border-ink/10 bg-canvas py-md pl-[44px] pr-lg text-[14px] text-ink outline-none transition-colors focus:border-primary"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-xl text-center text-[14px] text-mute">Không tìm thấy câu hỏi phù hợp.</p>
      ) : (
        <div className="flex flex-col gap-xl">
          {groups.map(({ group, items: groupItems }) => (
            <div key={group || "_"} className="flex flex-col gap-sm">
              {group && (
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-primary">{group}</h3>
              )}
              {groupItems.map((item) => {
                const key = `${group}-${item.question}`;
                const isOpen = openKey === key;
                return (
                  <div key={key} className="rounded-2xl border border-ink/8 bg-canvas overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenKey(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-md px-lg py-lg text-left"
                    >
                      <span className="text-[15px] font-semibold text-ink">{item.question}</span>
                      <ChevronDown
                        size={20}
                        strokeWidth={1.75}
                        className={`shrink-0 text-mute transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-lg pb-lg text-[14px] leading-relaxed text-body whitespace-pre-line">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
