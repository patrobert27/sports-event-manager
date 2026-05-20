import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUsers } from "../features/user/userThunks";
import {
  selectUserList,
  selectUserPagination,
  selectIsLoadingUsers,
  selectUserError,
  selectUserSuccess,
} from "../features/user/userSelectors";
import { setSuccess } from "../features/user/userSlice";

import UserList from "../features/user/components/UserList";

import Spinner from "../components/ui/Spinner";
import { ErrorAlert, InfoAlert, SuccessAlert } from "../components/ui/Alerts";

export default function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector(selectUserList);
  const pagination = useSelector(selectUserPagination);
  const isLoading = useSelector(selectIsLoadingUsers);
  const error = useSelector(selectUserError);
  const success = useSelector(selectUserSuccess);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Debounce per no fer peticions mentre l'usuari escriu
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Carrega usuaris quan canvia la pàgina o els filtres
  const fetchUsers = useCallback(
    (page = 1) => {
      dispatch(loadUsers({ 
        page, 
        limit: 10, 
        search: debouncedSearch,
        role: roleFilter === 'all' ? undefined : roleFilter 
      }));
    },
    [dispatch, debouncedSearch, roleFilter]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Temporitzador per netejar missatges d'èxit
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(setSuccess(null));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-bold text-dark">Gestió d'Usuaris</h2>
          <p className="text-muted text-sm">Cerca i administra els rols dels participants.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Buscador Estilizado */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted group-focus-within:text-primary transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-primary/10 rounded-2xl text-dark placeholder:text-muted/40 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-sm shadow-primary/5"
              placeholder="Cerca per nom, cognom o correu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Desplegable de Rol Personalitzat Premium */}
          <div className="relative min-w-[200px]" id="role-filter-container">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="w-full pl-4 pr-10 py-3.5 bg-white border border-primary/10 rounded-2xl text-sm font-bold text-dark text-left flex items-center justify-between hover:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm shadow-primary/5 cursor-pointer"
            >
              <span>
                {roleFilter === 'all' ? 'Tots els rols' : 
                 roleFilter === 'estudiant' ? 'Estudiants' : 
                 roleFilter === 'professor' ? 'Professors' : 'Administradors'}
              </span>
              <svg 
                className={`w-4 h-4 text-primary transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isRoleDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsRoleDropdownOpen(false)} 
                />
                <div className="absolute z-20 w-full mt-2 bg-white border border-primary/10 rounded-2xl shadow-xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    {[
                      { id: 'all', label: 'Tots els rols' },
                      { id: 'estudiant', label: 'Estudiants' },
                      { id: 'professor', label: 'Professors' },
                      { id: 'admin', label: 'Administradors' }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setRoleFilter(option.id);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          roleFilter === option.id 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-dark hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading && !users.length ? (
        <Spinner message="Carregant usuaris..." />
      ) : (
        <>
          {error && <ErrorAlert message={error} />}
          {success && <SuccessAlert message={success} />}
          
          {users.length > 0 ? (
            <UserList
              users={users}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          ) : (
            !isLoading && <InfoAlert message="No s'han trobat usuaris que coincideixin amb la cerca." />
          )}
        </>
      )}
    </div>
  );
}
