import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { loadTeachers, createTeam } from "../teamThunks";

/**
 * CreateTeamModal - Smart Component
 * Gestiona la seva pròpia càrrega de dades (professors) i la creació de l'equip.
 */
export default function CreateTeamModal({ competitionId, onClose }) {
  const dispatch = useDispatch();
  const [teachers, setTeachers] = useState([]);
  const [localError, setLocalError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      teacher_id: "",
      primary_color: "#000000",
      secondary_color: "#ffffff",
      shield: ""
    }
  });

  // Carrega de professors autònoma
  useEffect(() => {
    dispatch(loadTeachers()).then(setTeachers);
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        competition_id: parseInt(competitionId),
        teacher_id: data.teacher_id ? parseInt(data.teacher_id) : null
      };

      await dispatch(createTeam(payload, competitionId));
      onClose(); // Tanquem només si té èxit
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <h3 className="text-2xl font-bold text-dark mb-6">Configurar Nou Equip</h3>

        {localError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 border border-red-100">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Nom de l'equip *</label>
            <input
              {...register("name", {
                required: "El nom és obligatori",
                minLength: { value: 3, message: "El nom ha de tenir almenys 3 caràcters" },
                maxLength: { value: 30, message: "El nom és massa llarg (màxim 30)" }
              })}
              className={`w-full p-3 rounded-xl border ${errors.name ? 'border-danger' : 'border-gray-200'} focus:ring-2 focus:ring-primary/20 outline-none`}
              placeholder="Ex: Els Guerrers"
            />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">Escut (URL imatge)</label>
            <input
              {...register("shield", {
                pattern: {
                  value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                  message: "Introdueix una URL vàlida"
                }
              })}
              type="url"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="https://..."
            />
            {errors.shield && <p className="text-danger text-xs mt-1">{errors.shield.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Color Primari</label>
              <input
                {...register("primary_color")}
                type="color"
                className="w-full h-12 p-1 rounded-xl border border-gray-200 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Color Secundari</label>
              <input
                {...register("secondary_color")}
                type="color"
                className="w-full h-12 p-1 rounded-xl border border-gray-200 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">Professor Tutor</label>
            <select
              {...register("teacher_id")}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">Cap seleccionat</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 rounded-xl font-medium text-muted hover:bg-gray-100 transition-all"
            >
              Tancar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary"
            >
              {isSubmitting ? "Creant..." : "Finalitzar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
