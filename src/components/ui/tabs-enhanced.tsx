
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsEnhancedProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
}

export function TabsEnhanced({ 
  tabs, 
  defaultValue, 
  className,
  onChange 
}: TabsEnhancedProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.id);

  const handleChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <Tabs 
      defaultValue={activeTab} 
      className={cn("w-full", className)}
      onValueChange={handleChange}
    >
      <TabsList className="w-full grid grid-cols-2 gap-2">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className="text-sm font-medium"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
