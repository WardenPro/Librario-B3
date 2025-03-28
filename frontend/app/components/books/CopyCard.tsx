"use client";

import { useState } from "react";
import { Copy } from "./types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReservationDialog } from "./ReservationDialog";

type CopyCardProps = {
  copy: Copy;
  onDelete: (copyId: number) => Promise<void>;
};

export const CopyCard = ({ copy, onDelete }: CopyCardProps) => {
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "bon":
      case "good":
        return "bg-blue-100 text-blue-800";
      case "moyen":
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "mauvais":
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between items-start mb-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(
              copy.state
            )}`}
          >
            État: {copy.state}
          </span>
          <div className="flex gap-2">
            {copy.is_reserved && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-300"
              >
                Réservé
              </Badge>
            )}
            {copy.is_claimed && (
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-300"
              >
                Réclamé
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm mb-2">
          ID exemplaire: #{copy.copy_id}
        </p>
        {copy.review_condition &&
          copy.review_condition.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">
                Évaluations de l'état:
              </h4>
              <div className="flex flex-wrap gap-1">
                {copy.review_condition.map(
                  (condition, index) =>
                    condition &&
                    condition !== "null" && (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {condition}
                      </Badge>
                    )
                )}
              </div>
            </div>
          )}
        {!copy.is_reserved && !copy.is_claimed && (
          <Button
            variant="destructive"
            className="mt-2 w-full"
            onClick={() => onDelete(copy.copy_id)}
          >
            Supprimer cette copie
          </Button>
        )}

        {!copy.is_reserved && (
          <Button
            className="mt-4 w-full"
            onClick={() => setReservationDialogOpen(true)}
          >
            Réserver cette copie
          </Button>
        )}
      </Card>

      <ReservationDialog 
        isOpen={reservationDialogOpen}
        onOpenChange={setReservationDialogOpen}
        copyId={copy.copy_id}
        onSuccess={() => {
          // Fonction pour mettre à jour l'état local après réservation réussie
        }}
      />
    </>
  );
};