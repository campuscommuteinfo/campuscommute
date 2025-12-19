
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Ticket, ShoppingCart, Star, Utensils } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, runTransaction, collection, addDoc, serverTimestamp } from "firebase/firestore";

const rewards = [
  {
    title: "₹50 Ride Voucher",
    points: 200,
    brand: "Transport",
    icon: <Ticket className="size-5 text-primary" />,
    image: "https://images.unsplash.com/photo-1587135325273-adef4e88bc25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxidXMlMjB0aWNrZXR8ZW58MHx8fHwxNzU0MzkxMjA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    dataAiHint: "bus ticket",
  },
  {
    title: "₹100 Amazon Voucher",
    points: 500,
    brand: "Lifestyle",
    icon: <ShoppingCart className="size-5 text-blue-500" />,
    image: "https://images.unsplash.com/photo-1601598505513-7489a6272d2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxzaG9wcGluZyUyMGNhcnR8ZW58MHx8fHwxNzU0MzkxMjA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    dataAiHint: "shopping cart",
  },
    {
    title: "₹100 Blinkit Voucher",
    points: 500,
    brand: "Lifestyle",
    icon: <ShoppingCart className="size-5 text-green-500" />,
    image: "https://images.unsplash.com/photo-1537130508986-20f4fd870b4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxncm9jZXJ5JTIwYmFnfGVufDB8fHx8MTc1NDM5MTIwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    dataAiHint: "grocery bag",
  },
  {
    title: "Sharda Canteen Coupon",
    points: 300,
    brand: "Campus",
    icon: <Utensils className="size-5 text-red-500" />,
    image: "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmb29kJTIwcGxhdGV8ZW58MHx8fHwxNzU0MzkxMjA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    dataAiHint: "food plate",
  },
];

const badges: any[] = [
  // This would be fetched from a database in a real app
];


export default function Rewards() {
  const [userPoints, setUserPoints] = React.useState(0);
  const [user, setUser] = React.useState<any>(null);
  const [isRedeeming, setIsRedeeming] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserPoints(doc.data().points || 0);
          }
        });
        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);
  
  const handleRedeem = async (reward: typeof rewards[0]) => {
      if (!user) {
          toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to redeem rewards." });
          return;
      }
      if (userPoints < reward.points) {
           toast({ variant: "destructive", title: "Not Enough Points", description: `You need ${reward.points - userPoints} more points to redeem this.` });
           return;
      }
      
      setIsRedeeming(reward.title);

      try {
          const userDocRef = doc(db, "users", user.uid);
          const vouchersCollectionRef = collection(db, "redeemed_vouchers");

          await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userDocRef);
              if (!userDoc.exists()) {
                  throw "User document does not exist!";
              }

              const newPoints = (userDoc.data().points || 0) - reward.points;
              if (newPoints < 0) {
                  throw "Insufficient points.";
              }

              transaction.update(userDocRef, { points: newPoints });
              
              transaction.set(doc(vouchersCollectionRef), {
                  userId: user.uid,
                  title: reward.title,
                  points: reward.points,
                  redeemedAt: serverTimestamp(),
              });
          });

          toast({
              title: "🎉 Reward Redeemed! 🎉",
              description: `You've successfully redeemed the ${reward.title}.`,
          });

      } catch (error) {
          console.error("Redemption failed:", error);
          toast({ variant: "destructive", title: "Redemption Failed", description: "Something went wrong. Please try again." });
      } finally {
          setIsRedeeming(null);
      }
  }


  return (
    <Tabs defaultValue="redeem" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <TabsList>
          <TabsTrigger value="redeem">
            <Gift className="mr-2" /> Redeem Rewards
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Star className="mr-2" /> My Badges
          </TabsTrigger>
        </TabsList>
        <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground">Your Points</p>
            <p className="text-2xl font-bold text-primary">{userPoints.toLocaleString()} pts</p>
        </div>
      </div>

      <TabsContent value="redeem">
        {rewards.length === 0 ? (
          <Card className="flex items-center justify-center h-60">
            <CardContent className="text-center">
              <Gift className="mx-auto size-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No rewards available at the moment. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full">
                      <Image src={reward.image} alt={reward.title} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint={reward.dataAiHint} />
                      <div className="absolute bottom-2 right-2 p-2 bg-background/80 rounded-full shadow-lg">
                          {reward.icon}
                      </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between p-4">
                  <div>
                    <Badge variant="outline" className="mb-2">{reward.brand}</Badge>
                    <CardTitle className="text-lg">{reward.title}</CardTitle>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full" 
                    disabled={userPoints < reward.points || isRedeeming !== null}
                    onClick={() => handleRedeem(reward)}
                  >
                    {isRedeeming === reward.title ? 'Redeeming...' : `Redeem for ${reward.points} pts`}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="badges">
        {badges.length === 0 ? (
            <Card className="flex items-center justify-center h-60">
                <CardContent className="text-center">
                <Star className="mx-auto size-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">You haven't earned any badges yet. Keep commuting!</p>
                </CardContent>
            </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badges.map((badge: any, index) => (
              <Card key={index} className={`transition-opacity ${!badge.unlocked ? 'opacity-50' : ''}`}>
                <CardContent className="flex flex-col items-center text-center p-6">
                  <div className="relative mb-4">
                      <Image src={badge.icon} alt={badge.title} width={80} height={80} className="rounded-full" data-ai-hint={badge.dataAiHint} />
                      {badge.unlocked && <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1"><Star className="size-4 text-white fill-white" /></div>}
                  </div>
                  <CardTitle className="text-md">{badge.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{badge.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
