import { PropsWithChildren } from "react";
import clsx from 'clsx';

interface IAlertProps {
  variant: "error";
  className?: string
}

export default function Alert({
  variant,
  children,
  className
}: PropsWithChildren<IAlertProps>) {
  if (variant == "error") {
    return (
      <div
        role="alert"
        className={clsx(`
              rounded-lg border
              border-red-200 bg-red-50
              px-4 py-3 text-sm text-red-800
            `, className)}
      >
        {children}
      </div>
    );
  }

  return <></>;
}
