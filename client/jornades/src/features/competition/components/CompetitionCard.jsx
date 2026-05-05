// 1. Imports de biblioteques
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Edit2, Trash2, MapPin, Users, Calendar } from "lucide-react";

// 2. Imports de components i dades
import JornadaStatusBadge from "../../../components/ui/JornadaStatusBadge";
import RoleRule from "../../../components/auth/RoleRule";
import { ROLES } from "../../../constants/roles";
import { deleteCompetition } from "../competitionThunks";
import ConfirmModal from "../../../components/ui/ConfirmModal";

/**
 * COMPONENT: CompetitionCard
 * 
 * Aquesta targeta mostra un resum d'una jornada esportiva.
 * Inclou el nom, l'esport, la data, el lloc i l'estat actual.
 * També permet editar o esborrar la jornada si l'usuari és administrador.
 */
export default function CompetitionCard({ competition, onEdit }) {
  // --- 2. Hooks ---
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Estat per controlar si el modal de confirmació d'esborrat està obert
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  // --- 3. Variables derivades ---
  
  // Agafem el color de l'activitat per pintar la vora de la targeta
  const activityColor = competition.activity?.color || "#4FA8F5";
  
  // Formatem la data per mostrar-la en format local (Català)
  const formattedDate = competition.date 
    ? new Date(competition.date).toLocaleDateString("ca-ES") 
    : "Sense data";

  const fieldName = competition.field?.name ?? "Sense pavelló assignat";


  // --- 4. Funcions / Handlers ---

  /**
   * Navega cap a la pàgina de detall de la competició.
   */
  const handleViewDetails = () => {
    navigate(
      `/jornades/competicions/${competition.id}`
    );
  };

  /**
   * Obre el modal de confirmació abans d'esborrar.
   */
  const handleOpenDeleteModal = (event) => {
    // Evitem que el clic es propagui a la resta de la targeta
    event.stopPropagation();
    
    setShowDeleteConfirm(true);
  };

  /**
   * Executa l'esborrat real quan l'usuari confirma al modal.
   */
  const handleConfirmDelete = () => {
    // Cridem al thunk d'esborrat
    dispatch(
      deleteCompetition(competition.id)
    );
    
    // Tanquem el modal
    setShowDeleteConfirm(false);
  };

  /**
   * Obre el formulari d'edició (passant la competició al component pare).
   */
  const handleEditClick = (event) => {
    event.stopPropagation();
    
    // Cridem a la funció onEdit que ens ve per props des del pare
    onEdit(competition);
  };


  // --- 5. Render (JSX) ---

  return (
    <div className="group relative bg-white rounded-2xl border border-primary/5 p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center gap-4 md:gap-6 overflow-hidden">
      
      {/* Barra lateral de color segons l'esport */}
      <div
        className="absolute left-0 top-0 h-full w-2 opacity-80"
        style={{ 
          backgroundColor: activityColor 
        }}
      />

      <div className="flex-1 w-full pl-2 md:pl-4">
        
        {/* FILA SUPERIOR: Títol i Botons d'acció */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          
          <div>
            <h4 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">
              {competition.name}
            </h4>
            
            <div className="flex items-center gap-2 mt-1">
              {/* Etiqueta de l'esport */}
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ 
                  backgroundColor: activityColor 
                }}
              >
                {competition.activity?.name}
              </span>
              
              {/* Estat actual (Inscripció, Finalitzada, etc.) */}
              <JornadaStatusBadge 
                status={competition.status} 
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botó principal per veure detalls */}
            <button
              onClick={handleViewDetails}
              className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              Veure Detalls
            </button>

            {/* Icones d'administració (només visibles per Admins) */}
            <RoleRule 
              allowedRoles={[ROLES.ADMIN]}
            >
              <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button
                  onClick={handleEditClick}
                  className="p-2 text-muted hover:text-primary hover:bg-white rounded-lg transition-all cursor-pointer"
                  title="Editar Jornada"
                >
                  <Edit2 
                    size={18} 
                  />
                </button>
                <button
                  onClick={handleOpenDeleteModal}
                  className="p-2 text-muted hover:text-danger hover:bg-white rounded-lg transition-all cursor-pointer"
                  title="Eliminar Jornada"
                >
                  <Trash2 
                    size={18} 
                  />
                </button>
              </div>
            </RoleRule>
          </div>

        </div>

        {/* FILA INFERIOR: Informació de lloc, data i pistes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-50 text-sm text-muted">
          
          <div className="flex items-center gap-2">
            <Calendar 
              size={16} 
              className="text-primary/60" 
            />
            <span>
              {formattedDate}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin 
              size={16} 
              className="text-primary/60" 
            />
            <span className="truncate">
              {fieldName}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users 
              size={16} 
              className="text-primary/60" 
            />
            <span>
              {competition.available_courts} Pistes totals
            </span>
          </div>

        </div>

      </div>

      {/* Modal de confirmació d'esborrat (es manté amagat fins que showDeleteConfirm és true) */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Eliminar Jornada"
        message={`Estàs segur que vols eliminar la jornada "${competition.name}" definitivament? Aquesta acció no es pot desfer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
        }}
      />

    </div>
  );
}
