import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageBackButtonProps {
  className?: string;
  fallbackPath?: string;
  hideOnPaths?: string[];
}

export default function PageBackButton({
  className,
  fallbackPath,
  hideOnPaths = ["/", "/admin"],
}: PageBackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  const resolvedFallback =
    fallbackPath || (location.pathname.startsWith("/admin") ? "/admin" : "/");

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(resolvedFallback, { replace: true });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoBack}
      className={cn(
        "h-9 gap-1.5 rounded-full px-3 text-xs sm:h-10 sm:px-4 sm:text-sm",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Back</span>
    </Button>
  );
}
