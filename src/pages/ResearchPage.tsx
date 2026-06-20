import { Shield, Users, Landmark, Trees, Cpu, DollarSign, Calendar, Eye } from 'lucide-react';
import { Project } from '../types';

interface ResearchPageProps {
  projects: Project[];
}

export default function ResearchPage({ projects }: ResearchPageProps) {
  const ongoingProjects = projects.filter(p => p.status === 'ongoing');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const specializations = [
    {
      icon: Users,
      title: "Gender & Family Sociology",
      desc: "Investigating dual-legal frameworks, domestic violence, structural safety profiles, and customary land tenancy/inheritance guidelines for women in modern sub-Saharan households."
    },
    {
      icon: Trees,
      title: "Rural Sociology & Peasantry",
      desc: "Critiquing the evolutionary mechanics of smallholder farming networks, cooperative microlending (Esusu rings), and dynamic adaptations in changing economic environments."
    },
    {
      icon: Landmark,
      title: "Ibibio & West African Ethnography",
      desc: "Systematic field studies of historical governance models, clan integration codes, maternal mediation, and traditional pacification protocols in West African regions."
    }
  ];

  return (
    <div className="space-y-16 py-4 animate-fade-in text-left text-navy">
      {/* Page Header */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold flex items-center gap-2">
          <span className="w-6 h-[1px] bg-gold"></span>
          Academic Focus & Mission
        </h3>
        <h2 className="font-serif text-3xl font-bold text-navy uppercase leading-tight">
          Research & <span className="text-gold italic font-light">Specializations</span>
        </h2>
        <p className="text-navy/80 max-w-2xl text-xs leading-relaxed font-light mt-2">
          Pioneering sociological and anthropological insights within southeastern Nigeria to understand socioeconomic transitions, empower vulnerable populations, and shape communal policy directives.
        </p>
      </div>

      {/* Specialization Areas */}
      <section id="specialization_areas" className="space-y-6">
        <div className="border-b border-navy/10 pb-2">
          <h3 className="font-serif text-xl font-bold text-navy uppercase tracking-wider">
            Areas of <span className="text-gold italic font-light font-normal">Core Expertise</span>
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-[#002147]/50 font-semibold mt-1">
            Scholarly investigations conducted over decades of continuous ethnological research
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {specializations.map((spec, i) => (
            <div 
              key={i} 
              className="bg-white p-6 rounded-none border-t-4 border-gold border-x border-b border-navy/10 shadow-sm flex flex-col justify-between space-y-4 hover:border-gold hover:shadow-md transition duration-300"
            >
              <div className="space-y-4">
                <div className="p-3 bg-navy/5 border border-navy/10 text-gold w-fit rounded-none">
                  <spec.icon className="h-5 w-5" />
                </div>
                <h4 className="font-serif font-bold text-navy text-lg uppercase tracking-wide leading-snug">{spec.title}</h4>
                <p className="text-[#002147]/85 text-xs font-light leading-relaxed">{spec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ongoing Projects and Completed Projects */}
      <div className="grid lg:grid-cols-2 gap-12 pt-4">
        {/* Left: Ongoing Research */}
        <section id="ongoing_research" className="space-y-6">
          <div className="border-b border-navy/10 pb-3">
            <h3 className="font-serif text-2xl font-bold text-navy flex items-center gap-2 uppercase tracking-wide">
              <span className="w-2.5 h-2.5 bg-green-600 rounded-none animate-pulse shrink-0" />
              <span>Ongoing</span> <span className="text-gold italic font-light">Research Initiatives</span>
            </h3>
          </div>

          <div className="space-y-6">
            {ongoingProjects.length > 0 ? (
              ongoingProjects.map(proj => (
                <div 
                  key={proj.id} 
                  className="bg-white p-6 rounded-none border border-navy/10 shadow-xs flex flex-col justify-between space-y-4 group hover:shadow-md hover:border-gold transition-all duration-300"
                >
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold font-mono tracking-widest text-green-700 bg-green-50 px-2.5 py-1 rounded-none uppercase border border-green-200 inline-block">
                      Active Fieldwork
                    </span>
                    <h4 className="font-serif font-bold text-navy text-base sm:text-lg leading-snug uppercase tracking-wide">
                      {proj.title}
                    </h4>
                    <p className="text-[#002147]/80 text-xs sm:text-sm leading-relaxed font-light">
                      {proj.description}
                    </p>
                  </div>

                  <div className="border-t border-navy/5 pt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-navy/60 font-mono tracking-wider uppercase font-semibold">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-4 w-4 text-gold shrink-0" />
                      <span>{proj.timeline}</span>
                    </div>
                    {proj.funding && (
                      <div className="flex items-center space-x-1.5">
                        <DollarSign className="h-4 w-4 text-gold shrink-0" />
                        <span>{proj.funding}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#002147]/65 italic">No current ongoing studies recorded.</p>
            )}
          </div>
        </section>

        {/* Right: Completed Research */}
        <section id="completed_research" className="space-y-6">
          <div className="border-b border-navy/10 pb-3">
            <h3 className="font-serif text-2xl font-bold text-navy flex items-center gap-2 uppercase tracking-wide">
              <span className="w-2.5 h-2.5 bg-navy rounded-none shrink-0" />
              <span>Completed</span> <span className="text-gold italic font-light font-normal">Achievements</span>
            </h3>
          </div>

          <div className="space-y-6">
            {completedProjects.length > 0 ? (
              completedProjects.map(proj => (
                <div 
                  key={proj.id} 
                  className="bg-navy/[0.02] p-6 rounded-none border border-navy/10 flex flex-col justify-between space-y-4 group hover:shadow-xs hover:bg-white hover:border-gold transition-all duration-300"
                >
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold font-mono tracking-widest text-[#002147]/65 bg-[#fdfcf9] px-2.5 py-1 rounded-none uppercase border border-navy/10 inline-block">
                      Archived / Published
                    </span>
                    <h4 className="font-serif font-bold text-navy text-base sm:text-lg leading-snug uppercase tracking-wide">
                      {proj.title}
                    </h4>
                    <p className="text-[#002147]/80 text-xs sm:text-sm leading-relaxed font-light">
                      {proj.description}
                    </p>
                  </div>

                  <div className="border-t border-navy/5 pt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-navy/60 font-mono tracking-wider uppercase font-semibold">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-4 w-4 text-gold shrink-0" />
                      <span>{proj.timeline}</span>
                    </div>
                    {proj.funding && (
                      <div className="flex items-center space-x-1.5">
                        <DollarSign className="h-4 w-4 text-gold shrink-0" />
                        <span>{proj.funding}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#002147]/65 italic">No completed studies archived.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
