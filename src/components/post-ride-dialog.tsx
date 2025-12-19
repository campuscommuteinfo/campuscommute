
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface PostRideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const rideSchema = z.object({
  from: z.string().min(2, "Please enter a starting location."),
  to: z.string().min(2, "Please enter a destination."),
  rideDate: z.date({ required_error: "Please select a date and time." }),
  seats: z.coerce.number().min(1, "Must offer at least one seat."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
});

export default function PostRideDialog({ open, onOpenChange }: PostRideDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof rideSchema>>({
    resolver: zodResolver(rideSchema),
    defaultValues: {
      from: "",
      to: "",
      seats: 1,
      price: 50,
    },
  });

  const onSubmit = async (values: z.infer<typeof rideSchema>) => {
    const user = auth.currentUser;
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to post a ride." });
        return;
    }

    setIsSubmitting(true);
    try {
        // Fetch user preferences
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        await addDoc(collection(db, "rides"), {
            driverId: user.uid,
            driverName: user.displayName || "Anonymous",
            driverPhotoUrl: user.photoURL || `https://placehold.co/40x40.png?text=${user.displayName?.charAt(0) || 'U'}`,
            from: values.from,
            to: values.to,
            rideDate: values.rideDate.toISOString(),
            seats: values.seats,
            price: values.price,
            createdAt: serverTimestamp(),
            // Include preferences
            genderPreference: userData?.genderPreference || "any",
            isSmokingAllowed: userData?.isSmokingAllowed || false,
            isMusicAllowed: userData?.isMusicAllowed === false ? false : true,
        });

        toast({
            title: "Ride Posted!",
            description: "Your ride has been successfully posted for other students to see.",
        });
        form.reset();
        onOpenChange(false);
    } catch (error) {
        console.error("Error posting ride: ", error);
        toast({
            variant: "destructive",
            title: "Post Failed",
            description: "Could not post your ride. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Offer a Ride</DialogTitle>
          <DialogDescription>
            Fill out the details below to share your ride with the community.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <FormControl><Input placeholder="Starting point" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <FormControl><Input placeholder="Destination" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
                control={form.control}
                name="rideDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Date & Time</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP HH:mm:ss")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
                         <div className="p-3 border-t border-border">
                            <Input
                                type="time"
                                onChange={(e) => {
                                    const time = e.target.value.split(':');
                                    const newDate = new Date(field.value);
                                    newDate.setHours(Number(time[0]));
                                    newDate.setMinutes(Number(time[1]));
                                    field.onChange(newDate);
                                }}
                            />
                        </div>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seats Available</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Seat (₹)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Ride"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
