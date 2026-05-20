import React, { useState } from "react";
import { Edit2, Trash2, MapPin, Layout } from "lucide-react";
import RoleRule from "../../../components/auth/RoleRule";
import { InfoAlert } from "../../../components/ui/Alerts";
import ConfirmModal from "../../../components/ui/ConfirmModal";

// Aquest component mostra la llista completa de pistes o pavellons on es juguen els partits
const FieldList = ({ fields, onEdit, onDelete }) => {
  
  // guardem en calent el camp que el professor desitja eliminar per demanar confirmació
  const [fieldToDelete, setFieldToDelete] = useState(null);

  // si no hi ha instal·lacions actives al centre esportiu o la cerca ha quedat buida
  if (!fields || fields.length === 0) {
    return (
      <InfoAlert 
        message="No s'han trobat camps que coincideixin amb la cerca." 
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {fields.map((field) => {
          return (
            <div
              key={field.id}
              className="group relative bg-white rounded-2xl border border-primary/10 p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col gap-4">
                
                <div className="flex items-start justify-between">
                  
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">
                      {field.name}
                    </h3>
                    
                    {/* Indicació de la ubicació/direcció física de la pista */}
                    <div className="flex items-center gap-1 text-muted text-xs mt-1">
                      <MapPin size={12} />
                      
                      <span className="truncate max-w-[150px]">
                        {field.location || "Sense ubicació"}
                      </span>
                    </div>
                  </div>

                  {/* Accions administratives (només professors/admins) */}
                  <RoleRule allowedRoles={["admin"]}>
                    <div className="flex gap-2 items-center">
                      
                      <button
                        onClick={() => {
                          if (onEdit) {
                            onEdit(field);
                          }
                        }}
                        className="p-2.5 rounded-xl bg-primary/10 text-primary md:bg-gray-50 md:text-muted md:hover:bg-primary/10 md:hover:text-primary transition-all duration-200 cursor-pointer shadow-sm md:shadow-none"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      <button
                        onClick={() => {
                          setFieldToDelete(field);
                        }}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600 md:bg-gray-50 md:text-muted md:hover:bg-red-50 md:hover:text-red-600 transition-all duration-200 cursor-pointer shadow-sm md:shadow-none"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </RoleRule>

                </div>

                {/* Mostra de pistes de joc simultànies disponibles a la instal·lació */}
                <div className="flex items-center gap-4 pt-2 border-t border-primary/5 mt-auto">
                  <div className="flex flex-col">
                    
                    <span className="text-[10px] text-muted uppercase font-bold tracking-tighter">
                      Pistes / Corts
                    </span>
                    
                    <div className="flex items-center gap-1.5 text-dark font-semibold">
                      <Layout size={14} className="text-primary" />
                      
                      <span>
                        {field.number_of_courts || "—"}
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          );
        })}

      </div>

      <ConfirmModal
        isOpen={!!fieldToDelete}
        title="Eliminar Camp"
        message={`Estàs segur que vols eliminar el camp "${fieldToDelete?.name}"? Aquesta acció no es pot desfer.`}
        onConfirm={() => {
          if (fieldToDelete) {
            const id = fieldToDelete.id;
            setFieldToDelete(null);
            onDelete(id);
          }
        }}
        onCancel={() => {
          setFieldToDelete(null);
        }}
      />
    </>
  );
};

export default FieldList;
