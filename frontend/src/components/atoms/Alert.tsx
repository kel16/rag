import clsx from "clsx";
import { PropsWithChildren } from "react";

interface IAlertProps {
  variant: "error";
  className?: string;
}

export default function Alert(props: PropsWithChildren<IAlertProps>) {
  const { variant, children, className } = props;

  if (variant == "error") {
    return (
      <div
        role="alert"
        className={clsx(
          `
              rounded-lg border
              border-red-200 bg-red-50
              px-4 py-3 text-sm text-red-800
            `,
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return <></>;
}
