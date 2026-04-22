const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startIdx = code.indexOf('const SelectedWorks = () => (');
const endIdx = code.indexOf('const Profile = () => (');

const newSelectedWorks = `interface Project {
  id: string;
  header: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
}

const SelectedWorks = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
           setProjects(data);
        }
      })
      .catch(err => console.error("Error fetching projects:", err))
      .finally(() => setLoading(false));
  }, []);

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
        <div className="py-32 text-center">
          <span className="text-[10px] font-body font-bold tracking-[0.2em] uppercase text-primary/40">Cargando BBDD...</span>
        </div>
      ) : projects.map((project, index) => {
        const isEven = index % 2 === 0;

        // Split title into parts if it has spaces for line breaks, or just use it raw
        const titleParts = project.title.split(' ');
        const formattedTitle = titleParts.map((word, i) => (
          <span key={i}>{word}{i !== titleParts.length - 1 ? <br key={"br-"+i}/> : null}</span>
        ));

        return (
          <article key={project.id} className="grid grid-cols-12 gap-8 items-start">
            {isEven ? (
              <>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="col-span-12 md:col-span-7 aspect-[16/9] bg-surface-container-low relative group overflow-hidden"
                >
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 left-0 p-8 bg-background/80 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-headline font-bold text-secondary-fixed tracking-widest uppercase">Ver Proyecto</span>
                  </div>
                </motion.div>
                <div className="col-span-12 md:col-span-5 md:pl-12 pt-4">
                  <div className="mb-4 flex items-center space-x-4">
                    <span className="text-[10px] font-headline font-bold tracking-[0.3em] uppercase text-primary/40">{project.header || ("00" + (index + 1) + " / 2024")}</span>
                    <div className="h-[1px] w-12 bg-outline-variant/50"></div>
                  </div>
                  <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-6 uppercase text-primary">
                    {formattedTitle}
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
                  <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-6 uppercase text-primary">
                    {formattedTitle}
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
                  className="col-span-12 md:col-span-7 aspect-[16/9] bg-surface-container-low relative group overflow-hidden order-1 md:order-2"
                >
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 p-8 bg-background/80 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-headline font-bold text-secondary-fixed tracking-widest uppercase">Ver Proyecto</span>
                  </div>
                </motion.div>
              </>
            )}
          </article>
        );
      })}
    </section>
  );
};

`;

code = code.substring(0, startIdx) + newSelectedWorks + code.substring(endIdx);

if (!code.includes('import { useState, useEffect }')) {
  code = code.replace(/import { motion } from 'motion\/react';/, `import { useState, useEffect } from 'react';\nimport { motion } from 'motion/react';`);
}

fs.writeFileSync('src/App.tsx', code);
