import { apiFetch } from "../../services/api";

// aquest servei nomes fa de pont amb el backend per a tot el relatiu a pistes i pavellons
const fieldService = {
  
  // Obté totes les pistes de l'escola amb cerca i filtres pel buscador
  async fetchFields({ search = "" } = {}) {
    const params = new URLSearchParams();
    
    if (search.trim()) {
      params.set("search", search.trim());
    }
    
    return await apiFetch(`/fields?${params.toString()}`);
  },

  // Crea una instal·lació esportiva nova (només accessible per professors/admin)
  async createField(data) {
    return await apiFetch("/fields", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Modifica el nom o la disponibilitat d'una pista activa
  async updateField(id, data) {
    return await apiFetch(`/fields/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Elimina una instal·lació o pista de joc de la base de dades
  async deleteField(id) {
    return await apiFetch(`/fields/${id}`, {
      method: "DELETE",
    });
  },
};

export default fieldService;
