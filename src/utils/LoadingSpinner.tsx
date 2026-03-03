interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-navy-900 ${sizeClass}`}></div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
