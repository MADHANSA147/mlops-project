import { Loader2 } from 'lucide-react';

interface LoaderProps {
  label?: string;
  fullHeight?: boolean;
}

export default function Loader({ label = 'Loading...', fullHeight = false }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${fullHeight ? 'h-64' : 'py-12'}`}>
      <Loader2 className="animate-spin text-primary-600" size={28} />
      <p className="text-sm text-neutral-500 font-medium">{label}</p>
    </div>
  );
}
