import { cn } from '@/lib/css';

import { Metadata } from '../data/metadata-list';

export type PageProps = React.HTMLAttributes<HTMLDivElement>;
const Page = ({ className, ...props }: PageProps) => {
  return <div className={cn('flex grow flex-col', className)} {...props} />;
};
Page.displayName = 'Page';

export type PageHeaderProps = React.HTMLAttributes<HTMLDivElement>;
const PageHeader = ({ className, ...props }: PageHeaderProps) => {
  return (
    <div
      className={cn(
        'flex flex-row flex-wrap items-start justify-between gap-4 md:pt-0 py-4 md:py-5',
        className,
      )}
      {...props}
    />
  );
};
PageHeader.displayName = 'PageHeader';

export type PageSummaryProps = React.HTMLAttributes<HTMLDivElement>;
const PageSummary = ({ className, ...props }: PageSummaryProps) => {
  return <div className={cn('flex grow flex-col', className)} {...props} />;
};
PageSummary.displayName = 'PageSummary';

export type PageTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
const PageTitle = ({ className, ...props }: PageTitleProps) => {
  return (
    <h1
      className={cn(
        'text-2xl font-semibold leading-snug tracking-tight md:text-2xl',
        className,
      )}
      {...props}
    />
  );
};
PageTitle.displayName = 'PageTitle';

export type PageDescriptionProps = React.HTMLAttributes<HTMLDivElement>;
const PageDescription = ({ className, ...props }: PageDescriptionProps) => {
  return (
    <div
      className={cn('text-sm text-muted-foreground/70', className)}
      {...props}
    />
  );
};
PageDescription.displayName = 'PageDescription';

export type PageMetadataProps = React.HTMLAttributes<HTMLDivElement>;
const PageMetadata = ({ className, ...props }: PageMetadataProps) => {
  return <Metadata className={cn('', className)} {...props} />;
};
PageMetadata.displayName = 'PageMetadata';

export type PageContentProps = React.HTMLAttributes<HTMLDivElement>;
const PageContent = ({ className, ...props }: PageContentProps) => {
  return (
    <div
      className={cn(
        'flex grow flex-col py-4 md:py-5 md:pt-0',
        className,
      )}
      {...props}
    />
  );
};
PageContent.displayName = 'PageContent';

export type PageActionsProps = React.HTMLAttributes<HTMLDivElement>;
const PageActions = ({ className, ...props }: PageActionsProps) => {
  return (
    <div
      className={cn('flex flex-wrap justify-end gap-2', className)}
      {...props}
    />
  );
};
PageActions.displayName = 'PageActions';

export {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageMetadata,
  PageSummary,
  PageTitle,
};
