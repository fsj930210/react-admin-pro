type LoadingProps = {
  text?: string;
} & React.ComponentProps<"div">;
export const Loading = ({ text, className, ...props }: LoadingProps) => {
  return (
    <div className="flex-col-center size-full gap-2" {...props}>
      <div className='w-(--dots-loader-size) h-(--dots-loader-size) rounded-full shadow-dots-loader animate-dots-loader'></div>
      {text && <span className='mt-4'>{text}</span>}
    </div>
  );
};

