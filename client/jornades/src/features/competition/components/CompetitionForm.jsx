// 1. Imports de biblioteques
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

// 2. Imports d'accions (Thunks)
import {
  createCompetition,
  updateCompetition,
  loadActivities,
  loadFields
} from "../competitionThunks";

// 3. Imports de selectors
import {
  selectCompetitionActivities,
  selectCompetitionFields
} from "../competitionSelectors";

/**
 * COMPONENT: CompetitionForm
 * 
 * Aquest component és un formulari "intel·ligent" que serveix tant per crear
 * com per editar jornades esportives.
 * Utilitza 'react-hook-form' per gestionar les validacions i l'estat dels camps.
 */

// --- Helpers per formatar dates per als inputs HTML ---

/**
 * Converteix una data de la base de dades a format YYYY-MM-DD
 */
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

/**
 * Converteix una data a format YYYY-MM-DDTHH:MM (per a datetime-local)
 */
const formatDateTimeForInput = (dateString) => {
  if (!dateString) {
    return "";
  }
  
  const dateObject = new Date(dateString);
  
  if (isNaN(dateObject.getTime())) {
    return "";
  }
  
  // Tallem la cadena per quedar-nos només fins als minuts
  return dateObject.toISOString().slice(0, 16);
};


export default function CompetitionForm({
  initialData,
  onSuccess,
  onCancel,
  isEdit = false
}) {
  // --- 2. Hooks ---
  
  const dispatch = useDispatch();

  // Obtenim la llista d'activitats i camps de Redux
  const activitiesList = useSelector(selectCompetitionActivities);
  const fieldsList = useSelector(selectCompetitionFields);


  // --- 3. Efectes de càrrega inicial ---

  /**
   * Carreguem les metadades (esports i camps) si encara no les tenim a Redux.
   * Això ens permet omplir els <select> del formulari.
   */
  useEffect(() => {
    if (activitiesList.length === 0) {
      dispatch(
        loadActivities()
      ).catch((error) => {
        console.error("No s'han pogut carregar les activitats:", error);
      });
    }

    if (fieldsList.length === 0) {
      dispatch(
        loadFields()
      ).catch((error) => {
        console.error("No s'han pogut carregar els camps:", error);
      });
    }
  }, [dispatch, activitiesList.length, fieldsList.length]);


  // --- 4. Configuració del Formulari ---

  /**
   * Calculem els valors per defecte basant-nos en si estem editant o creant.
   * Fem servir useMemo per no tornar-ho a calcular si initialData no canvia.
   */
  const formDefaultValues = useMemo(() => {
    return {
      name: initialData?.name || "",
      date: formatDateForInput(initialData?.date),
      start_time: initialData?.start_time || "",
      status: initialData?.status || "REGISTRATION",
      registration_start: formatDateTimeForInput(initialData?.registration_start || new Date()),
      registration_deadline: formatDateTimeForInput(initialData?.registration_deadline),
      available_courts: initialData?.available_courts || 1,
      activity_id: initialData?.activity_id || initialData?.activity?.id || "",
      field_id: initialData?.field_id || initialData?.field?.id || "",
    };
  }, [initialData]);

  // Inicialitzem react-hook-form
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

  /**
   * Si les dades inicials canvien (per exemple, s'ha carregat la competició
   * de la base de dades després d'obrir el modal), reiniciem el formulari.
   */
  useEffect(() => {
    if (initialData) {
      reset(formDefaultValues);
    }
  }, [initialData, reset, formDefaultValues]);


  // --- 5. Handlers ---

  /**
   * Funció que s'executa en prémer el botó de "Desar".
   */
  const handleFormSubmit = async (formData) => {
    try {
      // Preparem el payload netejant els tipus de dades (strings a números)
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
      };

      if (isEdit) {
        // Mode EDICIÓ
        await dispatch(
          updateCompetition(initialData.id, submitPayload)
        );
      } else {
        // Mode CREACIÓ
        await dispatch(
          createCompetition(submitPayload)
        );
      }

      // Si ens han passat una funció onSuccess (ex: tancar el modal), la cridem
      if (onSuccess) {
        onSuccess();
      }

      // Si era una creació, buidem el formulari
      if (!isEdit) {
        reset();
      }

    } catch (err) {
      console.error("Error en processar el formulari:", err);
    }
  };


  // --- 6. Renderitzat (JSX) ---

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className="space-y-5"
    >
      {/* SECCIÓ: NOM */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-dark">
          Nom de la competició *
        </label>
        <input
          {...register("name", { 
            required: "El nom és obligatori",
            minLength: { 
              value: 5, 
              message: "El nom ha de tenir almenys 5 caràcters" 
            },
            maxLength: { 
              value: 100, 
              message: "El nom és massa llarg (màxim 100)" 
            }
          })}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder="Ex: Torneig de Primavera 2024"
        />
        {errors.name && (
          <p className="text-danger text-xs mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* SECCIÓ: DATA I HORA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-dark">
            Data de l'esdeveniment *
          </label>
          <input
            type="date"
            {...register("date", { 
              required: "La data és obligatòria",
              validate: (value) => {
                // Si estem editant, no bloquegem si la data ja va passar
                if (isEdit) {
                  return true;
                }
                
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const isFutureDate = selectedDate >= today;
                return isFutureDate || "La data no pot ser anterior a avui";
              }
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {errors.date && (
            <p className="text-danger text-xs mt-1">
              {errors.date.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-dark">
            Hora d'inici *
          </label>
          <input
            type="time"
            {...register("start_time", { 
              required: "L'hora és obligatòria" 
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {errors.start_time && (
            <p className="text-danger text-xs mt-1">
              {errors.start_time.message}
            </p>
          )}
        </div>

      </div>

      {/* SECCIÓ: ESPORT I PAVELLÓ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-dark">
            Esport / Activitat *
          </label>
          <select
            {...register("activity_id", { 
              required: "Selecciona un esport" 
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">
              Selecciona una activitat...
            </option>
            {activitiesList.map((singleActivity) => {
              return (
                <option 
                  key={singleActivity.id} 
                  value={singleActivity.id}
                >
                  {singleActivity.name}
                </option>
              );
            })}
          </select>
          {errors.activity_id && (
            <p className="text-danger text-xs mt-1">
              {errors.activity_id.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-dark">
            Pavelló / Camp *
          </label>
          <select
            {...register("field_id", { 
              required: "Selecciona un camp" 
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">
              Selecciona una instal·lació...
            </option>
            {fieldsList.map((singleField) => {
              return (
                <option 
                  key={singleField.id} 
                  value={singleField.id}
                >
                  {singleField.name}
                </option>
              );
            })}
          </select>
          {errors.field_id && (
            <p className="text-danger text-xs mt-1">
              {errors.field_id.message}
            </p>
          )}
        </div>

      </div>

      {/* SECCIÓ: PLACES I INSCRIPCIÓ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="space-y-1.5 col-span-1 sm:col-span-2">
            <label className="block text-sm font-semibold text-dark">
              Pistes disponibles *
            </label>
            <input
                type="number"
                {...register("available_courts", {
                  required: "Les pistes són obligatòries",
                  valueAsNumber: true,
                  min: { 
                    value: 1, 
                    message: "Com a mínim ha d'haver-hi 1 pista" 
                  },
                  max: { 
                    value: 20, 
                    message: "Màxim 20 pistes permeses" 
                  }
                })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {errors.available_courts && (
              <p className="text-danger text-xs mt-1">
                {errors.available_courts.message}
              </p>
            )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-dark">
            Inici d'inscripció *
          </label>
          <input
            type="datetime-local"
            {...register("registration_start", {
              required: "La data d'inici és obligatòria"
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {errors.registration_start && (
            <p className="text-danger text-xs mt-1">
              {errors.registration_start.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-dark">
            Límit d'inscripció *
          </label>
          <input
            type="datetime-local"
            {...register("registration_deadline", {
              required: "La data límit és obligatòria",
              validate: (value, formValues) => {
                if (!value) {
                  return true;
                }
                
                const deadlineDate = new Date(value);
                
                // El tancament ha de ser abans de que comenci la jornada
                if (formValues.date) {
                  const eventDate = new Date(formValues.date);
                  if (deadlineDate > eventDate) {
                    return "El tancament ha de ser abans de l'esdeveniment";
                  }
                }

                // El tancament ha de ser després de que obrin les inscripcions
                if (formValues.registration_start) {
                    const startDate = new Date(formValues.registration_start);
                    if (deadlineDate <= startDate) {
                      return "El tancament ha de ser posterior a l'inici";
                    }
                }

                return true;
              }
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {errors.registration_deadline && (
            <p className="text-danger text-xs mt-1">
              {errors.registration_deadline.message}
            </p>
          )}
        </div>

      </div>

      {/* SECCIÓ: ESTAT (Només apareix en mode edició) */}
      {isEdit && (
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-dark">
            Estat actual de la Jornada
          </label>
          <select
            {...register("status")}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="REGISTRATION">Inscripció</option>
            <option value="GROUP_STAGE">Fase de grups</option>
            <option value="SEMIFINALS">Semifinals</option>
            <option value="FINAL_STAGE">Final</option>
            <option value="FINISHED">Finalitzada</option>
          </select>
        </div>
      )}

      {/* BOTONS D'ACCIÓ */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-50">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:shadow-none cursor-pointer"
        >
          {isSubmitting ? "Desant dades..." : isEdit ? "Actualitzar Jornada" : "Crear Competició"}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-dark font-semibold hover:bg-gray-50 transition-all cursor-pointer text-center"
        >
          Cancel·lar
        </button>
      </div>

    </form>
  );
}
