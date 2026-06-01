import { cn } from '@/lib/css';

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: number;
}
const GridItem = ({ children, columns, ...props }: GridItemProps) => {
  return (
    <div
      className={cn('grid-cols-1 gap-4', {
        [`md:grid-cols-${columns}`]: columns > 1,
      })}
      {...props}
    >
      {children}
    </div>
  );
};
GridItem.displayName = 'GridItem';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan: number;
}
const Grid = ({ children, colSpan, ...props }: GridProps) => {
  return (
    <div
      className={cn('grid grid-cols-1 gap-4', {
        [`md:grid-cols-${colSpan}`]: colSpan > 1,
      })}
      {...props}
    >
      {children}
    </div>
  );
};
Grid.displayName = 'Grid';
