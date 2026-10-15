"use client";

import { useState } from "react";
import {
  classForModel,
  makerForModel,
  makerLabel,
  makersForClass,
  modelsForMaker,
} from "@/lib/domain/vehicle-catalog";
import type { Lang, VehicleClass } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";

function resolveInitialMaker(defaultMaker: string, defaultModel: string, vehicleClass: VehicleClass | "") {
  const fromModel = defaultModel ? makerForModel(defaultModel) : "";
  const maker = defaultMaker || fromModel;
  if (!maker) return "";
  if (vehicleClass && !modelsForMaker(maker, vehicleClass).length) return "";
  if (vehicleClass && defaultModel && classForModel(defaultModel) && classForModel(defaultModel) !== vehicleClass) {
    return maker;
  }
  return maker;
}

function resolveInitialModel(defaultModel: string, maker: string, vehicleClass: VehicleClass | "") {
  if (!defaultModel || !maker) return "";
  if (!modelsForMaker(maker, vehicleClass).includes(defaultModel)) return "";
  return defaultModel;
}

function makerTileClass(active: boolean, market: boolean) {
  if (market) {
    return [
      "flex min-h-[3.25rem] cursor-pointer items-center justify-center border px-2 py-3 text-center text-sm font-semibold transition-colors",
      active ? "border-ink bg-ink text-white" : "border-line bg-white text-foreground hover:border-ink/40",
    ].join(" ");
  }
  return [
    "inline-flex min-h-11 cursor-pointer items-center border px-3.5 py-2.5 text-sm font-medium transition-colors",
    active ? "border-primary bg-primary text-white" : "border-line bg-white text-foreground hover:border-primary",
  ].join(" ");
}

function modelChipClass(active: boolean, market: boolean) {
  if (market) {
    return [
      "inline-flex min-h-10 cursor-pointer items-center px-3.5 py-2 text-sm font-medium transition-colors",
      active ? "bg-ink text-white" : "bg-[#eef1f5] text-foreground hover:bg-[#e4e8ef]",
    ].join(" ");
  }
  return [
    "inline-flex min-h-11 cursor-pointer items-center border px-3.5 py-2.5 text-sm font-medium transition-colors",
    active ? "border-primary bg-primary text-white" : "border-line bg-white text-foreground hover:border-primary",
  ].join(" ");
}

export function MakerModelPicker({
  lang,
  makerName = "maker",
  modelName = "model",
  defaultMaker = "",
  defaultModel = "",
  vehicleClass = "",
  required = false,
  allowEmpty = false,
  layout = "default",
}: {
  lang: Lang;
  makerName?: string;
  modelName?: string;
  defaultMaker?: string;
  defaultModel?: string;
  vehicleClass?: VehicleClass | "";
  required?: boolean;
  allowEmpty?: boolean;
  layout?: "default" | "market";
}) {
  const text = copy(lang);
  const market = layout === "market";
  const initialMaker = resolveInitialMaker(defaultMaker, defaultModel, vehicleClass);
  const initialModel = resolveInitialModel(defaultModel, initialMaker, vehicleClass);
  const [maker, setMaker] = useState(initialMaker);
  const [model, setModel] = useState(initialModel);
  const makers = makersForClass(vehicleClass);
  const models = maker ? modelsForMaker(maker, vehicleClass) : [];

  return (
    <div className="grid gap-5" data-maker-model-picker data-vehicle-class={vehicleClass || "all"} data-layout={layout}>
      <input type="hidden" name={makerName} value={maker} required={required && !allowEmpty} />
      <input type="hidden" name={modelName} value={model} required={required && !allowEmpty} />

      <fieldset className="min-w-0">
        {!market ? (
          <legend className="mb-3 text-sm font-medium">
            {text.maker}
            {required ? " *" : ""}
          </legend>
        ) : null}
        <div
          className={market ? "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6" : "flex flex-wrap gap-2"}
          role="group"
          aria-label={text.maker}
        >
          {allowEmpty ? (
            <button
              type="button"
              className={makerTileClass(maker === "", market)}
              aria-pressed={maker === ""}
              onClick={() => {
                setMaker("");
                setModel("");
              }}
            >
              {text.all}
            </button>
          ) : null}
          {makers.map((item) => (
            <button
              key={item}
              type="button"
              className={makerTileClass(maker === item, market)}
              aria-pressed={maker === item}
              onClick={() => {
                setMaker(item);
                setModel((current) => (modelsForMaker(item, vehicleClass).includes(current) ? current : ""));
              }}
            >
              {makerLabel(item, lang)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        {!market ? (
          <legend className="mb-3 text-sm font-medium">
            {text.model}
            {required ? " *" : ""}
          </legend>
        ) : maker ? (
          <legend className="mb-3 text-sm font-medium text-muted">
            {makerLabel(maker, lang)} · {text.model}
          </legend>
        ) : null}
        {!maker ? (
          market ? null : (
            <p className="rounded-sm border border-dashed border-line bg-[#f8fafc] px-3 py-4 text-sm text-muted">{text.pickMakerFirst}</p>
          )
        ) : models.length === 0 ? (
          <p className="text-sm text-muted">{text.noModelsInClass}</p>
        ) : (
          <div className="flex flex-wrap gap-2" role="group" aria-label={`${makerLabel(maker, lang)} ${text.model}`}>
            {allowEmpty ? (
              <button type="button" className={modelChipClass(model === "", market)} aria-pressed={model === ""} onClick={() => setModel("")}>
                {text.all}
              </button>
            ) : null}
            {models.map((entry) => (
              <button
                key={entry}
                type="button"
                className={modelChipClass(model === entry, market)}
                aria-pressed={model === entry}
                onClick={() => setModel(entry)}
              >
                {entry}
              </button>
            ))}
          </div>
        )}
        {required && !market ? <p className="mt-2 text-xs text-muted">{text.pickMakerModel}</p> : null}
      </fieldset>
    </div>
  );
}
