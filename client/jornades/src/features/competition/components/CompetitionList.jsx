// 1. Imports de biblioteques
import React, { useState } from "react";

// 2. Imports de components propis
import CompetitionCard from "./CompetitionCard";
import EditCompetitionModal from "./EditCompetitionModal";
import { InfoAlert } from "../../../components/ui/Alerts";

/**
 * COMPONENT: CompetitionList
 * 
 * Aquest component s'encarrega de pintar una llista de targetes (CompetitionCard).
 * Si la llista està buida, mostra un missatge d'avís informatiu.
 * També pot gestionar el modal d'edició si el component pare no ho fa.
 */
export default function CompetitionList({ 
  competitions = [], 
  onEdit 
}) {
  // --- 2. Hooks ---

  // Guardem quina competició s'està editant actualment per obrir el modal
  const [editingCompetition, setEditingCompetition] = useState(null);


  // --- 3. Renderitzats condicionals ---

  // Si no hi ha cap competició per mostrar...
  const isEmpty = !competitions || competitions.length === 0;

  if (isEmpty) {
    return (
      <InfoAlert 
        message="No s'ha trobat cap jornada que coincideixi amb el que estàs buscant." 
      />
    );
  }


  // --- 4. Funcions / Handlers ---

  /**
   * Gestiona el clic al botó d'editar d'una de les targetes.
   */
  const handleEditClick = (competitionToEdit) => {
    // Si el component que ens fa servir (el pare) ja té una funció per editar, la cridem
    const parentHasEditHandler = typeof onEdit === "function";

    if (parentHasEditHandler) {
      onEdit(competitionToEdit);
      return;
    }
    
    // Si no, guardem la competició aquí mateix per obrir el nostre propi modal
    setEditingCompetition(competitionToEdit);
  };


  // --- 5. Render (JSX) ---

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
          MODAL D'EDICIÓ:
          Només el mostrem si tenim una competició seleccionada (editingCompetition)
          i si el pare no s'està encarregant de l'edició.
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
