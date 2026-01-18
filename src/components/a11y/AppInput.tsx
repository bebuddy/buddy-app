"use client";

import { useId } from "react";

type FieldBaseProps = {
  id?: string;
  label: string;
  hideLabel?: boolean;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
};

function useFieldIds(id?: string, description?: string, error?: string) {
  const fallbackId = useId();
  const fieldId = id ?? `field-${fallbackId}`;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return { fieldId, descriptionId, errorId, describedBy };
}

export type AppInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> & FieldBaseProps;

export function AppInput({
  id,
  label,
  hideLabel,
  description,
  error,
  required,
  className,
  labelClassName,
  inputClassName,
  ...rest
}: AppInputProps) {
  const { fieldId, descriptionId, errorId, describedBy } = useFieldIds(id, description, error);

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label
        htmlFor={fieldId}
        className={`${hideLabel ? "sr-only" : ""} ${labelClassName ?? ""}`}
      >
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      <input
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={error ? "true" : undefined}
        aria-required={required ? "true" : undefined}
        {...rest}
        className={inputClassName}
      />
      {description ? (
        <p id={descriptionId} className="text-[14px] text-neutral-600">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[14px] text-red-600" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type AppTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> &
  FieldBaseProps;

export function AppTextarea({
  id,
  label,
  hideLabel,
  description,
  error,
  required,
  className,
  labelClassName,
  inputClassName,
  ...rest
}: AppTextareaProps) {
  const { fieldId, descriptionId, errorId, describedBy } = useFieldIds(id, description, error);

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label
        htmlFor={fieldId}
        className={`${hideLabel ? "sr-only" : ""} ${labelClassName ?? ""}`}
      >
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={error ? "true" : undefined}
        aria-required={required ? "true" : undefined}
        {...rest}
        className={inputClassName}
      />
      {description ? (
        <p id={descriptionId} className="text-[14px] text-neutral-600">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[14px] text-red-600" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}
