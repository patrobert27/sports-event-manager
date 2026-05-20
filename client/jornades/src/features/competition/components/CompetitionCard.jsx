import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Edit2, Trash2, MapPin, Users, Calendar } from "lucide-react";

import JornadaStatusBadge from "../../../components/ui/JornadaStatusBadge";
import RoleRule from "../../../components/auth/RoleRule";
import { ROLES } from "../../../constants/roles";
import { deleteCompetition } from "../competitionThunks";
import ConfirmModal from "../../../components/ui/ConfirmModal";

// aquesta card mostra una jornada concreta dins del llistat de competicions de l'escola
export default function CompetitionCard({ competition, onEdit }) {
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estat per controlar si el modal de confirmació d'esborrat està obert
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Agafem el color de l'activitat per pintar la vora de la targeta de forma dinàmica
  const activityColor = competition.activity?.color || "#4FA8F5";

  // Formatem la data per mostrar-la en format local (Català)
  const formattedDate = competition.date
    ? new Date(competition.date).toLocaleDateString("ca-ES")
    : "Sense data";

  const fieldName = competition.field?.name ?? "Sense pavelló assignat";

  // Navega cap a la pàgina de detall de la competició on hi ha els grups i partits
  const handleViewDetails = () => {
    navigate(`/jornades/${competition.id}`);
  };

  // Obre el modal de confirmació abans d'esborrar per no fer accions accidentals
  const handleOpenDeleteModal = (event) => {
    event.stopPropagation();

    setShowDeleteConfirm(true);
  };

  // Executa l'esborrat real quan l'usuari confirma al modal de seguretat
  const handleConfirmDelete = () => {
    dispatch(
      deleteCompetition(competition.id)
    );

    setShowDeleteConfirm(false);
  };

  // Obre el formulari d'edició (passant la competició al component pare)
  const handleEditClick = (event) => {
    event.stopPropagation();

    onEdit(competition);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 pl-5 pr-4 py-4 md:pl-6 md:pr-5 md:py-5 shadow-sm hover-lift premium-shadow animate-fade-in flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 overflow-hidden">
      
      {/* Barra lateral de color segons l'esport triat */}
      <div
        className="absolute left-0 top-0 h-full w-2 opacity-80"
        style={{
          backgroundColor: activityColor,
        }}
      />

      <div className="flex-1 w-full pl-0">
        
        {/* FILA SUPERIOR: Títol de la jornada i Botons d'acció de l'admin o alumne */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">
              {competition.name}
            </h4>

            <div className="flex items-center gap-2 mt-1.5">
              
              {/* Etiqueta de l'esport */}
              <span
                className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider"
                style={{
                  backgroundColor: activityColor,
                }}
              >
                {competition.activity?.name}
              </span>

              {/* Estat actual (Inscripció oberta, Fase de grups, Finalitzada) */}
              <JornadaStatusBadge 
                status={competition.status}
                registrationStart={competition.registration_start}
                registrationDeadline={competition.registration_deadline}
              />

            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            
            {/* Grilla principal de botons d'acció */}
            <div className="flex gap-2 w-full sm:w-auto flex-1 sm:flex-initial">
              
              <button
                onClick={handleViewDetails}
                className="flex-1 sm:flex-none sm:w-[140px] bg-primary/10 text-primary hover:bg-primary hover:text-white border border-transparent px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Veure Detalls
              </button>

              <RoleRule allowedRoles={[ROLES.ADMIN]}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/jornades/${competition.id}/equips`);
                  }}
                  className="flex-1 sm:flex-none sm:w-[140px] bg-white border border-primary/20 text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                  title="Gestionar Equips"
                >
                  <Users size={16} />
                  <span>Equips</span>
                </button>
              </RoleRule>

            </div>

            {/* Botons d'edició/esborrat per a l'administrador */}
            <RoleRule allowedRoles={[ROLES.ADMIN]}>
              <div className="flex items-center justify-end sm:justify-start gap-2 w-full sm:w-auto border-t sm:border-none border-gray-100 pt-3 sm:pt-0">
                <span className="text-[9px] font-black text-muted uppercase tracking-wider mr-auto sm:hidden">
                  Opcions de gestió
                </span>
                
                <button
                  onClick={handleEditClick}
                  className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm active:scale-95"
                  title="Editar Jornada"
                >
                  <Edit2 size={16} />
                </button>
                
                <button
                  onClick={handleOpenDeleteModal}
                  className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer bg-red-50 text-red-600 hover:bg-red-500 hover:text-white shadow-sm active:scale-95"
                  title="Eliminar Jornada"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </RoleRule>

          </div>
        </div>

        {/* FILA INFERIOR: Informació de localització, data i pistes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-3.5 border-t border-gray-100 text-xs sm:text-sm text-muted">
          
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-primary/60" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-primary/60" />
            <span className="truncate">{fieldName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={15} className="text-primary/60" />
            <span>{competition.available_courts} Pistes totals</span>
          </div>

        </div>

      </div>

      {/* Modal de confirmació d'esborrat per evitar desastres sense voler */}
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
