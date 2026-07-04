import {
  useId,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";

interface InputElementProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const InputElement = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  id,
  className = "",
  required,
  ...props
}: InputElementProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={inputId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        {...props}
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : props["aria-describedby"]}
        className={`form-control ${className}`}
      />
      {error && (
        <p className="form-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputElement;
