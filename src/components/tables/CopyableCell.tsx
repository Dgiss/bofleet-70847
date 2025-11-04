
import React, { useState } from "react";
import { Copy, CopyCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

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
    <TableCell className={`relative group ${className}`}>
      <div className="flex items-center whitespace-nowrap">
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
    </TableCell>
  );
}
