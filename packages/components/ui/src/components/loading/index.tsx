import { cn } from '@rap/utils'

type LoadingProps = {
  text?: string;
  className?: string;
}
export const Loading = ({ text, className }: LoadingProps) => {
  return (
    <div className={cn('flex-col-center size-full gap-2', className)}>
      <div className='w-(--dots-loader-size) h-(--dots-loader-size) rounded-full shadow-dots-loader animate-dots-loader'></div>
      {text && <span className='mt-4'>{text}</span>}
    </div>
  );
};

