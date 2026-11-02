"use client";

import { useState, type ReactNode } from "react";
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

function LockedRow({
  label,
  value,
  action,
  onClick,
}: {
  label: string;
  value: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="picker-locked" onClick={onClick}>
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="picker-locked__check" aria-hidden>
          ✓
        </span>
        <span className="min-w-0">
          <span className="picker-locked__meta">{label}</span>
          <span className="picker-locked__value">{value}</span>
        </span>
      </span>
      <span className="picker-locked__action">{action}</span>
    </button>
  );
}

function Stage({
  title,
  selecting,
  stageKey,
  children,
}: {
  title: string;
  selecting: string;
  stageKey: string;
  children: ReactNode;
}) {
  return (
    <div className="picker-stage">
      <div className="picker-stage__head">
        <p className="picker-stage__title">{title}</p>
        <span className="picker-stage__badge">{selecting}</span>
      </div>
      <div key={stageKey} className="picker-stage__list" role="listbox" aria-label={title}>
        {children}
      </div>
    </div>
  );
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
  emptyLabel,
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
  emptyLabel?: string;
  layout?: "default" | "market";
}) {
  const text = copy(lang);
  const market = layout === "market";
  const skipLabel = emptyLabel ?? text.all;
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
    setStep(next ? "series" : allowEmpty ? "done" : "maker");
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

  const stepStates = [
    {
      key: "maker",
      label: text.maker,
      state: step === "maker" ? "current" : maker ? "done" : "todo",
    },
    {
      key: "series",
      label: text.series,
      state: step === "series" ? "current" : series && step !== "maker" ? "done" : "todo",
    },
    {
      key: "model",
      label: text.model,
      state: step === "model" ? "current" : model ? "done" : "todo",
    },
  ] as const;

  const activePrompt =
    step === "maker" ? text.pickMakerFirst : step === "series" ? text.pickSeries : step === "model" ? text.pickModel : "";

  return (
    <div
      className="grid gap-3"
      data-maker-model-picker
      data-vehicle-class={vehicleClass || "all"}
      data-layout={layout}
      data-step={step}
    >
      <input type="hidden" name={makerName} value={maker} required={required && !allowEmpty} />
      <input type="hidden" name={modelName} value={model} required={required && !allowEmpty} />

      {!market ? (
        <p className="text-sm font-medium">
          {text.maker} · {text.model}
          {required ? " *" : ""}
        </p>
      ) : null}

      <div className="picker-rail" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }} aria-hidden>
        {stepStates.map((entry, index) => (
          <div key={entry.key} className="picker-rail__step" data-state={entry.state}>
            <span className="picker-rail__dot">{entry.state === "done" ? "✓" : index + 1}</span>
            <span className="picker-rail__label">{entry.label}</span>
          </div>
        ))}
      </div>

      {maker && step !== "maker" ? (
        <LockedRow
          label={text.maker}
          value={makerLabel(maker, lang)}
          action={text.changeSelection}
          onClick={() => setStep("maker")}
        />
      ) : null}

      {series && step !== "maker" && step !== "series" ? (
        <LockedRow
          label={text.series}
          value={seriesLabel(series, lang)}
          action={text.changeSelection}
          onClick={() => {
            setModel("");
            setStep("series");
          }}
        />
      ) : null}

      {step === "done" && model ? (
        <LockedRow
          label={text.model}
          value={modelLabel(model, lang)}
          action={text.changeSelection}
          onClick={() => {
            setModel("");
            setStep("model");
          }}
        />
      ) : null}

      {allowEmpty && step === "done" && !maker && !model ? (
        <LockedRow
          label={`${text.maker} · ${text.model}`}
          value={skipLabel}
          action={text.changeSelection}
          onClick={() => setStep("maker")}
        />
      ) : null}

      {step === "maker" ? (
        <Stage title={activePrompt} selecting={text.selecting} stageKey="maker">
          {allowEmpty ? (
            <button
              type="button"
              className="picker-option"
              data-active={maker === "" ? "true" : "false"}
              aria-pressed={maker === ""}
              onClick={() => pickMaker("")}
            >
              {skipLabel}
            </button>
          ) : null}
          {makers.map((item) => (
            <button
              key={item}
              type="button"
              className="picker-option"
              data-active={maker === item ? "true" : "false"}
              aria-pressed={maker === item}
              onClick={() => pickMaker(item)}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <MakerMark maker={item} active={maker === item} />
                <span className="truncate">{makerLabel(item, lang)}</span>
              </span>
              <span aria-hidden className="picker-option__chevron">
                ›
              </span>
            </button>
          ))}
        </Stage>
      ) : null}

      {step === "series" && maker ? (
        seriesList.length === 0 ? (
          <p className="text-sm text-muted">{text.noModelsInClass}</p>
        ) : (
          <Stage title={activePrompt} selecting={text.selecting} stageKey="series">
            {allowEmpty ? (
              <button
                type="button"
                className="picker-option"
                data-active={series === "" && model === "" ? "true" : "false"}
                aria-pressed={series === "" && model === ""}
                onClick={() => {
                  setSeries("");
                  setModel("");
                  setStep("done");
                }}
              >
                {skipLabel}
              </button>
            ) : null}
            {seriesList.map((entry) => (
              <button key={entry} type="button" className="picker-option" onClick={() => pickSeries(entry)}>
                <span>{seriesLabel(entry, lang)}</span>
                <span aria-hidden className="picker-option__chevron">
                  ›
                </span>
              </button>
            ))}
          </Stage>
        )
      ) : null}

      {step === "model" && maker && series ? (
        <Stage title={activePrompt} selecting={text.selecting} stageKey="model">
          {variants.map((entry) => (
            <button
              key={entry}
              type="button"
              className="picker-option"
              data-active={model === entry ? "true" : "false"}
              aria-pressed={model === entry}
              onClick={() => pickModel(entry)}
            >
              <span>{modelLabel(entry, lang)}</span>
              <span aria-hidden className="picker-option__chevron">
                ›
              </span>
            </button>
          ))}
        </Stage>
      ) : null}

      {required && !market && !model ? <p className="text-xs text-muted">{text.pickMakerModel}</p> : null}
    </div>
  );
}
