
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  nom: z.string().min(1, "Le nom d'utilisateur est requis"),
  motDePasse: z.string().min(1, "Le mot de passe est requis"),
  entreprise: z.string().min(1, "L'entreprise est requise"),
});

interface EditUserFormProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserForm({ user, onClose, onSuccess }: EditUserFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: user.nom || "",
      motDePasse: user.motDePasse || "",
      entreprise: user.entreprise || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      console.log("Données de l'utilisateur modifiées:", data);
      // Ici, vous implémenteriez l'appel API pour mettre à jour les données
      
      toast({
        title: "Utilisateur modifié",
        description: "Les informations de l'utilisateur ont été mises à jour",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la modification de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'utilisateur",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Modifier l'utilisateur</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom d'utilisateur</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="motDePasse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input {...field} type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="entreprise"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entreprise</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
