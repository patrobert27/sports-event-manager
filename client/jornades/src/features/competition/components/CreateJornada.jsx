import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

// Valors per defecte a l'hora de crear una jornada nova
const defaultValues = {
  name: '',
  date: '',
  start_time: '',
  status: 'REGISTRATION',
  registration_deadline: '',
  available_courts: 1,
  activity_id: '',
  field_id: '',
};

// Component únic que mostra el botó per obrir el panell i el formulari integrat
export default function CreateJornada({ activities = [], fields = [], onCreate }) {
  const [open, setOpen] = useState(false); // Estat per obrir/tancar el formulari
  const [submitting, setSubmitting] = useState(false); // Estat de càrrega durant l'enviament

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({ mode: 'onChange', defaultValues });

  // Funció cridada en enviar el formulari amb èxit
  const handleCreateSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Per defecte les noves jornades tenen l'estat d'inscripció
      const payload = { ...data, status: 'REGISTRATION' };
      await onCreate(payload);
      reset(defaultValues); // Neteja el formulari
      setOpen(false); // Tanca el panell
    } finally {
      setSubmitting(false);
    }
  };

  // Netejar el formulari si es tanca i s'obre de nou
  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setOpen((s) => !s)}
          className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover transition"
        >
          {open ? 'Tancar' : '+ Crear jornada'}
        </button>
      </div>

      {open && (
        <div className="bg-white rounded-2xl p-6 mb-6 border shadow-lg">
          <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark">Nom</label>
              <input {...register('name', 
                { required: 'El nom és obligatori' })} className="mt-1 block w-full rounded-md border p-2" />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark">Esport</label>
              <select {...register('activity_id', { required: 'Selecciona un esport' })} className="mt-1 block w-full rounded-md border p-2">
                <option value="">Selecciona...</option>
                {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {errors.activity_id && <p className="text-xs text-danger mt-1">{errors.activity_id.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-dark">Data</label>
                <input type="date" {...register('date', { required: 'La data és obligatòria', validate: value => !isNaN(new Date(value)) || 'Data invàlida' })} className="mt-1 block w-full rounded-md border p-2" />
                {errors.date && <p className="text-xs text-danger mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark">Hora d'inici</label>
                <input type="time" {...register('start_time', { required: 'L’hora és obligatòria' })} className="mt-1 block w-full rounded-md border p-2" />
                {errors.start_time && <p className="text-xs text-danger mt-1">{errors.start_time.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-dark">Pavelló</label>
                <select {...register('field_id')} className="mt-1 block w-full rounded-md border p-2">
                  <option value="">Selecciona...</option>
                  {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark">Pistes disponibles</label>
                <input type="number" {...register('available_courts', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border p-2" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => { reset(); setOpen(false); }} className="px-4 py-2 rounded-md border text-sm">Cancelar</button>
              <button type="submit" disabled={!isValid || submitting} className="px-4 py-2 rounded-md bg-primary text-white disabled:opacity-50">
                {submitting ? 'Creant...' : 'Crear jornada'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
