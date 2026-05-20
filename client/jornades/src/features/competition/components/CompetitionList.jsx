import React, { useState } from "react";
import CompetitionCard from "./CompetitionCard";
import EditCompetitionModal from "./EditCompetitionModal";
import { InfoAlert } from "../../../components/ui/Alerts";

// Aquest component s'encarrega de pintar la llista completa de targetes de jornades actives
export default function CompetitionList({ 
  competitions = [], 
  onEdit 
}) {
  
  // Guardem quina competició s'està editant actualment per obrir el modal
  const [editingCompetition, setEditingCompetition] = useState(null);

  // Si no hi ha cap competició per mostrar a la base de dades
  const isEmpty = !competitions || competitions.length === 0;

  if (isEmpty) {
    return (
      <InfoAlert 
        message="No s'ha trobat cap jornada que coincideixi amb el que estàs buscant." 
      />
    );
  }

  // Gestiona el clic al botó d'editar d'una de les targetes de jornada
  const handleEditClick = (competitionToEdit) => {
    
    // Si el component pare ja té una funció per editar (com a la pàgina de l'admin), la cridem
    const parentHasEditHandler = typeof onEdit === "function";

    if (parentHasEditHandler) {
      onEdit(competitionToEdit);
      return;
    }
    
    // Si no, guardem la competició aquí mateix per obrir el nostre propi modal intern de seguretat
    setEditingCompetition(competitionToEdit);
  };

  return (
    <>
      {/* Contenidor de la llista en format vertical (columna) */}
      <div className="flex flex-col gap-4 w-full">
        
        {competitions.map((singleCompetition) => {
          return (
            <CompetitionCard
              key={singleCompetition.id}
              competition={singleCompetition}
              onEdit={handleEditClick}
            />
          );
        })}

      </div>

      {/* 
          MODAL D'EDICIÓ INTERN:
          Només el mostrem si tenim una competició seleccionada (editingCompetition)
          i si el pare no s'està encarregant directament de l'edició.
      */}
      {!onEdit && editingCompetition && (
        <EditCompetitionModal
          competition={editingCompetition}
          onClose={() => {
            setEditingCompetition(null);
          }}
        />
      )}
    </>
  );
}
