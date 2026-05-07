import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner label="Loading NutriSense..." />
    </div>
  );
}
