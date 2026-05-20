import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Plus, X } from 'lucide-react';
import { 
  loadFields,
  addField,
  editField,
  removeField
} from '../features/field/fieldThunks';
import { 
  selectFields, 
  selectFieldsLoading, 
  selectFieldsError,
  selectFieldsSuccess
} from '../features/field/fieldSelectors';
import { setSuccess, setError } from '../features/field/fieldSlice';
import { SuccessAlert } from '../components/ui/Alerts';
import FieldList from '../features/field/components/FieldList';
import AddField from '../features/field/components/AddField';
import EditFieldModal from '../features/field/components/EditFieldModal';
import Spinner from '../components/ui/Spinner';
import { RoleRule } from '../components/auth/RoleRule';
import { ROLES } from '../constants/roles';

const FieldsPage = () => {
  const dispatch = useDispatch();
  const fields = useSelector(selectFields);
  const isLoading = useSelector(selectFieldsLoading);
  const error = useSelector(selectFieldsError);
  const success = useSelector(selectFieldsSuccess);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFields = useCallback(() => {
    dispatch(loadFields({ search: debouncedSearch }));
  }, [dispatch, debouncedSearch]);

  const handleCreateField = async (data) => {
    try {
      await dispatch(addField(data));
      setIsAddFormOpen(false);
    } catch {
      // Gestionat per l'estat global
    }
  };

  const handleUpdateField = async (id, data) => {
    try {
      await dispatch(editField(id, data));
    } catch {
      // Gestionat per l'estat global
    }
  };

  const handleDeleteField = async (id) => {
    try {
      await dispatch(removeField(id));
    } catch {
      // Gestionat per l'estat global
    }
  };

  useEffect(() => {
    dispatch(setError(null));
    fetchFields();
  }, [fetchFields, dispatch]);

  // Temporitzador per netejar missatges d'èxit
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(setSuccess(null));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-bold text-dark uppercase tracking-tight">Camps</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted/60" />
            </div>
            <input
              type="text"
              placeholder="Cerca per nom del camp..."
              className="block w-full pl-11 pr-4 py-3 bg-white border border-primary/10 rounded-2xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm shadow-primary/5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <RoleRule allowedRoles={[ROLES.ADMIN]}>
            <button
              onClick={() => setIsAddFormOpen((prev) => !prev)}
              className={`group flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 cursor-pointer shadow-lg ${
                isAddFormOpen
                  ? "bg-white text-dark border border-primary/10 hover:bg-gray-50 shadow-primary/5"
                  : "bg-primary text-white hover:bg-primary-hover shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isAddFormOpen ? (
                <>
                  <X size={20} strokeWidth={3} />
                  <span>Cancel·lar</span>
                </>
              ) : (
                <>
                  <Plus size={20} strokeWidth={3} />
                  <span>Nou Camp</span>
                </>
              )}
            </button>
          </RoleRule>
        </div>

        <RoleRule allowedRoles={[ROLES.ADMIN]}>
          <AddField 
            isOpen={isAddFormOpen} 
            onClose={() => setIsAddFormOpen(false)} 
            onCreate={handleCreateField} 
          />
        </RoleRule>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger/5 border border-danger/20 rounded-2xl text-danger text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-2 h-2 rounded-full bg-danger" />
          <span className="flex-1">{error}</span>
          <button onClick={() => dispatch(setError(null))} className="text-danger/50 hover:text-danger transition-colors">
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6">
          <SuccessAlert message={success} />
        </div>
      )}

      {isLoading && !fields.length ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <FieldList 
          fields={fields} 
          onEdit={(field) => setEditingField(field)}
          onDelete={handleDeleteField}
        />
      )}

      {/* Modal d'edició */}
      {editingField && (
        <EditFieldModal
          field={editingField}
          onClose={() => setEditingField(null)}
          onUpdate={handleUpdateField}
        />
      )}
    </div>
  );
};

export default FieldsPage;
