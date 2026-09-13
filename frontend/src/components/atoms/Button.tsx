import clsx from "clsx";
import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type TButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

interface IButtonProps extends TButtonProps {
  isDiabled?: boolean;
  className?: string;
}

export default function Button(props: PropsWithChildren<IButtonProps>) {
  const { isDiabled, className, children, ...otherProps } = props;

  return (
    <button
      type="submit"
      disabled={isDiabled}
      className={clsx(
        `
              rounded-lg bg-blue-600 px-6 py-3
              font-medium text-white shadow-sm
              transition
              hover:bg-blue-700
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
              disabled:cursor-not-allowed
              disabled:opacity-50
            `,
        className,
      )}
      {...otherProps}
    >
      {children}
    </button>
  );
}
