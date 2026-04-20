import clsx from 'clsx';

export default function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx('inline-block w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin', className)} />
  );
}