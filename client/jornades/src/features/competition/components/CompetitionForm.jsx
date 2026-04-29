import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { selectToken } from "../../auth/authSelectors";
import competitionService from "../competitionService";

// Formulari de creació i edició de competicions/jornades
export default function CompetitionForm({ initialData = {}, activities = [], fields = [], onSubmit, onCancel }) {
	const token = useSelector(selectToken);
	// Estats locals per a les activitats i camps (en cas que no es passin per props)
	const [activitiesLocal, setActivitiesLocal] = useState(activities || []);
	const [fieldsLocal, setFieldsLocal] = useState(fields || []);

	// Valors per defecte del formulari basats en si estem creant o editant
	const defaultValues = {
		name: initialData.name ?? "",
		date: initialData.date ?? "",
		start_time: initialData.start_time ?? "",
		status: initialData.status ?? "REGISTRATION",
		registration_deadline: initialData.registration_deadline ?? "",
		available_courts: initialData.available_courts ?? 1,
		activity_id: initialData.activity_id ?? (initialData.activity ? initialData.activity.id : ""),
		field_id: initialData.field_id ?? (initialData.field ? initialData.field.id : ""),
	};

	// Configuració de react-hook-form
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm({ defaultValues });

	useEffect(() => {
		// Reiniciem el formulari quan canvien les dades inicials (p. ex. canviant de creació a edició)
		reset(defaultValues);
	}, [initialData]);

	useEffect(() => {
		// Si el component pare no ha passat les activitats o els camps, els intentem carregar aquí
		let mounted = true;
		async function loadMeta() {
			try {
				if ((!activities || activities.length === 0) && activitiesLocal.length === 0) {
					const a = await competitionService.fetchActivities(token).catch(() => []);
					if (mounted) setActivitiesLocal(Array.isArray(a) ? a : []);
				}
				if ((!fields || fields.length === 0) && fieldsLocal.length === 0) {
					const f = await competitionService.fetchFields(token).catch(() => []);
					if (mounted) setFieldsLocal(Array.isArray(f) ? f : []);
				}
			} catch {
				// ignorem errors de càrrega
			}
		}
		loadMeta();
		return () => (mounted = false);
	}, [activities, fields, token]);

	// Gestió de l'enviament del formulari
	const submit = async (data) => {
		// Formatació i coercions de tipus abans d'enviar al backend
		const payload = {
			name: data.name,
			date: data.date || null,
			start_time: data.start_time || null,
			status: data.status,
			registration_deadline: data.registration_deadline || null,
			available_courts: Number(data.available_courts),
			activity_id: data.activity_id ? Number(data.activity_id) : null,
			field_id: data.field_id ? Number(data.field_id) : null,
		};

		await onSubmit(payload);
	};

	return (
		<form onSubmit={handleSubmit(submit)} className="space-y-3">
			<div>
				<label className="block text-sm text-muted">Nom</label>
				<input
					{...register("name", { required: "El nom és obligatori" })}
					className="w-full border rounded px-3 py-2"
				/>
				{errors.name && <p className="text-danger text-sm mt-1">{errors.name.message}</p>}
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div>
					<label className="block text-sm text-muted">Data</label>
					<input {...register("date")} type="date" className="w-full border rounded px-3 py-2" />
					{errors.date && <p className="text-danger text-sm mt-1">{errors.date.message}</p>}
				</div>
				<div>
					<label className="block text-sm text-muted">Hora inici</label>
					<input
						{...register("start_time")}
						type="time"
						className="w-full border rounded px-3 py-2"
					/>
					{errors.start_time && <p className="text-danger text-sm mt-1">{errors.start_time.message}</p>}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div>
					<label className="block text-sm text-muted">Estat</label>
					<select
						{...register("status", { required: "L'estat és obligatori" })}
						className="w-full border rounded px-3 py-2"
					>
						<option value="REGISTRATION">Inscripció</option>
						<option value="GROUP_STAGE">Fase de grups</option>
						<option value="SEMIFINALS">Semifinals</option>
						<option value="FINAL_STAGE">Final</option>
						<option value="FINISHED">Finalitzada</option>
					</select>
					{errors.status && <p className="text-danger text-sm mt-1">{errors.status.message}</p>}
				</div>

				<div>
					<label className="block text-sm text-muted">Places disponibles</label>
					<input
						{...register("available_courts", {
							required: "Places obligatòries",
							valueAsNumber: true,
							validate: (v) => (Number(v) >= 1) || "S'ha de tenir al menys 1 plaça",
						})}
						type="number"
						min={1}
						className="w-full border rounded px-3 py-2"
					/>
					{errors.available_courts && <p className="text-danger text-sm mt-1">{errors.available_courts.message}</p>}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div>
					<label className="block text-sm text-muted">Activitat</label>
					<select
						{...register("activity_id", { required: "L'activitat és obligatòria" })}
						className="w-full border rounded px-3 py-2"
					>
						<option value="">-- selecciona --</option>
						{(activitiesLocal || []).map((a) => (
							<option key={a.id} value={a.id}>{a.name || a.title || a.id}</option>
						))}
					</select>
					{errors.activity_id && <p className="text-danger text-sm mt-1">{errors.activity_id.message}</p>}
				</div>

				<div>
					<label className="block text-sm text-muted">Pavelló</label>
					<select
						{...register("field_id", { required: "El pavelló és obligatori" })}
						className="w-full border rounded px-3 py-2"
					>
						<option value="">-- selecciona --</option>
						{(fieldsLocal || []).map((f) => (
							<option key={f.id} value={f.id}>{f.name || f.title || f.id}</option>
						))}
					</select>
					{errors.field_id && <p className="text-danger text-sm mt-1">{errors.field_id.message}</p>}
				</div>
			</div>

			<div className="flex gap-2">
				<button type="submit" disabled={isSubmitting} className="bg-primary text-white px-4 py-2 rounded-xl">
					{isSubmitting ? "S'enviant..." : "Desar"}
				</button>
				<button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border">Cancel·lar</button>
			</div>
		</form>
	);
}
