
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bus, CarFront, Users, Clock, Info, Award, UserPlus, X, AlertCircle } from "lucide-react";
import { predictBusCrowdLevels, PredictBusCrowdLevelsOutput } from "@/ai/flows/predict-bus-crowd-levels";
import { explainBusDelay } from "@/ai/flows/explain-bus-delays";

import { type Vehicle } from "@/lib/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  addPoints: (amount: number, title: string, description: string) => void;
  onClose: () => void;
}

const hasApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NEXT_PUBLIC_GEMINI_API_KEY !== "YOUR_API_KEY";

export default function VehicleCard({ vehicle, addPoints, onClose }: VehicleCardProps) {
  const [crowdPrediction, setCrowdPrediction] = React.useState<PredictBusCrowdLevelsOutput | null>(null);
  const [delayExplanation, setDelayExplanation] = React.useState<string | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = React.useState(true);
  const [isLoadingExplanation, setIsLoadingExplanation] = React.useState(false);
  const [isDelayDialogOpen, setIsDelayDialogOpen] = React.useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = React.useState(false);


  React.useEffect(() => {
    async function getCrowdPrediction() {
      if (vehicle.type !== "bus" || !hasApiKey) {
        setIsLoadingPrediction(false);
        return;
      }
      setIsLoadingPrediction(true);
      try {
        const now = new Date();
        const prediction = await predictBusCrowdLevels({
          routeId: vehicle.route,
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        });
        setCrowdPrediction(prediction);
      } catch (error) {
        console.error("Failed to predict crowd levels:", error);
      } finally {
        setIsLoadingPrediction(false);
      }
    }
    getCrowdPrediction();
  }, [vehicle]);

  const handleExplainDelay = async () => {
    if (!hasApiKey) {
        setIsDelayDialogOpen(true);
        setIsLoadingExplanation(false);
        setDelayExplanation("This AI feature is disabled. Please configure your Gemini API key in the .env file to enable it.");
        return;
    }
    setIsDelayDialogOpen(true);
    setIsLoadingExplanation(true);
    try {
      const explanation = await explainBusDelay({
        route: vehicle.route,
        stop: "Knowledge Park II Metro",
      });
      setDelayExplanation(explanation.explanation);
    } catch (error) {
      console.error("Failed to explain delay:", error);
      setDelayExplanation("Sorry, we couldn't fetch the reason for the delay right now. The AI model may be temporarily unavailable.");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const getCrowdBadgeVariant = (level: string | undefined) => {
    switch (level) {
      case "Green":
        return "bg-green-500 hover:bg-green-500 text-white";
      case "Yellow":
        return "bg-yellow-500 hover:bg-yellow-500 text-white";
      case "Red":
        return "bg-red-500 hover:bg-red-500 text-white";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                      {vehicle.type === "bus" ? (
                          <Bus className="size-6 text-primary" />
                      ) : (
                          <CarFront className="size-6 text-accent" />
                      )}
                  </div>
                  <div>
                      <CardTitle className="capitalize">{vehicle.type} {vehicle.route}</CardTitle>
                      <CardDescription>Status: On time</CardDescription>
                  </div>
              </div>
              <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={onClose}>
                  <X className="size-4" />
              </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Crowdsourced Info</h4>
            <Alert>
                <Users className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>Reported Crowd Level</span> 
                  <Badge className={getCrowdBadgeVariant(vehicle.crowdLevel)}>{vehicle.crowdLevel || "N/A"}</Badge>
                </AlertTitle>
                <AlertDescription>This is the real-time crowd level reported by other students.</AlertDescription>
            </Alert>
          </div>

          {vehicle.type === "bus" && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">AI Predictions</h4>
              {isLoadingPrediction ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : !hasApiKey ? (
                 <Alert variant="default" className="border-amber-500/50 text-amber-600 dark:text-amber-500 [&>svg]:text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>AI Features Disabled</AlertTitle>
                    <AlertDescription>
                        Set your Gemini API key to enable predictions.
                    </AlertDescription>
                 </Alert>
              ) : crowdPrediction && (
                  <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>AI Predicted Crowd</span> 
                        <Badge className={getCrowdBadgeVariant(crowdPrediction.crowdLevel)}>{crowdPrediction.crowdLevel}</Badge>
                      </AlertTitle>
                      <AlertDescription>{crowdPrediction.explanation}</AlertDescription>
                  </Alert>
              )}
              <Button variant="outline" size="sm" className="w-full" onClick={handleExplainDelay}>
                <Info className="mr-2" /> Why might there be a delay?
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
              <h4 className="font-semibold text-sm">Earn Points</h4>
              <div className="grid grid-cols-2 gap-2">
                  <Button
                      variant="secondary"
                      onClick={() => addPoints(10, "+10 Points!", "For tracking your ride.")}
                  >
                      <Award className="mr-2 text-primary"/> Track Ride
                  </Button>
                  <Button
                      variant="secondary"
                      onClick={() => {
                        // TODO: Implement crowd reporting
                      }}
                  >
                      <UserPlus className="mr-2 text-accent"/> Report Crowd
                  </Button>
              </div>
          </div>

        </CardContent>
        <CardFooter>
          <Button className="w-full">
            Start Ride Sharing
          </Button>
        </CardFooter>
      </Card>

      {/* Delay Explanation Dialog */}
      <Dialog open={isDelayDialogOpen} onOpenChange={setIsDelayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Delay Explanation for Bus {vehicle.route}</DialogTitle>
            <DialogDescription>
              Here are the potential reasons for any delays on this route based on current conditions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingExplanation ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : (
                <p className="text-sm leading-relaxed">{delayExplanation}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
