import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import {
  createCompetition,
  updateCompetition,
  loadActivities,
  loadFields
} from "../competitionThunks";

import {
  selectCompetitionActivities,
  selectCompetitionFields
} from "../competitionSelectors";

// --- Helpers per formatar dates per als inputs HTML ---
const formatDateForInput = (dateString) => {
  if (!dateString) {
    return "";
  }
  const dateObject = new Date(dateString);
  if (isNaN(dateObject.getTime())) {
    return "";
  }
  return dateObject.toISOString().split("T")[0];
};

const formatDateTimeForInput = (dateString) => {
  if (!dateString) {
    return "";
  }
  const dateObject = new Date(dateString);
  if (isNaN(dateObject.getTime())) {
    return "";
  }
  return dateObject.toISOString().slice(0, 16);
};

// Aquest formulari intel·ligent permet crear una jornada o bé editar-la si ja existeix
export default function CompetitionForm({
  initialData,
  onSuccess,
  onCancel,
  isEdit = false
}) {
  const dispatch = useDispatch();
  const activitiesList = useSelector(selectCompetitionActivities);
  const fieldsList = useSelector(selectCompetitionFields);

  // demanem els esports i les pistes disponibles un cop s'obre el formulari del profe
  useEffect(() => {
    if (activitiesList.length === 0) {
      dispatch(loadActivities()).catch(console.error);
    }
    if (fieldsList.length === 0) {
      dispatch(loadFields()).catch(console.error);
    }
  }, [dispatch, activitiesList.length, fieldsList.length]);

  // preparem els valors per defecte de l'esdeveniment a Redux
  const formDefaultValues = useMemo(() => {
    return {
      name: initialData?.name || "",
      date: formatDateForInput(initialData?.date),
      start_time: initialData?.start_time || "",
      status: initialData?.status || "REGISTRATION",
      registration_start: formatDateTimeForInput(initialData?.registration_start || new Date()),
      registration_deadline: formatDateTimeForInput(initialData?.registration_deadline),
      available_courts: initialData?.available_courts || 1,
      match_duration: initialData?.match_duration || 30,
      matches_start_time: initialData?.matches_start_time || initialData?.start_time || "",
      activity_id: initialData?.activity_id || initialData?.activity?.id || "",
      field_id: initialData?.field_id || initialData?.field?.id || "",
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { 
      errors, 
      isSubmitting 
    },
  } = useForm({
    mode: "onChange",
    defaultValues: formDefaultValues
  });

  // si es canvien les dades inicials, resetejem el formulari
  useEffect(() => {
    if (initialData) {
      reset(formDefaultValues);
    }
  }, [initialData, reset, formDefaultValues]);

  // handler de submit per processar i desar la informació de les jornades
  const handleFormSubmit = async (formData) => {
    try {
      const submitPayload = {
        ...formData,
        available_courts: Number(formData.available_courts),
        activity_id: Number(formData.activity_id),
        field_id: formData.field_id ? Number(formData.field_id) : null,
        status: isEdit ? formData.status : "REGISTRATION",
        date: formData.date || null,
        registration_start: formData.registration_start || null,
        registration_deadline: formData.registration_deadline || null,
        start_time: formData.start_time || null,
        match_duration: Number(formData.match_duration),
        matches_start_time: formData.matches_start_time || null,
      };

      if (isEdit) {
        await dispatch(
          updateCompetition(initialData.id, submitPayload)
        );
      } else {
        await dispatch(
          createCompetition(submitPayload)
        );
      }

      if (onSuccess) {
        onSuccess();
      }
      
      if (!isEdit) {
        reset();
      }
      
    } catch (err) {
      console.error("Error al desar la jornada:", err);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className="space-y-3.5 animate-fade-in"
    >
      
      {/* SECCIÓ: NOM DE LA COMPETICIÓ */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-dark">
          Nom de la competició *
        </label>
        
        <input
          {...register("name", { 
            required: "El nom és obligatori",
            minLength: { value: 5, message: "Mínim 5 caràcters" }
          })}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="Ex: Torneig de Primavera 2024"
        />
        
        {errors.name && (
          <p className="text-danger text-xs mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* SECCIÓ: DATA I HORA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-dark">
            Data de l'esdeveniment *
          </label>
          
          <input
            type="date"
            {...register("date", { 
              required: "La data és obligatòria" 
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
          
          {errors.date && (
            <p className="text-danger text-xs mt-1">
              {errors.date.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-dark">
            Hora d'inici *
          </label>
          
          <input
            type="time"
            {...register("start_time", { 
              required: "L'hora és obligatòria" 
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

      </div>

      {/* SECCIÓ: ESPORT I PAVELLÓ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-dark">
            Esport / Activitat *
          </label>
          
          <select
            {...register("activity_id", { 
              required: "Selecciona un esport" 
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
          >
            <option value="">Selecciona...</option>
            {activitiesList.map((a) => {
              return (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              );
            })}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-dark">
            Pavelló / Camp *
          </label>
          
          <select
            {...register("field_id", { 
              required: "Selecciona un camp" 
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
          >
            <option value="">Selecciona...</option>
            {fieldsList.map((f) => {
              return (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              );
            })}
          </select>
        </div>

      </div>

      {/* SECCIÓ: CONFIGURACIÓ DE PARTITS */}
      <div className="bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100/60 space-y-2">
        
        <h4 className="text-[10px] font-black text-muted uppercase tracking-widest">
          Configuració de Partits
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-dark">
              Durada (minuts) *
            </label>
            
            <input
              type="number"
              {...register("match_duration", { 
                required: true, 
                min: 5 
              })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-dark">
              Hora primer partit *
            </label>
            
            <input
              type="time"
              {...register("matches_start_time", { 
                required: true 
              })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

        </div>
      </div>

      {/* SECCIÓ: PISTES I ESTAT (Agrupats en 2 columnes per estalviar espai vertical) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-dark">
            Pistes disponibles *
          </label>
          
          <input
            type="number"
            {...register("available_courts", { 
              required: true, 
              min: 1 
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {isEdit ? (
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-dark">
              Estat actual
            </label>
            
            <select 
              {...register("status")} 
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="REGISTRATION">Inscripció</option>
              <option value="GROUP_STAGE">Fase de grups</option>
              <option value="SEMIFINALS">Semifinals</option>
              <option value="FINAL_STAGE">Final</option>
              <option value="FINISHED">Finalitzada</option>
            </select>
          </div>
        ) : (
          <div className="hidden sm:block opacity-0 select-none pointer-events-none" />
        )}

      </div>

      {/* SECCIÓ: DATES D'INSCRIPCIÓ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-dark">
            Inici d'inscripció *
          </label>
          
          <input
            type="datetime-local"
            {...register("registration_start", { 
              required: "Obligatori" 
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          
          {errors.registration_start && (
            <p className="text-danger text-xs mt-1">
              {errors.registration_start.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-dark">
            Límit d'inscripció *
          </label>
          
          <input
            type="datetime-local"
            {...register("registration_deadline", { 
              required: "Obligatori" 
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

      </div>

      {/* BOTONS DEL FORMULARI */}
      <div className="flex flex-row items-center gap-3 pt-4 border-t border-gray-100 w-full">
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary text-white font-black px-4 py-2.5 rounded-xl hover-lift shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm truncate"
        >
          {isSubmitting ? "Processant..." : isEdit ? "Actualitzar" : "Crear"}
        </button>
        
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2.5 bg-gray-50 text-muted hover:text-dark font-bold rounded-xl hover:bg-gray-100 transition-all cursor-pointer active:scale-[0.98] text-sm shrink-0"
        >
          Cancel·lar
        </button>

      </div>
    </form>
  );
}
