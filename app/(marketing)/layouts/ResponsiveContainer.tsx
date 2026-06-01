import type React from 'react';
import { twMerge } from 'tailwind-merge';

const ResponsiveContainer = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className={twMerge(
        'w-full px-5 md:px-12 lg:mx-auto lg:max-w-5xl',
        className,
      )}
    >
      {children}
    </div>
  );
};

export { ResponsiveContainer };
