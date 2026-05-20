import { Trash2 } from "lucide-react";

// deixem les icones fora del map per no recrear-les cada vegada de forma innecessaria.
// si les tinguéssim dins de l'article, React les tornaria a instanciar de zero a cada render!
// triem la icona i el color de fons segons el tipus de comunicat que ens arriba del backend.
function getAnnouncementIconConfig(type) {
  
  // d'entrada pensem que és un comunicat general de color blau
  let bgColor = "bg-primary/5";
  let iconColor = "text-primary";

  // Icona per defecte (Avisos generals de l'escola, com partits de professors vs alumnes)
  let Icon = () => {
    return (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    );
  };

  // si és una sol·licitud d'un estudiant que vol entrar al nostre equip (color taronja d'espera)
  if (type === "TEAM_REQUEST") {
    Icon = () => {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      );
    };
    
    bgColor = "bg-amber-50";
    iconColor = "text-amber-500";
    
  // si el capità ens ha acceptat de forma oficial a l'equip (color verd de victòria!)
  } else if (type === "TEAM_SUCCESS") {
    Icon = () => {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    };
    
    bgColor = "bg-emerald-50";
    iconColor = "text-emerald-500";
    
  // si ens han rebutjat la petició o ens han fet fora de la plantilla (color vermell d'alerta)
  } else if (type === "TEAM_ERROR") {
    Icon = () => {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    };
    
    bgColor = "bg-rose-50";
    iconColor = "text-rose-500";
  }

  return {
    Icon,
    bgColor,
    iconColor
  };
}

export default function AnnouncementList({
  announcements,
  onDelete,
  lastCheck,
  currentUserId,
  isAdmin,
}) {
  
  // si no hi ha comunicats, mostrem estat buit per a no tenir la pantalla totalment en blanc
  if (announcements.length === 0) {
    return (
      <div className="bg-white/50 border-2 border-dashed border-primary/10 rounded-3xl p-16 text-center animate-in fade-in duration-500">
        
        <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-10 h-10 text-primary/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        
        <p className="text-muted text-lg font-medium">
          Encara no hi ha cap comunicat disponible.
        </p>

      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* titol capçalera del llistat de comunicats de la campaneta. Queda xulo abans dels articles */}
      <div className="flex items-center gap-2 text-muted px-2 mb-2">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        
        <span className="text-xs font-bold uppercase tracking-widest">
          Historial d'avisos
        </span>
      </div>

      {/* mapes de cadascun dels comunicats en targetes individuals */}
      {announcements.map((ann) => {
        
        // comprovem si l'anunci s'ha creat des de l'últim cop que l'usuari va obrir la campaneta.
        // serveix per a pintar la vora blava brillant a les targetes que l'alumne encara no ha vist!
        const isNew = lastCheck
          ? new Date(ann.created_at) > new Date(lastCheck)
          : true;

        // agafem la configuracio d'icona delegada des del helper extern per a evitar renders redundants
        const { Icon, bgColor, iconColor } = getAnnouncementIconConfig(ann.type);

        return (
          <article
            key={ann.id}
            className={`bg-white p-6 rounded-3xl border transition-all hover:translate-x-1 duration-300 ${
              isNew
                ? "border-primary/30 shadow-xl shadow-primary/5"
                : "border-gray-100 shadow-sm"
            } relative group`}
          >
            
            {/* cartell vermell de NOU a l'esquerra de la card si és una notificacio que acaba d'arribar */}
            {isNew && (
              <span className="absolute -left-1 top-8 bg-accent text-white text-[10px] font-black px-2.5 py-1 rounded-r-lg shadow-lg shadow-accent/20 z-10">
                NOU
              </span>
            )}

            {/* aquesta card mostra un comunicat individual de la campaneta */}
            <div className="flex gap-4 items-start mb-3">
              
              {/* icona amb el color triat de forma dinamica segons el tipus d'anunci */}
              <div className={`${bgColor} ${iconColor} p-3 rounded-2xl`}>
                <Icon />
              </div>

              <div className="flex-1">
                
                <h3 className="font-bold text-lg text-dark leading-tight mb-1">
                  {ann.title}
                </h3>
                
                <div className="flex items-center gap-2 text-muted">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  
                  {/* formatem la data de creacio del comunicat a format local per a que s'entengui de luxe */}
                  <p className="text-[10px] font-bold uppercase tracking-tight">
                    {new Date(ann.created_at).toLocaleString("ca-ES", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

              </div>

              {/* Botó de l'admin o el creador per a esborrar el comunicat si s'ha equivocat.
                  Mirem que nomes ho pugui fer el creador de l'anunci o l'admin per a evitar hackejos de comunicats de companys! */}
              {(isAdmin ||
                Number(ann.user_id) === Number(currentUserId) ||
                Number(ann.user?.id) === Number(currentUserId)) && (
                <button
                  onClick={() => {
                    onDelete(ann.id);
                  }}
                  className="p-2.5 rounded-xl md:rounded-2xl transition-all duration-200 active:scale-90 cursor-pointer shrink-0 bg-red-50 text-red-600 shadow-sm md:shadow-none md:bg-transparent md:text-muted md:opacity-0 md:group-hover:opacity-100 md:hover:text-red-600 md:hover:bg-red-50"
                  title="Eliminar comunicat"
                >
                  <Trash2 size={16} />
                </button>
              )}

            </div>

            {/* contingut de text principal del comunicat.
                fem servir 'whitespace-pre-wrap' per a que si el profe escriu salts de linia es mantinguin perfectament! */}
            <div className="text-dark/80 text-base leading-relaxed whitespace-pre-wrap pl-1 border-l-2 border-primary/10 font-normal mt-4">
              {ann.content}
            </div>

          </article>
        );
      })}

    </div>
  );
}
