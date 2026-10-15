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

function chipClass(active: boolean) {
  return [
    "inline-flex min-h-11 cursor-pointer items-center border px-3.5 py-2.5 text-sm font-medium transition-colors",
    active
      ? "border-primary bg-primary text-white"
      : "border-line bg-white text-foreground hover:border-primary",
  ].join(" ");
}

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

export function MakerModelPicker({
  lang,
  makerName = "maker",
  modelName = "model",
  defaultMaker = "",
  defaultModel = "",
  vehicleClass = "",
  required = false,
  allowEmpty = false,
}: {
  lang: Lang;
  makerName?: string;
  modelName?: string;
  defaultMaker?: string;
  defaultModel?: string;
  vehicleClass?: VehicleClass | "";
  required?: boolean;
  allowEmpty?: boolean;
}) {
  const text = copy(lang);
  const initialMaker = resolveInitialMaker(defaultMaker, defaultModel, vehicleClass);
  const initialModel = resolveInitialModel(defaultModel, initialMaker, vehicleClass);
  const [maker, setMaker] = useState(initialMaker);
  const [model, setModel] = useState(initialModel);
  const makers = makersForClass(vehicleClass);
  const models = maker ? modelsForMaker(maker, vehicleClass) : [];

  return (
    <div className="grid gap-5 md:col-span-2" data-maker-model-picker data-vehicle-class={vehicleClass || "all"}>
      <input type="hidden" name={makerName} value={maker} required={required && !allowEmpty} />
      <input type="hidden" name={modelName} value={model} required={required && !allowEmpty} />

      <fieldset className="min-w-0">
        <legend className="mb-3 text-sm font-medium">
          {text.maker}
          {required ? " *" : ""}
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label={text.maker}>
          {allowEmpty ? (
            <button
              type="button"
              className={chipClass(maker === "")}
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
              className={chipClass(maker === item)}
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
        <legend className="mb-3 text-sm font-medium">
          {text.model}
          {required ? " *" : ""}
        </legend>
        {!maker ? (
          <p className="rounded-sm border border-dashed border-line bg-[#f8fafc] px-3 py-4 text-sm text-muted">{text.pickMakerFirst}</p>
        ) : models.length === 0 ? (
          <p className="rounded-sm border border-dashed border-line bg-[#f8fafc] px-3 py-4 text-sm text-muted">{text.noModelsInClass}</p>
        ) : (
          <div className="flex flex-wrap gap-2 rounded-sm border border-line bg-[#f8fafc] p-3" role="group" aria-label={`${makerLabel(maker, lang)} ${text.model}`}>
            {allowEmpty ? (
              <button type="button" className={chipClass(model === "")} aria-pressed={model === ""} onClick={() => setModel("")}>
                {text.all}
              </button>
            ) : null}
            {models.map((entry) => (
              <button
                key={entry}
                type="button"
                className={chipClass(model === entry)}
                aria-pressed={model === entry}
                onClick={() => setModel(entry)}
              >
                {entry}
              </button>
            ))}
          </div>
        )}
        {required ? <p className="mt-2 text-xs text-muted">{text.pickMakerModel}</p> : null}
      </fieldset>
    </div>
  );
}
