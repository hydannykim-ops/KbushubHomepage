"use client";

import { useState } from "react";
import { busMakers, makerForModel, makerLabel, modelsForMaker } from "@/lib/domain/vehicle-catalog";
import type { Lang } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";

const chip = "border px-3 py-2 text-sm font-medium transition-colors";
const chipOn = "border-primary bg-primary text-white";
const chipOff = "border-line bg-white text-foreground hover:border-primary";

export function MakerModelPicker({
  lang,
  makerName = "maker",
  modelName = "model",
  defaultMaker = "",
  defaultModel = "",
  required = false,
  allowEmpty = false,
}: {
  lang: Lang;
  makerName?: string;
  modelName?: string;
  defaultMaker?: string;
  defaultModel?: string;
  required?: boolean;
  allowEmpty?: boolean;
}) {
  const text = copy(lang);
  const initialMaker = defaultMaker || (defaultModel ? makerForModel(defaultModel) : "");
  const [maker, setMaker] = useState(initialMaker);
  const [model, setModel] = useState(defaultModel);
  const models = maker ? modelsForMaker(maker) : [];

  return (
    <div className="grid gap-4 md:col-span-2">
      <input type="hidden" name={makerName} value={maker} />
      <input type="hidden" name={modelName} value={model} />
      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          {text.maker}
          {required ? " *" : ""}
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label={text.maker}>
          {allowEmpty ? (
            <button
              type="button"
              className={`${chip} ${maker === "" ? chipOn : chipOff}`}
              aria-pressed={maker === ""}
              onClick={() => {
                setMaker("");
                setModel("");
              }}
            >
              {text.all}
            </button>
          ) : null}
          {busMakers.map((item) => (
            <button
              key={item}
              type="button"
              className={`${chip} ${maker === item ? chipOn : chipOff}`}
              aria-pressed={maker === item}
              onClick={() => {
                setMaker(item);
                setModel((current) => (modelsForMaker(item).includes(current) ? current : ""));
              }}
            >
              {makerLabel(item, lang)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          {text.model}
          {required ? " *" : ""}
        </legend>
        {!maker ? (
          <p className="text-sm text-muted">{text.pickMakerFirst}</p>
        ) : (
          <div className="flex flex-wrap gap-2" role="group" aria-label={text.model}>
            {allowEmpty ? (
              <button
                type="button"
                className={`${chip} ${model === "" ? chipOn : chipOff}`}
                aria-pressed={model === ""}
                onClick={() => setModel("")}
              >
                {text.all}
              </button>
            ) : null}
            {models.map((item) => (
              <button
                key={item}
                type="button"
                className={`${chip} ${model === item ? chipOn : chipOff}`}
                aria-pressed={model === item}
                onClick={() => setModel(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </fieldset>
      {required && (!maker || !model) ? <p className="text-xs text-muted">{text.pickMakerModel}</p> : null}
    </div>
  );
}
