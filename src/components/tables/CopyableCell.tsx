
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Copy, CopyCheck } from "lucide-react";
import { useState } from "react";

interface CopyableCellProps {
  value: string | number | null | undefined;
  className?: string;
}

export function CopyableCell({ value, className }: CopyableCellProps) {
  const [copied, setCopied] = useState(false);
  
  const displayValue = value !== undefined && value !== null ? String(value) : '-';
  
  const handleCopy = () => {
    if (displayValue === '-') return;
    
    navigator.clipboard.writeText(displayValue)
      .then(() => {
        setCopied(true);
        toast({
          description: "Texte copié dans le presse-papiers",
          duration: 2000,
        });
        
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Erreur lors de la copie:', err);
        toast({
          variant: "destructive",
          description: "Impossible de copier le texte",
        });
      });
  };
  
  return (
    <div className={`relative group flex items-center whitespace-nowrap ${className || ''}`}>
      <span className="mr-2">{displayValue}</span>
      {displayValue !== '-' && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
          onClick={handleCopy}
        >
          {copied ? (
            <CopyCheck className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </div>
  );
}
