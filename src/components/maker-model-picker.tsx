"use client";

import { useState } from "react";
import { MakerMark } from "@/components/maker-mark";
import {
  classForModel,
  makerForModel,
  makerLabel,
  makersForClass,
  modelLabel,
  modelsForMaker,
  modelsForSeries,
  seriesForMaker,
  seriesForModel,
  seriesLabel,
} from "@/lib/domain/vehicle-catalog";
import type { Lang, VehicleClass } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";

type Step = "maker" | "series" | "model" | "done";

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

function resolveInitialStep(maker: string, model: string): Step {
  if (!maker) return "maker";
  if (!model) return "series";
  return "done";
}

function optionClass(active: boolean, market: boolean) {
  if (market) {
    return [
      "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors",
      active ? "bg-ink font-semibold text-white" : "bg-transparent text-ink hover:bg-[#e8ebf0]",
    ].join(" ");
  }
  return [
    "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
    active ? "border-primary bg-primary text-white" : "border-line bg-white text-foreground hover:border-primary",
  ].join(" ");
}

function lockedRowClass(market: boolean) {
  return market
    ? "flex w-full items-center justify-between gap-3 border-b border-[#d8dde6] px-1 py-2.5 text-left text-sm"
    : "flex w-full items-center justify-between gap-3 border border-line bg-[#f8fafc] px-3.5 py-2.5 text-left text-sm";
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
  const initialSeries = initialModel ? seriesForModel(initialModel) : "";
  const [maker, setMaker] = useState(initialMaker);
  const [series, setSeries] = useState(initialSeries);
  const [model, setModel] = useState(initialModel);
  const [step, setStep] = useState<Step>(() => resolveInitialStep(initialMaker, initialModel));

  const makers = makersForClass(vehicleClass);
  const seriesList = maker ? seriesForMaker(maker, vehicleClass) : [];
  const variants = maker && series ? modelsForSeries(maker, series, vehicleClass) : [];

  function pickMaker(next: string) {
    setMaker(next);
    setSeries("");
    setModel("");
    setStep(next ? "series" : "maker");
  }

  function pickSeries(next: string) {
    setSeries(next);
    setModel("");
    setStep("model");
  }

  function pickModel(next: string) {
    setModel(next);
    setStep("done");
  }

  return (
    <div className="grid gap-3" data-maker-model-picker data-vehicle-class={vehicleClass || "all"} data-layout={layout} data-step={step}>
      <input type="hidden" name={makerName} value={maker} required={required && !allowEmpty} />
      <input type="hidden" name={modelName} value={model} required={required && !allowEmpty} />

      {!market ? (
        <p className="text-sm font-medium">
          {text.maker} · {text.model}
          {required ? " *" : ""}
        </p>
      ) : null}

      {maker && step !== "maker" ? (
        <button
          type="button"
          className={lockedRowClass(market)}
          onClick={() => {
            setStep("maker");
          }}
        >
          <span>
            <span className="text-xs font-semibold text-muted">{text.maker}</span>
            <span className="mt-0.5 block font-semibold text-ink">{makerLabel(maker, lang)}</span>
          </span>
          <span className="text-xs font-medium text-muted">{text.reset}</span>
        </button>
      ) : null}

      {series && step !== "maker" && step !== "series" ? (
        <button
          type="button"
          className={lockedRowClass(market)}
          onClick={() => {
            setModel("");
            setStep("series");
          }}
        >
          <span>
            <span className="text-xs font-semibold text-muted">{text.series}</span>
            <span className="mt-0.5 block font-semibold text-ink">{seriesLabel(series, lang)}</span>
          </span>
          <span className="text-xs font-medium text-muted">{text.reset}</span>
        </button>
      ) : null}

      {step === "done" && model ? (
        <button
          type="button"
          className={lockedRowClass(market)}
          onClick={() => {
            setModel("");
            setStep("model");
          }}
        >
          <span>
            <span className="text-xs font-semibold text-muted">{text.model}</span>
            <span className="mt-0.5 block font-semibold text-ink">{modelLabel(model, lang)}</span>
          </span>
          <span className="text-xs font-medium text-muted">{text.reset}</span>
        </button>
      ) : null}

      {step === "maker" ? (
        <div className={market ? "grid gap-0.5" : "grid gap-2"} role="listbox" aria-label={text.maker}>
          {allowEmpty ? (
            <button type="button" className={optionClass(maker === "", market)} aria-pressed={maker === ""} onClick={() => pickMaker("")}>
              {text.all}
            </button>
          ) : null}
          {makers.map((item) => (
            <button
              key={item}
              type="button"
              className={optionClass(maker === item, market)}
              aria-pressed={maker === item}
              onClick={() => pickMaker(item)}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <MakerMark maker={item} active={maker === item} />
                <span className="truncate">{makerLabel(item, lang)}</span>
              </span>
              <span aria-hidden className="text-[10px] opacity-50">
                ›
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {step === "series" && maker ? (
        seriesList.length === 0 ? (
          <p className="text-sm text-muted">{text.noModelsInClass}</p>
        ) : (
          <div className={market ? "grid gap-0.5" : "grid gap-2"} role="listbox" aria-label={`${makerLabel(maker, lang)} ${text.series}`}>
            {allowEmpty ? (
              <button
                type="button"
                className={optionClass(series === "" && model === "", market)}
                aria-pressed={series === "" && model === ""}
                onClick={() => {
                  setSeries("");
                  setModel("");
                  setStep("done");
                }}
              >
                {text.all}
              </button>
            ) : null}
            {seriesList.map((entry) => (
              <button key={entry} type="button" className={optionClass(false, market)} onClick={() => pickSeries(entry)}>
                <span>{seriesLabel(entry, lang)}</span>
                <span aria-hidden className="text-[10px] opacity-50">
                  ›
                </span>
              </button>
            ))}
          </div>
        )
      ) : null}

      {step === "model" && maker && series ? (
        <div className={market ? "grid gap-0.5" : "grid gap-2"} role="listbox" aria-label={`${seriesLabel(series, lang)} ${text.model}`}>
          {variants.map((entry) => (
            <button
              key={entry}
              type="button"
              className={optionClass(model === entry, market)}
              aria-pressed={model === entry}
              onClick={() => pickModel(entry)}
            >
              <span>{modelLabel(entry, lang)}</span>
            </button>
          ))}
        </div>
      ) : null}

      {required && !market && !model ? <p className="text-xs text-muted">{text.pickMakerModel}</p> : null}
    </div>
  );
}
