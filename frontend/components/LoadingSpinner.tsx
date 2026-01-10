/**
 * LoadingSpinner component with size variants and fullScreen mode.
 *
 * @property size - Spinner size variant: 'sm' (small), 'md' (medium), 'lg' (large)
 * @property fullScreen - Whether to render spinner centered in full screen
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * LoadingSpinner displays an animated loading indicator.
 *
 * - Small (sm): 16px - for inline or button spinners
 * - Medium (md): 32px - default size for cards or sections
 * - Large (lg): 48px - for full page loading
 * - FullScreen mode: Centers spinner in viewport
 */
export default function LoadingSpinner({
  size = 'md',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-gray-200 border-t-[#4f46e5] rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}
