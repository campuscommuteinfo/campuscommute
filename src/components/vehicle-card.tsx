"use client";

import * as React from "react";
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
import { Bus, CarFront, Users, Clock, Info, Award, UserPlus, X, AlertCircle, Sparkles, ChevronUp } from "lucide-react";
import { predictBusCrowdLevels, PredictBusCrowdLevelsOutput } from "@/ai/flows/predict-bus-crowd-levels";
import { explainBusDelay } from "@/ai/flows/explain-bus-delays";
import { cn } from "@/lib/utils";
import { type Vehicle } from "@/lib/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  addPoints: (amount: number, title: string, description: string) => void;
  onClose: () => void;
}

const hasApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NEXT_PUBLIC_GEMINI_API_KEY !== "YOUR_API_KEY";

// Crowd level badge component
const CrowdBadge = ({ level }: { level: string | undefined }) => {
  const variants = {
    Green: "bg-green-500 text-white",
    Yellow: "bg-yellow-500 text-white",
    Red: "bg-red-500 text-white",
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-semibold",
      variants[level as keyof typeof variants] || "bg-gray-200 text-gray-600"
    )}>
      {level || "Unknown"}
    </span>
  );
};

// Info row component
const InfoRow = ({ icon: Icon, label, value, valueComponent }: {
  icon: React.ElementType;
  label: string;
  value?: string;
  valueComponent?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    {valueComponent || <span className="text-sm font-semibold text-gray-800 dark:text-white">{value}</span>}
  </div>
);

// Action button component
const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default"
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "default" | "primary";
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl transition-all active:scale-95",
      variant === "primary"
        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
    )}
  >
    <Icon className="w-6 h-6" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default function VehicleCard({ vehicle, addPoints, onClose }: VehicleCardProps) {
  const [crowdPrediction, setCrowdPrediction] = React.useState<PredictBusCrowdLevelsOutput | null>(null);
  const [delayExplanation, setDelayExplanation] = React.useState<string | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = React.useState(true);
  const [isLoadingExplanation, setIsLoadingExplanation] = React.useState(false);
  const [isDelayDialogOpen, setIsDelayDialogOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

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
      setDelayExplanation("AI features are disabled. Please configure your Gemini API key.");
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
      setDelayExplanation("Sorry, we couldn't fetch delay information right now.");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  return (
    <>
      {/* Mobile-optimized Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {vehicle.type === "bus" ? (
                  <Bus className="w-6 h-6 text-white" />
                ) : (
                  <CarFront className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{vehicle.route}</h3>
                <p className="text-white/80 text-sm capitalize">{vehicle.type} • On Time</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:bg-white/30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Crowd status */}
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm">Current Crowd</span>
            </div>
            <CrowdBadge level={vehicle.crowdLevel} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* AI Prediction Section */}
          {vehicle.type === "bus" && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800 dark:text-white">AI Predictions</span>
              </div>

              {isLoadingPrediction ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ) : !hasApiKey ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Configure Gemini API key to enable AI predictions
                  </p>
                </div>
              ) : crowdPrediction && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Predicted Crowd</span>
                    <CrowdBadge level={crowdPrediction.crowdLevel} />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {crowdPrediction.explanation}
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 h-10 rounded-xl text-sm"
                onClick={handleExplainDelay}
              >
                <Info className="w-4 h-4 mr-2" /> Why might there be delays?
              </Button>
            </div>
          )}

          {/* Expandable Details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-500"
          >
            <span>More Details</span>
            <ChevronUp className={cn("w-4 h-4 transition-transform", !isExpanded && "rotate-180")} />
          </button>

          {isExpanded && (
            <div className="space-y-1 animate-fade-in">
              <InfoRow icon={Clock} label="ETA" value="2 min" />
              <InfoRow icon={Users} label="Capacity" value="42 seats" />
              <InfoRow
                icon={Users}
                label="Crowd Level"
                valueComponent={<CrowdBadge level={vehicle.crowdLevel} />}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <ActionButton
              icon={Award}
              label="Track Ride"
              onClick={() => addPoints(10, "+10 Points!", "For tracking your ride.")}
              variant="primary"
            />
            <ActionButton
              icon={UserPlus}
              label="Report Crowd"
              onClick={() => { }}
            />
            <ActionButton
              icon={Users}
              label="Share Ride"
              onClick={() => { }}
            />
          </div>
        </div>
      </div>

      {/* Delay Explanation Dialog */}
      <Dialog open={isDelayDialogOpen} onOpenChange={setIsDelayDialogOpen}>
        <DialogContent className="mx-4 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-500" />
              Delay Information
            </DialogTitle>
            <DialogDescription>
              AI-powered analysis for {vehicle.route}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingExplanation ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {delayExplanation}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
