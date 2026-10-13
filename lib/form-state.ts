export type FormState = {
  saved: boolean;
  id?: string;
  errors: Record<string, string>;
};

export const emptyForm: FormState = { saved: false, errors: {} };
