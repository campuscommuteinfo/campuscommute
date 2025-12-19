
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword, deleteUser } from "firebase/auth";
import { Skeleton } from "./ui/skeleton";

const profileFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email(),
    collegeName: z.string().optional(),
    studentId: z.string().optional(),
});

const ridePreferencesSchema = z.object({
  genderPreference: z.enum(["any", "female"]),
  isSmokingAllowed: z.boolean(),
  isMusicAllowed: z.boolean(),
});

const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
    newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function Profile() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(true);
    const [user, setUser] = React.useState<any>(null);
    const [isProfileNew, setIsProfileNew] = React.useState(false);

    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { name: "", email: "", collegeName: "", studentId: "" },
    });

    const ridePreferencesForm = useForm<z.infer<typeof ridePreferencesSchema>>({
        resolver: zodResolver(ridePreferencesSchema),
        defaultValues: {
            genderPreference: "any",
            isSmokingAllowed: false,
            isMusicAllowed: true,
        },
    });

     const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: { currentPassword: "", newPassword: "" },
    });

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    profileForm.reset({
                        name: userData.name || currentUser.displayName || "",
                        email: currentUser.email || "",
                        collegeName: userData.collegeName || "",
                        studentId: userData.studentId || "",
                    });
                    ridePreferencesForm.reset({
                        genderPreference: userData.genderPreference || "any",
                        isSmokingAllowed: userData.isSmokingAllowed || false,
                        isMusicAllowed: userData.isMusicAllowed === false ? false : true,
                    });
                    if (!userData.profileComplete) {
                        setIsProfileNew(true);
                    }
                } else {
                     profileForm.reset({
                        name: currentUser.displayName || "",
                        email: currentUser.email || "",
                    });
                }
            } else {
                router.push('/login');
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [router, profileForm, ridePreferencesForm]);

    async function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
        if (!user) return;
        try {
            const userDocRef = doc(db, "users", user.uid);
            const updateData: any = { 
                name: data.name,
                collegeName: data.collegeName,
                studentId: data.studentId
            };
            if (isProfileNew) {
                updateData.profileComplete = true;
            }

            await setDoc(userDocRef, updateData, { merge: true });
            
            toast({
                title: "Profile Updated",
                description: "Your information has been successfully updated.",
            });
            
            if (isProfileNew) {
                setIsProfileNew(false);
                router.push('/dashboard');
            }
        } catch (error) {
             toast({ variant: "destructive", title: "Update Failed", description: "Could not update your profile." });
        }
    }

     async function onPreferencesSubmit(data: z.infer<typeof ridePreferencesSchema>) {
        if (!user) return;
        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, data);
            toast({
                title: "Preferences Saved",
                description: "Your ride-sharing preferences have been updated.",
            });
        } catch (error) {
            console.error(error)
            toast({ variant: "destructive", title: "Update Failed", description: "Could not save your preferences." });
        }
    }

    async function onPasswordSubmit(data: z.infer<typeof passwordFormSchema>) {
        if (!user || !user.email) return;
        
        const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
        
        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, data.newPassword);
            toast({
                title: "Password Changed",
                description: "Your password has been successfully updated.",
            });
            passwordForm.reset();
        } catch (error) {
             toast({ variant: "destructive", title: "Password Change Failed", description: "Incorrect current password." });
        }
    }

    async function handleDeleteAccount() {
        if (!user) return;
        try {
            await deleteUser(user);
            toast({
                variant: "destructive",
                title: "Account Deleted",
                description: "Your account has been permanently deleted.",
            });
            router.push('/');
        } catch (error) {
             toast({ variant: "destructive", title: "Deletion Failed", description: "Please log out and log back in to delete your account." });
        }
    }
    
    if (isLoading) {
        return (
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-6 w-64" />
                    </div>
                </div>
                <Separator />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

  return (
    <div className="space-y-6">
        {isProfileNew && (
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle>Welcome to Commute Companion!</CardTitle>
                    <CardDescription>
                        Let's get your profile set up so you can start enjoying the app. Please fill out your name and college details to continue.
                    </CardDescription>
                </CardHeader>
            </Card>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${profileForm.getValues("name")?.charAt(0) || 'U'}`} alt={profileForm.getValues("name")} data-ai-hint="student smiling" />
                    <AvatarFallback>{profileForm.getValues("name")?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute -bottom-2 -right-2 rounded-full">
                    <UploadCloud className="size-4"/>
                    <span className="sr-only">Upload Profile Photo</span>
                </Button>
            </div>
            <div>
                <h1 className="text-3xl font-bold">{profileForm.getValues("name") || "New User"}</h1>
                <p className="text-muted-foreground">{profileForm.getValues("email")}</p>
                <Badge variant="outline" className="mt-2">
                    <BadgeCheck className="mr-1 text-primary"/> Verified Student
                </Badge>
            </div>
        </div>
        <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Personal & College Information</CardTitle>
          <CardDescription>Update your personal and academic details here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input placeholder="Your email" {...field} disabled />
                            </FormControl>
                            <FormDescription>You cannot change your email address.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={profileForm.control}
                        name="collegeName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>College/University</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Sharda University" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={profileForm.control}
                        name="studentId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Student ID Number</FormLabel>
                            <FormControl>
                            <Input placeholder="Your student ID" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
               </div>
               <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>School & Verification</CardTitle>
            <CardDescription>Verify your student status to unlock exclusive features like ride-sharing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border p-4">
                <div>
                    <h3 className="font-semibold">Upload College ID</h3>
                    <p className="text-sm text-muted-foreground">Please upload a clear picture of your ID card.</p>
                </div>
                <Button variant="outline" onClick={() => toast({ title: "Feature coming soon!"})}>
                    <UploadCloud className="mr-2"/> Upload ID
                </Button>
            </div>
             <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border p-4">
                <div>
                    <h3 className="font-semibold">Start KYC Verification</h3>
                    <p className="text-sm text-muted-foreground">Complete a quick KYC for added security.</p>
                </div>
                <Button onClick={() => toast({ title: "Feature coming soon!"})}>
                    <BadgeCheck className="mr-2"/> Start KYC
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ride-Sharing Preferences</CardTitle>
          <CardDescription>Customize your ride-sharing experience.</CardDescription>
        </CardHeader>
         <Form {...ridePreferencesForm}>
            <form onSubmit={ridePreferencesForm.handleSubmit(onPreferencesSubmit)}>
                <CardContent className="space-y-6">
                    <FormField
                        control={ridePreferencesForm.control}
                        name="genderPreference"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Gender Preference</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="flex gap-4"
                                    >
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <RadioGroupItem value="any" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Any</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <RadioGroupItem value="female" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Female Only</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={ridePreferencesForm.control}
                        name="isSmokingAllowed"
                        render={({ field }) => (
                             <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <FormLabel>Smoking Preference</FormLabel>
                                    <FormDescription className="text-xs">Allow smoking in the car?</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={ridePreferencesForm.control}
                        name="isMusicAllowed"
                        render={({ field }) => (
                             <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <FormLabel>Music Preference</FormLabel>
                                    <FormDescription className="text-xs">Allow music in the car?</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit">Save Preferences</Button>
                </CardFooter>
            </form>
        </Form>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            For security, please choose a strong password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button type="submit">Update Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

       <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
           <CardDescription>
            Be careful! These actions are irreversible.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
           <AlertDialog>
            <AlertDialogTrigger asChild>
                 <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2" /> Delete Account
                 </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

    
