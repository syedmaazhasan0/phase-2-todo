import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Global loading UI displayed during route transitions.
 *
 * This component is automatically shown by Next.js when navigating between pages
 * or when page data is being loaded.
 */
export default function Loading() {
  return <LoadingSpinner size="lg" fullScreen />;
}
