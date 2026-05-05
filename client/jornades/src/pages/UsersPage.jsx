import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUsers } from "../features/user/userThunks";
import {
  selectUserList,
  selectUserPagination,
  selectIsLoadingUsers,
  selectUserError,
} from "../features/user/userSelectors";

import UserList from "../features/user/components/UserList";
import RoleRule from "../components/auth/RoleRule";
import Spinner from "../components/ui/Spinner";
import { ErrorAlert, InfoAlert } from "../components/ui/Alerts";

export default function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector(selectUserList);
  const pagination = useSelector(selectUserPagination);
  const isLoading = useSelector(selectIsLoadingUsers);
  const error = useSelector(selectUserError);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce per no fer peticions mentre l'usuari escriu
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Carrega usuaris quan canvia la pàgina o el text de cerca
  const fetchUsers = useCallback(
    (page = 1) => {
      dispatch(loadUsers({ page, limit: 10, search: debouncedSearch }));
    },
    [dispatch, debouncedSearch]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

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
        
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
            placeholder="Cerca per nom, cognom o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && !users.length ? (
        <Spinner message="Carregant usuaris..." />
      ) : (
        <>
          {error && <ErrorAlert message={error} />}
          
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
