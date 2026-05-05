/**
 * Rols de l'aplicació.
 * Centralitzats al backend.
 */
const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'estudiant',
  TEACHER: 'professor'
};

const STUDENT_VARIANTS = ['estudiant', 'student', 'alumne', 'alumno'];
const TEACHER_VARIANTS = ['professor', 'teacher', 'profesor', 'docent'];
const ADMIN_VARIANTS = ['admin', 'administrator', 'administrador'];

module.exports = {
  ROLES,
  STUDENT_VARIANTS,
  TEACHER_VARIANTS,
  ADMIN_VARIANTS
};
