
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter } from "lucide-react";

interface SearchFormProps {
  fields: {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
  }[];
  onSubmit: (data: any) => void;
  onReset?: () => void;
  onAdd?: () => void;
}

export function SearchForm({ fields, onSubmit, onReset, onAdd }: SearchFormProps) {
  const [formData, setFormData] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({});
    onReset?.();
  };

  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {fields.map((field) => (
          <div key={field.id} className="flex-1 min-w-[200px]">
            {field.type === 'select' ? (
              <select
                id={field.id}
                className="w-full h-10 px-3 rounded-md border border-input"
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              >
                <option value="">{field.placeholder || field.label}</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={field.id}
                type={field.type || "text"}
                placeholder={field.placeholder || field.label}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          {onReset && (
            <Button type="button" variant="ghost" onClick={handleReset}>
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
          {onAdd && (
            <Button type="button" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
