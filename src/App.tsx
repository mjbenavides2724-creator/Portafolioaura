import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Layers, AtSign, Info, Sun, Moon, ArrowLeft, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const InteractiveBackground = () => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: 'radial-gradient(var(--dot-bright) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        WebkitMaskImage: `radial-gradient(250px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
        maskImage: `radial-gradient(250px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
        opacity: `calc(var(--dot-opacity-multiplier, 1) * 2)`
      }}
    />
  );
};

const TopNav = ({ onLock, theme, toggleTheme, dotIntensity, setDotIntensity, activeSection, setActiveSection }: { 
  onLock: () => void, 
  theme: string, 
  toggleTheme: () => void,
  dotIntensity: number,
  setDotIntensity: (val: number) => void,
  activeSection: string,
  setActiveSection: (id: string) => void
}) => (
  <nav className="fixed top-0 w-full z-50 border-none bg-background/80 backdrop-blur-md">
    <div className="flex justify-between items-center w-full px-8 md:px-12 py-6 md:py-8 mx-auto">
      <div 
        className="text-xl font-headline font-bold tracking-tighter text-primary uppercase cursor-pointer hover:text-secondary-fixed transition-colors"
        onClick={onLock}
      >
        PORTAFOLIO
      </div>
      <div className="hidden md:flex items-center space-x-12 font-headline font-bold tracking-tighter uppercase text-xs md:text-sm">
        {[
          { id: 'inicio', label: 'INICIO' },
          { id: 'proyectos', label: 'PROYECTOS' },
          { id: 'autor', label: 'AUTOR' },
        ].map((item) => (
          <a 
            key={item.id}
            href={`#${item.id}`} 
            onClick={() => setActiveSection(item.id)}
            className={`relative group py-2 transition-all duration-300 ${activeSection === item.id ? 'text-secondary-fixed' : 'text-primary hover:text-secondary-fixed'}`}
          >
            {item.label}
            {activeSection === item.id && (
              <motion.div 
                layoutId="navIndicator"
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-secondary-fixed shadow-[0_0_20px_rgba(0,251,251,0.6)]"
                initial={false}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 35,
                  mass: 0.8,
                  restDelta: 0.001
                }}
              />
            )}
          </a>
        ))}
      </div>
      
      <div className="flex items-center space-x-6 md:space-x-8">
        <div className="hidden sm:flex items-center space-x-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary/40">Dots</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={dotIntensity} 
            onChange={(e) => setDotIntensity(parseInt(e.target.value))}
            className="w-24 md:w-32 h-[2px] bg-outline-variant/30 appearance-none cursor-pointer accent-secondary-fixed hover:bg-outline-variant/50 transition-colors"
          />
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full border border-outline-variant/30 text-primary hover:bg-surface-container-low hover:text-secondary-fixed transition-all duration-300 active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  </nav>
);



interface ProjectPage {
  number?: string;
  title?: string;
  description?: string;
  text: string;
  imageUrl: string;
  images?: string[];
}

interface Project {
  id: string;
  header: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  images?: string[];
  projectPages?: ProjectPage[];
  buttonText?: string;
}

const QuoteSection = ({ quote }: { quote: string | null }) => {
  if (!quote) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex justify-center py-40 md:py-56 px-6 md:px-12 bg-background relative min-h-[60vh] md:min-h-[70vh] items-center" 
      id="inicio"
    >
      <div className="flex flex-col items-center text-center max-w-4xl px-4 relative z-10">
        {/* Big Quotes Icon */}
        <div className="mb-8 flex justify-center">
          <svg width="40" height="30" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary-fixed">
            <path d="M15.4286 44L23.1429 27.5V0H0V27.5L7.71429 44H15.4286ZM46.2857 44L54 27.5V0H30.8571V27.5L38.5714 44H46.2857Z" fill="currentColor"/>
          </svg>
        </div>
        
        {/* Phrase */}
        <h3 className="font-body text-base md:text-lg text-primary font-light leading-relaxed tracking-widest whitespace-pre-line text-balance max-w-2xl">
          {quote}
        </h3>
      </div>
    </motion.section>
  );
};

const ProjectPageSlide: React.FC<{ page: ProjectPage, projectTitle: string, index: number, onZoom: (url: string) => void }> = ({ page, projectTitle, index, onZoom }) => {
  const allImages = page.images && page.images.length > 0 ? page.images : [page.imageUrl];
  const [activeImage, setActiveImage] = useState(allImages[0]);

  useEffect(() => {
    setActiveImage(allImages[0]);
  }, [allImages[0]]);

  return (
    <div className="snap-center shrink-0 w-[90vw] md:w-[85vw] lg:w-[75vw] h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative">
      
      {/* Center: Main Image (Now positioned in front of the title on desktop) */}
      <div 
        className={`flex-1 h-full w-full flex items-center justify-center min-h-[40vh] md:min-h-[60vh] relative order-1 md:order-1 cursor-zoom-in z-20 ${page.number || page.title || page.description ? '' : 'mx-auto w-[90vw] md:w-[75vw]'}`}
        onClick={() => onZoom(activeImage)}
      >
        <motion.img 
          key={activeImage}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          src={activeImage} 
          className="max-w-full max-h-full object-contain drop-shadow-2xl" 
          alt={`${projectTitle} Page ${index+1}`} 
          referrerPolicy="no-referrer" 
        />
      </div>

      {/* Right: Thumbnails */}
      {allImages.length > 1 && (
        <div className="order-3 md:order-2 flex md:flex-col gap-4 overflow-y-auto max-h-[60vh] shrink-0 no-scrollbar pr-2 pl-2 z-20">
          {allImages.map((img: string, idx: number) => (
            <button 
              key={idx} 
              onClick={() => setActiveImage(img)} 
              className={`w-16 h-16 md:w-20 md:h-20 shrink-0 transition-all duration-300 overflow-hidden bg-surface-container-low ${activeImage === img ? 'outline outline-2 outline-secondary-fixed outline-offset-2 opacity-100' : 'opacity-60 hover:opacity-100'}`}
            >
              <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx+1}`} referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}

      {/* Left: Optional Text (Now positioned behind/after the image) */}
      {(page.number || page.title || page.description) && (
        <div className="w-full md:w-[30%] lg:w-[25%] flex-shrink-0 flex flex-col justify-center order-2 md:order-3 text-center md:text-left self-center z-10 md:-ml-8 md:pl-4">
           {page.number && (
              <span className="font-headline text-[6rem] md:text-[8rem] lg:text-[10rem] font-bold text-primary leading-none tracking-tighter mb-4 block opacity-20 md:opacity-100 md:absolute md:left-0 md:top-1/4 -z-10 pointer-events-none">
                 {page.number}
              </span>
           )}
           {page.title && (
              <h3 className="font-headline text-3xl md:text-4xl uppercase tracking-widest text-primary mb-6 leading-tight drop-shadow-xl bg-background/50 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-4 md:p-0 rounded-xl relative z-10">
                 {page.title}
              </h3>
           )}
           {page.description && (
              <p className="font-body text-base md:text-lg text-on-surface-variant leading-relaxed max-w-sm mx-auto md:mx-0 whitespace-pre-line break-words relative z-10 p-4 md:p-0 bg-background/50 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none rounded-xl">
                 {page.description}
              </p>
           )}
        </div>
      )}
      
    </div>
  );
};

const SelectedWorks = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = () => {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
             setProjects(data);
          }
        })
        .catch(err => console.error("Error fetching projects:", err))
        .finally(() => setLoading(false));
    };

    // Initial fetch
    fetchProjects();

    // Poll every 10 seconds for automatic updates from Notion
    const intervalId = setInterval(fetchProjects, 10000);

    return () => clearInterval(intervalId);
  }, []);

  // PERMANENT SYNC: Ensure the opened project modal updates if Notion data changes
  useEffect(() => {
    if (selectedProject) {
      const updatedProject = projects.find(p => p.id === selectedProject.id);
      if (updatedProject && JSON.stringify(updatedProject) !== JSON.stringify(selectedProject)) {
        setSelectedProject(updatedProject);
      }
    }
  }, [projects, selectedProject]);

  return (
    <section className="px-6 md:px-12 space-y-32 md:space-y-48" id="proyectos">
      {/* Turquoise leading line */}
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="h-[2px] bg-secondary-fixed mb-24 opacity-80"
      />
      
      {/* Section Header */}
      <div className="pt-16">
        <div className="mb-6">
          <span className="bg-surface-container-highest px-3 py-1 text-[10px] font-body font-bold tracking-[0.2em] uppercase text-secondary-fixed tracking-widest">Sección 001</span>
        </div>
        <h2 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-headline font-bold leading-[0.85] tracking-[-0.05em] uppercase text-primary mb-12">
          Proyectos <br/> Destacados.
        </h2>
      </div>

      {loading ? (
        <div className="py-32 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-2 border-secondary-fixed/20 border-t-secondary-fixed rounded-full animate-spin"></div>
          <span className="text-[10px] font-body font-bold tracking-[0.2em] uppercase text-primary/40">Cargando datos de Notion...</span>
        </div>
      ) : projects.map((project, index) => {
        const isEven = index % 2 === 0;

        // Split title by explicitly typed newlines from Notion to preserve user formatting
        const titleParts = project.title.split('\n');
        const formattedTitle = titleParts.map((line, i) => (
          <span key={i}>{line}{i !== titleParts.length - 1 ? <br key={"br-"+i}/> : null}</span>
        ));

        // Let finalTitle use the explicitly formatted breaks
        const finalTitle = formattedTitle;

        return (
          <article key={project.id || index} className={`grid grid-cols-12 gap-8 items-start ${index > 0 ? 'pt-16' : ''}`}>
            {isEven ? (
              <>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="col-span-12 md:col-span-7 aspect-[16/9] bg-surface-container-low relative group overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 left-0 p-8 bg-background/80 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-headline font-bold text-secondary-fixed tracking-widest uppercase">{project.buttonText || "Ver Proyecto"}</span>
                  </div>
                </motion.div>
                <div className="col-span-12 md:col-span-5 md:pl-12 pt-4">
                  <div className="mb-4 flex items-center space-x-4">
                    <span className="text-[10px] font-headline font-bold tracking-[0.3em] uppercase text-primary/40">{project.header || ("00" + (index + 1) + " / 2024")}</span>
                    <div className="h-[1px] w-12 bg-outline-variant/50"></div>
                  </div>
                  <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-6 uppercase text-primary leading-none">
                    {finalTitle}
                  </h2>
                  <p className="font-body text-on-surface-variant leading-relaxed mb-8 max-w-sm whitespace-pre-line">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tIndex) => (
                      <span key={tag + tIndex} className="text-[10px] font-headline font-bold uppercase tracking-widest py-1 px-2 border border-outline-variant/40">{tag}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-12 md:col-span-5 md:pr-12 pt-4 order-2 md:order-1 flex flex-col md:items-end md:text-right">
                  <div className="mb-4 flex items-center space-x-4 md:justify-end">
                    <div className="hidden md:block h-[1px] w-12 bg-outline-variant/50"></div>
                    <span className="text-[10px] font-headline font-bold tracking-[0.3em] uppercase text-primary/40">{project.header || ("00" + (index + 1) + " / 2024")}</span>
                    <div className="md:hidden h-[1px] w-12 bg-outline-variant/50"></div>
                  </div>
                  <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-6 uppercase text-primary leading-none">
                    {finalTitle}
                  </h2>
                  <p className="font-body text-on-surface-variant leading-relaxed mb-8 max-w-sm whitespace-pre-line">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {project.tags.map((tag, tIndex) => (
                      <span key={tag + tIndex} className="text-[10px] font-headline font-bold uppercase tracking-widest py-1 px-2 border border-outline-variant/40">{tag}</span>
                    ))}
                  </div>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="col-span-12 md:col-span-7 aspect-[16/9] bg-surface-container-low relative group overflow-hidden order-1 md:order-2 cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 p-8 bg-background/80 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-headline font-bold text-secondary-fixed tracking-widest uppercase">{project.buttonText || "Ver Proyecto"}</span>
                  </div>
                </motion.div>
              </>
            )}
          </article>
        );
      })}

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4 md:p-8"
          >
            <button 
              onClick={() => setSelectedProject(null)} 
              className="absolute top-8 left-8 text-primary z-50 p-3 hover:bg-surface-container-low transition-colors rounded-full flex items-center justify-center"
              aria-label="Cerrar proyecto"
            >
              <ArrowLeft size={32} strokeWidth={1} />
            </button>

            <div className="w-full h-full max-h-[85vh] flex flex-col pt-16 pb-8">
              <div className="flex-1 w-full overflow-x-auto snap-x snap-mandatory flex items-center gap-[10vw] px-[10vw] no-scrollbar">
                
                {selectedProject.projectPages && selectedProject.projectPages.length > 0 ? (
                  selectedProject.projectPages.map((page, i) => (
                    <ProjectPageSlide key={i} page={page} projectTitle={selectedProject.title} index={i} onZoom={setZoomedImage} />
                  ))
                ) : (
                  // Fallback to original gallery layout
                  selectedProject.images && selectedProject.images.length > 0 ? (
                    selectedProject.images.map((img, i) => (
                      <div key={i} className="snap-center shrink-0 w-[90vw] md:w-[75vw] lg:w-[65vw] h-full flex items-center justify-center relative cursor-zoom-in" onClick={() => setZoomedImage(img)}>
                        <img src={img} className="max-w-full max-h-full object-contain drop-shadow-2xl" alt={`${selectedProject.title} ${i+1}`} referrerPolicy="no-referrer" />
                      </div>
                    ))
                  ) : (
                    <div className="snap-center shrink-0 w-[90vw] md:w-[75vw] lg:w-[65vw] h-full flex items-center justify-center relative cursor-zoom-in" onClick={() => setZoomedImage(selectedProject.imageUrl)}>
                      <img src={selectedProject.imageUrl} className="max-w-full max-h-full object-contain drop-shadow-2xl" alt={selectedProject.title} referrerPolicy="no-referrer" />
                    </div>
                  )
                )}

              </div>
              
              <div className="mt-8 flex flex-col items-center flex-shrink-0">
                {selectedProject.projectPages && selectedProject.projectPages.length > 1 && (
                  <p className="text-xs font-body text-secondary-fixed tracking-[0.3em] font-bold mt-4 animate-pulse">DESLIZA PARA VER MÁS FASES →</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl"
          >
            {/* Custom Header for Zoom Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-center z-[110] pointer-events-none">
              <button 
                onClick={() => setZoomedImage(null)} 
                className="text-primary p-3 hover:bg-surface-container-low transition-colors rounded-full flex items-center justify-center pointer-events-auto cursor-pointer"
                aria-label="Cerrar zoom"
              >
                <ArrowLeft size={32} strokeWidth={1} />
              </button>
            </div>

            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={8}
              centerOnInit
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface-container-low/80 backdrop-blur-md px-6 py-3 rounded-full z-[110] pointer-events-auto border border-outline-variant/20">
                    <button onClick={() => zoomOut()} className="text-primary hover:text-secondary-fixed transition-colors" aria-label="Alejar" title="Alejar">
                      <ZoomOut size={24} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => resetTransform()} className="text-primary hover:text-secondary-fixed transition-colors border-x border-outline-variant/30 px-4" aria-label="Restaurar" title="Restaurar">
                      <Maximize size={20} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => zoomIn()} className="text-primary hover:text-secondary-fixed transition-colors" aria-label="Acercar" title="Acercar">
                      <ZoomIn size={24} strokeWidth={1.5} />
                    </button>
                  </div>

                  <TransformComponent wrapperClass="!w-full !h-full cursor-grab active:cursor-grabbing" contentClass="!w-full !h-full flex items-center justify-center">
                    <img 
                      src={zoomedImage} 
                      alt="Zoomed Project Phase" 
                      className="max-w-none max-h-none object-contain h-[90vh] md:h-[95vh] drop-shadow-2xl pointer-events-none" 
                      referrerPolicy="no-referrer" 
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Profile = ({ autorData }: { autorData: any }) => {
  const profile = autorData?.profile;
  const contact = autorData?.contact || [];
  const titleParts = profile?.title?.split('\n') || ['Design', 'As', 'Structure.'];

  return (
    <section className="px-6 md:px-12 mt-32 md:mt-48" id="autor">
      {/* Turquoise leading line */}
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="h-[2px] bg-secondary-fixed mb-24 opacity-80"
      />
      <div className="grid grid-cols-12 gap-8 mb-24 items-end">
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-6">
            <span className="bg-surface-container-highest px-3 py-1 text-[10px] font-body font-bold tracking-[0.2em] uppercase text-secondary-fixed tracking-widest">Sección 002</span>
          </div>
          <h2 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-headline font-bold leading-[0.85] tracking-[-0.05em] uppercase mb-8">
            {titleParts.map((line: string, i: number) => (
              <span key={i}>{line}{i !== titleParts.length - 1 ? <br/> : null}</span>
            ))}
          </h2>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-xl font-light leading-relaxed whitespace-pre-line">
            {profile?.text || "A multidisciplinary architect of digital environments, crafting precise interfaces that exist at the intersection of brutalist aesthetics and high-performance engineering."}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-4 relative group">
          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-secondary-fixed"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-secondary-fixed"></div>
          <div className="bg-surface-container-low aspect-square overflow-hidden grayscale contrast-125 hover:grayscale-0 transition-all duration-700">
            <img 
              src={profile?.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"} 
              alt="Author Portrait" 
              className="w-full h-full object-cover mix-blend-luminosity"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      <Archive archiveData={autorData?.archive || []} />

      <div className="mb-32">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-2xl font-headline font-bold uppercase tracking-tighter text-primary">Contacto</h3>
          <div className="h-[1px] flex-grow ml-4 md:ml-8 bg-outline-variant/40"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {contact.length > 0 ? contact.map((item: any) => (
            <div key={item.id} className="bg-surface-container-low p-8 md:p-12 group hover:bg-surface-container-highest transition-colors duration-500 cursor-pointer">
              <p className="text-secondary-fixed text-3xl md:text-3xl lg:text-4xl font-headline font-bold mb-4 uppercase">{item.name}</p>
              <p className="text-sm text-on-surface-variant">{item.text}</p>
            </div>
          )) : (
            <div className="bg-surface-container-low p-8 md:p-12">
              <p className="text-secondary-fixed text-3xl md:text-4xl font-headline font-bold mb-4 uppercase">Cargando...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Archive = ({ archiveData }: { archiveData: any[] }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!archiveData || archiveData.length === 0) return null;

  return (
    <div className="mt-8 mb-24" id="archive">
      <div className="space-y-0 border-t border-primary/10">
        {archiveData.map((item, idx) => (
          <div key={item.id} className="border-b border-primary/5">
            <div 
              className="group grid grid-cols-12 py-8 hover:bg-surface-container-low transition-colors cursor-pointer px-4 items-center"
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            >
              <div className="col-span-1 text-[10px] font-headline font-bold text-primary/20">{String(idx + 1).padStart(3, '0')}</div>
              <div className="col-span-10 md:col-span-10 lg:col-span-10 font-headline font-bold text-2xl group-hover:text-secondary-fixed transition-colors uppercase tracking-tight">{item.name}</div>
              <div className="col-span-1 text-right text-primary/40 group-hover:text-secondary-fixed transition-colors text-2xl">
                {openId === item.id ? '−' : '+'}
              </div>
            </div>
            
            <AnimatePresence>
              {openId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden bg-surface-container-low/30"
                >
                  <div className="p-8 px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-on-surface-variant font-body mb-4">
                    {item.info1 && (
                      <div className="whitespace-pre-line leading-relaxed text-sm md:text-base border-l-2 border-secondary-fixed/50 pl-4">
                        {item.info1}
                      </div>
                    )}
                    {item.info2 && (
                      <div className="whitespace-pre-line leading-relaxed text-sm md:text-base border-l-2 border-primary/20 pl-4">
                        {item.info2}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="w-full py-12 md:py-16 px-8 md:px-12 border-t border-primary/10 bg-background flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
    <div className="flex flex-col space-y-6 md:space-y-4">
      <div className="font-headline font-bold text-2xl tracking-tighter uppercase">PORTAFOLIO</div>
      <div className="font-body text-[10px] tracking-[0.05em] uppercase text-primary/40">
        ©2024 DIGITAL MONOLITH. ALL RIGHTS RESERVED.
      </div>
    </div>
    <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-12">
      <div className="flex space-x-8 font-body text-[10px] tracking-[0.05em] uppercase">
        <a href="#" className="text-primary/40 hover:text-primary underline decoration-secondary-fixed transition-colors">Github</a>
        <a href="#" className="text-primary/40 hover:text-primary underline decoration-secondary-fixed transition-colors">LinkedIn</a>
        <a href="#" className="text-primary/40 hover:text-primary underline decoration-secondary-fixed transition-colors">Read.cv</a>
      </div>
      <div className="text-right hidden md:block">
        <div className="font-headline font-bold text-primary tracking-widest uppercase text-xs mb-2 cursor-pointer hover:text-secondary-fixed transition-colors" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Back to Top</div>
        <div className="h-[2px] w-24 bg-secondary-fixed ml-auto"></div>
      </div>
    </div>
  </footer>
);

const LockScreen = ({ onUnlock }: { onUnlock: () => void, key?: string }) => (
  <motion.div 
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    style={{
      backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
      backgroundSize: '32px 32px'
    }}
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
  >
    <div className="text-center px-6">
      <motion.h1 
        className="text-[15vw] md:text-[10rem] font-headline font-bold tracking-tighter text-primary cursor-pointer hover:text-secondary-fixed transition-colors duration-500 uppercase leading-none mb-8 md:mb-12"
        onClick={onUnlock}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        PORTAFOLIO
      </motion.h1>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-[10px] font-body font-bold tracking-[0.2em] uppercase">
        <span className="text-primary">Aura Isabel Calvache Jojoa</span>
        <div className="hidden md:block h-[1px] w-16 bg-outline-variant/50"></div>
        <span className="text-secondary-fixed">Diseño Gráfico</span>
        <span className="text-primary/40 md:ml-4">2024 — 2026</span>
      </div>
    </div>
  </motion.div>
);

export default function App() {
  const [quote, setQuote] = useState<string | null>(null);
  const selectedQuoteIndex = useRef<number | null>(null);
  const [autorData, setAutorData] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [dotIntensity, setDotIntensity] = useState(20);
  const [activeSection, setActiveSection] = useState('inicio');
  const isClickScrolling = useRef(false);

  useEffect(() => {
    const fetchQuote = () => {
      fetch('/api/quote')
        .then(res => res.json())
        .then(data => {
          if (data && data.quotes && data.quotes.length > 0) {
            if (selectedQuoteIndex.current === null) {
              const randomIndex = Math.floor(Math.random() * data.quotes.length);
              selectedQuoteIndex.current = randomIndex;
              setQuote(data.quotes[randomIndex]);
            } else {
              const index = selectedQuoteIndex.current;
              if (index < data.quotes.length) {
                setQuote(data.quotes[index]);
              } else {
                const newIndex = Math.floor(Math.random() * data.quotes.length);
                selectedQuoteIndex.current = newIndex;
                setQuote(data.quotes[newIndex]);
              }
            }
          }
        })
        .catch(err => console.error("Error fetching quotes pool:", err));
    };

    const fetchAutor = () => {
      fetch('/api/autor')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setAutorData(data);
          }
        })
        .catch(err => console.error("Error fetching autor:", err));
    };

    // Initial fetch
    fetchQuote();
    fetchAutor();

    // Poll every 10 seconds for automatic updates from Notion
    const intervalId = setInterval(() => {
      fetchQuote();
      fetchAutor();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Force scroll to top on refresh/initial load
    window.scrollTo(0, 0);
    setActiveSection('inicio');

    // Prevent browser from restoring scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;

    const handleScroll = () => {
      if (isClickScrolling.current) return;

      const sections = ['inicio', 'proyectos', 'autor', 'archive'];
      // Trigger point: near the top of the screen (150px offset)
      const triggerPoint = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i];
        const element = document.getElementById(id);
        if (element) {
          if (triggerPoint >= element.offsetTop) {
            setActiveSection(id === 'archive' ? 'autor' : id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isUnlocked]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--dot-opacity-multiplier', (dotIntensity / 100).toString());
  }, [dotIntensity]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen selection:bg-secondary-fixed selection:text-background relative">
      <InteractiveBackground />
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <LockScreen key="lock" onUnlock={() => setIsUnlocked(true)} />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <TopNav 
              onLock={() => {
                setIsUnlocked(false);
                window.scrollTo(0, 0);
                setActiveSection('inicio');
              }} 
              theme={theme} 
              toggleTheme={toggleTheme} 
              dotIntensity={dotIntensity}
              setDotIntensity={setDotIntensity}
              activeSection={activeSection}
              setActiveSection={(id) => {
                isClickScrolling.current = true;
                setActiveSection(id);
                // Allow enough time for the smooth scroll to finish before re-enabling observer
                setTimeout(() => {
                  isClickScrolling.current = false;
                }, 1000);
              }}
            />
            <main className="pt-12 md:pt-16 pb-10">
              <QuoteSection quote={quote} />
              <SelectedWorks />
              <Profile autorData={autorData} />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
