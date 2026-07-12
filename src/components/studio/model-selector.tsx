"use client";

import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ChevronDown } from "@/components/icons";
import { useFloatingPanel } from "./hooks/use-floating-panel";
import { MODEL_CATALOG, PROVIDERS, type ModelDefinition } from "./model-catalog";
import { ProviderLogo } from "./provider-logos";
import type { ModelType } from "./types";

interface ModelSelectorProps {
  value: ModelType;
  onChange: (model: ModelType) => void;
}

function ModelCard({
  model,
  selected,
  onClick,
}: {
  model: ModelDefinition;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors",
        selected ? "bg-surface-soft" : "hover:bg-surface-soft",
      )}
    >
      <span className="shrink-0 text-body">
        {ProviderLogo[model.provider as keyof typeof ProviderLogo]}
      </span>
      <span className="flex-1 truncate text-xs font-medium text-ink">{model.name}</span>
      {model.badge && (
        <span className="shrink-0 rounded-full bg-secondary/12 px-1.5 py-0.5 text-[9px] font-semibold text-secondary">
          {model.badge}
        </span>
      )}
      {selected && <ChevronDown size={13} className="shrink-0 rotate-[-90deg] text-secondary" />}
    </button>
  );
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { open, setOpen, toggle, style, triggerRef, panelRef } = useFloatingPanel("start");
  const current = MODEL_CATALOG.find((m) => m.id === value);

  const dropdown = open && (
    <div
      ref={panelRef}
      style={{ position: "fixed", top: style.top, left: style.left, width: style.minWidth, zIndex: 9999 }}
      className="overflow-hidden rounded-lg border border-hairline bg-card shadow-lg"
    >
      <div className="max-h-80 overflow-y-auto py-1">
        {PROVIDERS.filter((p) => MODEL_CATALOG.some((m) => m.provider === p.key)).map((provider, groupIndex) => (
          <div key={provider.key}>
            {groupIndex > 0 && <div className="my-1 border-t border-hairline-soft" />}
            {MODEL_CATALOG.filter((m) => m.provider === provider.key).map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                selected={value === model.id}
                onClick={() => {
                  onChange(model.id as ModelType);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label="选择模型"
        aria-expanded={open}
        className={cn(
          "flex h-7 max-w-[140px] items-center gap-1.5 rounded-md border border-hairline bg-card px-2 text-body transition-colors hover:border-muted-soft md:h-9 md:max-w-[220px] md:px-3",
          open && "border-secondary text-ink",
        )}
      >
        {current && (
          <span className="shrink-0 text-ink">
            {ProviderLogo[current.provider as keyof typeof ProviderLogo]}
          </span>
        )}
        <span className="truncate text-xs font-medium">{current?.name ?? "选择模型"}</span>
        <ChevronDown size={13} className={cn("ml-auto shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {typeof document !== "undefined" && dropdown && createPortal(dropdown, document.body)}
    </>
  );
}
