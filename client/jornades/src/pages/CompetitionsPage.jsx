import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadCompetitions,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  loadActivities,
  loadFields,
} from "../features/competition/competitionThunks";
import {
  selectCompetitions,
  selectCompetitionLoading,
  selectCompetitionError,
  selectCompetitionActivities,
  selectCompetitionFields,
} from "../features/competition/competitionSelectors";

import CompetitionForm from "../features/competition/components/CompetitionForm";
import CreateJornada from "../features/competition/components/CreateJornada";
import CompetitionsList from "../features/competition/components/CompetitionsList";
import RoleRule from "../components/auth/RoleRule";

export default function CompetitionsPage() {
  const dispatch = useDispatch();
  // Obtenim l'estat des de Redux
  const competitions = useSelector(selectCompetitions);
  const loading = useSelector(selectCompetitionLoading);
  const error = useSelector(selectCompetitionError);
  const activities = useSelector(selectCompetitionActivities);
  const fields = useSelector(selectCompetitionFields);

  // Estat local per saber quina jornada estem editant (null = cap)
  const [editing, setEditing] = useState(null);

  // Carrega inicial de totes les dades necessàries
  useEffect(() => {
    dispatch(loadCompetitions());
    dispatch(loadActivities());
    dispatch(loadFields());
  }, [dispatch]);

  // Funcions de gestió (CRUD) de les competicions
  const handleCreate = async (payload) => {
    await dispatch(createCompetition(payload));
  };

  const handleUpdate = async (id, payload) => {
    await dispatch(updateCompetition(id, payload));
    setEditing(null); // Tanquem el formulari d'edició
  };

  const handleDelete = async (id) => {
    if (!confirm("Vols eliminar aquesta jornada definitivament?")) {
      return;
    }
    await dispatch(deleteCompetition(id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Competicions / Jornades</h2>
      </div>

      {loading && <p>Carregant...</p>}
      {error && <p className="text-danger">{error}</p>}

      {/* Només els administradors poden veure l'opció de crear jornades */}
      <RoleRule allowedRoles={['admin']}>
        <CreateJornada activities={activities} fields={fields} onCreate={handleCreate} />
      </RoleRule>

      {/* Modal o secció d'edició per a la jornada seleccionada */}
      {editing ? (
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4">{editing.id ? 'Editar jornada' : 'Crear jornada'}</h3>
          <CompetitionForm
            initialData={editing}
            activities={activities}
            fields={fields}
            onCancel={() => setEditing(null)}
            onSubmit={async (data) => {
              try {
                if (editing?.id) await handleUpdate(editing.id, data);
                else await handleCreate(data);
              } catch (err) {
                alert(err.message || 'Hi ha hagut un error');
              }
            }}
          />
        </div>
      ) : null}

      {/* Llista de jornades (component presentacional) */}
      <div className="mb-6">
        <CompetitionsList jornades={competitions} onEdit={(c) => setEditing(c)} onDelete={handleDelete} />
      </div>
    </div>
  );
}
