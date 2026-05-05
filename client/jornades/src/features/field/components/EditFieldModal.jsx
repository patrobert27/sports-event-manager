import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, MapPin, Layout, Save } from 'lucide-react';

const EditFieldModal = ({ field, onClose, onUpdate }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: field.name,
      location: field.location || "",
      number_of_courts: field.number_of_courts || 1,
    }
  });

  useEffect(() => {
    reset({
      name: field.name,
      location: field.location || "",
      number_of_courts: field.number_of_courts || 1,
    });
  }, [field, reset]);

  const onSubmit = async (data) => {
    try {
      await onUpdate(field.id, data);
      onClose();
    } catch (error) {
      // Gestionat per l'estat global
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8 border-b border-primary/5 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-dark">Editar camp</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-muted cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          <div className="space-y-6">
            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark/70 ml-1">Nom del camp *</label>
              <input
                {...register("name", { 
                  required: "El nom és obligatori",
                  minLength: { value: 3, message: "Mínim 3 caràcters" },
                  maxLength: { value: 50, message: "Màxim 50 caràcters" }
                })}
                className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3.5 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
              />
              {errors.name && <p className="text-danger text-xs font-medium ml-1">{errors.name.message}</p>}
            </div>

            {/* Ubicació */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark/70 ml-1">Ubicació / Adreça</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/40">
                  <MapPin size={18} />
                </div>
                <input
                  {...register("location", {
                    maxLength: { value: 100, message: "L'adreça és massa llarga" }
                  })}
                  className="w-full bg-gray-50 border border-primary/10 rounded-2xl pl-11 pr-4 py-3.5 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
                />
              </div>
              {errors.location && <p className="text-danger text-xs font-medium ml-1">{errors.location.message}</p>}
            </div>

            {/* Pistes */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark/70 ml-1 flex items-center gap-1.5">
                <Layout size={14} /> Número de pistes *
              </label>
              <input
                type="number"
                {...register("number_of_courts", { 
                  required: "Camp obligatori",
                  valueAsNumber: true,
                  min: { value: 1, message: "Mínim 1" },
                  max: { value: 20, message: "Màxim 20" }
                })}
                className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3.5 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
              />
              {errors.number_of_courts && <p className="text-danger text-xs font-medium ml-1">{errors.number_of_courts.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1 bg-primary text-white font-bold px-6 py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Guardant..." : "Guardar canvis"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 text-dark font-bold hover:bg-gray-50 transition-all duration-200"
            >
              Cancel·lar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFieldModal;
