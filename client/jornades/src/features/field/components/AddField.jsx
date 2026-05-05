import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, X, MapPin, Layout } from "lucide-react";

const defaultValues = {
  name: "",
  location: "",
  number_of_courts: 1,
};

export default function AddField({ isOpen, onClose, onCreate }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({ mode: "onChange", defaultValues });

  const submit = async (data) => {
    try {
      await onCreate(data);
      reset(defaultValues);
      onClose();
    } catch (error) {
      // Gestionat per l'estat global
    }
  };

  useEffect(() => {
    if (isOpen) reset(defaultValues);
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="mt-4 bg-white rounded-3xl p-8 border border-primary/10 shadow-[0_20px_50px_rgba(79,168,245,0.12)] animate-in slide-in-from-top-6 fade-in duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Plus size={24} strokeWidth={2.5} />
        </div>
        <h3 className="text-2xl font-bold text-dark tracking-tight">Nou Camp / Instal·lació</h3>
      </div>
      
      <form onSubmit={handleSubmit(submit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-dark/70 ml-1">Nom del camp</label>
            <input
              {...register("name", { required: "El nom és obligatori" })}
              className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3.5 text-dark placeholder:text-muted/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
              placeholder="Ex: Pavelló Municipal, Camp de Gespa..."
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
                {...register("location")}
                className="w-full bg-gray-50 border border-primary/10 rounded-2xl pl-11 pr-4 py-3.5 text-dark placeholder:text-muted/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
                placeholder="Carrer, Ciutat..."
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Number of Courts */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-dark/70 ml-1 flex items-center gap-1.5">
              <Layout size={14} /> Número de pistes
            </label>
            <input
              type="number"
              min={1}
              {...register("number_of_courts", { 
                required: "Camp obligatori",
                valueAsNumber: true,
                min: { value: 1, message: "Mínim 1" }
              })}
              className="w-full bg-gray-50 border border-primary/10 rounded-2xl px-4 py-3.5 text-dark focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
            />
            {errors.number_of_courts && <p className="text-danger text-xs font-medium ml-1">{errors.number_of_courts.message}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-6 border-t border-primary/5">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex-1 md:flex-none bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creant camp..." : "Guardar camp"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 md:flex-none px-8 py-4 rounded-2xl border border-gray-200 text-dark font-bold hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            Cancel·lar
          </button>
        </div>
      </form>
    </div>
  );
}
