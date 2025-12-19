
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AddEmergencyContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const contactSchema = z.object({
  name: z.string().min(2, "Please enter a valid name."),
  relation: z.string().min(2, "Please enter the relationship."),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number."),
});

export default function AddEmergencyContactDialog({ open, onOpenChange }: AddEmergencyContactDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      relation: "",
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    const user = auth.currentUser;
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in." });
        return;
    }

    setIsSubmitting(true);
    try {
        const contactsColRef = collection(db, "users", user.uid, "emergency_contacts");
        await addDoc(contactsColRef, values);

        toast({
            title: "Contact Added!",
            description: `${values.name} has been added to your emergency contacts.`,
        });
        form.reset();
        onOpenChange(false);
    } catch (error) {
        console.error("Error adding contact: ", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "Could not add the contact. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isSubmitting) {
            onOpenChange(isOpen);
            if (!isOpen) form.reset();
        }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Emergency Contact</DialogTitle>
          <DialogDescription>
            This person will be alerted if you trigger an SOS.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="relation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relation</FormLabel>
                  <FormControl><Input placeholder="e.g., Mother, Friend" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input type="tel" placeholder="e.g., +911234567890" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Contact"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
