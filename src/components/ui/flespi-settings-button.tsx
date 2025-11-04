
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { FlespiConfigDialog } from '@/components/dialogs/FlespiConfigDialog';
import { hasFlespiApiKey } from '@/services/ApiConfigService';

interface FlespiSettingsButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showText?: boolean;
}

export const FlespiSettingsButton: React.FC<FlespiSettingsButtonProps> = ({
  variant = "outline",
  size = "sm",
  showText = true
}) => {
  const [configOpen, setConfigOpen] = useState(false);
  const hasApiKey = hasFlespiApiKey();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setConfigOpen(true)}
        className={!hasApiKey ? "border-orange-500 text-orange-600 hover:bg-orange-50" : ""}
      >
        <Settings className="w-4 h-4" />
        {showText && (
          <span className="ml-2">
            {hasApiKey ? "Config Flespi" : "Config Flespi requise"}
          </span>
        )}
      </Button>
      
      <FlespiConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
      />
    </>
  );
};
