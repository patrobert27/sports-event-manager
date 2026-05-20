import { apiFetch } from "../../services/api";

/**
 * Servicio para gestionar las peticiones de comunicados al backend.
 * Sigue la infraestructura de servicios del proyecto.
 */
const announcementService = {
  async fetchAnnouncements() {
    return await apiFetch("/announcements");
  },

  async createAnnouncement(payload) {
    return await apiFetch("/announcements", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async deleteAnnouncement(id) {
    return await apiFetch(`/announcements/${id}`, {
      method: "DELETE",
    });
  },

  async markAsRead() {
    return await apiFetch("/announcements/mark-read", {
      method: "POST",
    });
  },
};

export default announcementService;
