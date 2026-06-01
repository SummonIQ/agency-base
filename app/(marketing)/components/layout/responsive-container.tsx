const ResponsiveContainer = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className={`w-full px-5 ${
        props.className || ''
      } md:px-12 lg:mx-auto lg:max-w-5xl`}
    >
      {children}
    </div>
  );
};

export { ResponsiveContainer };
