import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  const variantClass =
    variant === 'primary'
      ? 'button button-primary'
      : variant === 'ghost'
        ? 'button button-ghost'
        : variant === 'danger'
          ? 'button button-danger'
          : 'button button-secondary';

  return (
    <button {...props} className={`${variantClass}${className ? ` ${className}` : ''}`}>
      {children}
    </button>
  );
}
