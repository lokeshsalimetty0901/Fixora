import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Zap,
  Droplets,
  Wind,
  Hammer,
  Tv,
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  PhoneCall,
  UserCheck,
  Sparkles,
  CalendarCheck,
  Award,
  ChevronRight,
  Quote,
  Activity,
  Flame,
  Check,
} from 'lucide-react';

// Lightweight scroll-triggered reveal hook with zero dependencies
function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const elem = ref.current;
    if (!elem) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(elem);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, isVisible };
}

export const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  // Scroll reveal references for each major landing page section
  const statsReveal = useScrollReveal();
  const categoriesReveal = useScrollReveal();
  const howItWorksReveal = useScrollReveal();
  const prosReveal = useScrollReveal();
  const testimonialsReveal = useScrollReveal();
  const emergencyReveal = useScrollReveal();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/services?search=${encodeURIComponent(searchQuery)}${
        selectedCategory ? `&category=${selectedCategory}` : ''
      }`
    );
  };

  const handleQuickTagClick = (tag: string, catId?: string) => {
    setSearchQuery(tag);
    if (catId) setSelectedCategory(catId);
  };

  const categories = [
    {
      id: 'auto-mechanic',
      name: 'Emergency Auto Mechanic',
      icon: Wrench,
      description: '24/7 Roadside assistance, battery jumpstart, tire changes, diagnostic scans.',
      color: 'from-amber-500/25 to-orange-500/10 border-amber-500/30 text-amber-400',
      badge: '24/7 Emergency',
      highlight: 'Avg. 14 min arrival',
    },
    {
      id: 'electrician',
      name: 'Master Electrician',
      icon: Zap,
      description: 'Short-circuit diagnosis, breaker upgrades, EV charging, wiring & fixtures.',
      color: 'from-yellow-500/25 to-amber-500/10 border-yellow-500/30 text-yellow-400',
      badge: 'Certified',
      highlight: 'Licensed & Insured',
    },
    {
      id: 'plumbing',
      name: 'Plumbing & Water Leak',
      icon: Droplets,
      description: 'Pipe bursts, drain unblocking, water heater maintenance & leak detection.',
      color: 'from-cyan-500/25 to-blue-500/10 border-cyan-500/30 text-cyan-400',
      badge: 'Instant Dispatch',
      highlight: 'Zero Callout Fee',
    },
    {
      id: 'ac-repair',
      name: 'HVAC & AC Service',
      icon: Wind,
      description: 'Air conditioner gas refills, cooling system repair & deep chemical cleaning.',
      color: 'from-teal-500/25 to-emerald-500/10 border-teal-500/30 text-teal-400',
      badge: 'Top Rated',
      highlight: 'Guaranteed Cool',
    },
    {
      id: 'carpentry',
      name: 'Carpenter & Locksmith',
      icon: Hammer,
      description: 'Emergency lockout entry, smart digital locks, door alignments & woodwork.',
      color: 'from-indigo-500/25 to-violet-500/10 border-indigo-500/30 text-indigo-400',
      badge: 'Reliable',
      highlight: 'Rapid Lockout Help',
    },
    {
      id: 'appliances',
      name: 'Appliance Maintenance',
      icon: Tv,
      description: 'Washing machine, refrigerator, microwave & kitchen appliance repairs.',
      color: 'from-purple-500/25 to-pink-500/10 border-purple-500/30 text-purple-400',
      badge: 'Same-day Fix',
      highlight: 'Original Parts',
    },
  ];

  const topProfessionals = [
    {
      name: 'Marcus Sterling',
      role: 'Master Electrician & Auto Specialist',
      rating: 4.9,
      reviews: 48,
      experience: '9 yrs exp',
      hourly: '$75/hr',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      verified: true,
      dispatch: '< 15 mins',
      specialty: 'High-voltage & EV systems',
    },
    {
      name: 'David Miller',
      role: 'Emergency Plumber',
      rating: 4.8,
      reviews: 62,
      experience: '12 yrs exp',
      hourly: '$85/hr',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      verified: true,
      dispatch: '< 20 mins',
      specialty: 'Leak pinpointing & drain jetting',
    },
    {
      name: 'Elena Rostova',
      role: 'HVAC Cooling Technician',
      rating: 5.0,
      reviews: 35,
      experience: '7 yrs exp',
      hourly: '$70/hr',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      verified: true,
      dispatch: '< 15 mins',
      specialty: 'Inverter AC diagnostics',
    },
  ];

  const testimonials = [
    {
      quote:
        'Car battery died at 11:30 PM on my way home from the airport. Used Fixora emergency dispatch and Marcus arrived in 12 minutes with a booster pack. Phenomenal speed and professionalism!',
      author: 'Sarah Jenkins',
      role: 'Verified Customer',
      location: 'Downtown Metro',
      rating: 5,
      serviceUsed: 'Emergency Auto Mechanic',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    },
    {
      quote:
        'Had a sudden pipe burst behind my kitchen wall on a Sunday morning. The live GPS tracking was reassuring, and the plumber fixed the leak cleanly without ripping open extra drywall.',
      author: 'Robert Vance',
      role: 'Homeowner',
      location: 'Westside Suburb',
      rating: 5,
      serviceUsed: 'Plumbing & Leak Fix',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
    },
    {
      quote:
        'Our central AC stopped cooling during a 98°F heatwave. Elena arrived fully equipped with the right compressor capacitor and got the house chilled again in under an hour. 10/10 service.',
      author: 'Maya Lin',
      role: 'Verified Customer',
      location: 'Oakridge District',
      rating: 5,
      serviceUsed: 'HVAC AC Repair',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    },
  ];

  return (
    <div className="relative space-y-24 pb-20 overflow-hidden">
      {/* Background Animated Gradient Mesh & Floating Blurred Light Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Deep background foundation */}
        <div className="absolute inset-0 bg-slate-900" />

        {/* Ambient Orb 1 - Deep Indigo */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] animate-orb-1" />

        {/* Ambient Orb 2 - Vibrant Teal / Cyan */}
        <div className="absolute top-1/3 -right-24 w-[520px] h-[520px] bg-teal-500/10 rounded-full blur-[130px] animate-orb-2" />

        {/* Ambient Orb 3 - Soft Violet Accent */}
        <div className="absolute top-2/3 left-10 w-[550px] h-[550px] bg-indigo-800/15 rounded-full blur-[150px] animate-float-slow" />

        {/* Ambient Orb 4 - Emergency Glow near footer */}
        <div className="absolute bottom-10 right-1/4 w-[480px] h-[480px] bg-rose-600/10 rounded-full blur-[140px] animate-pulse-glow" />

        {/* Subtle grid texture overlay for visual depth */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto">
            {/* 1. Initial Page-load Logo Animation & Status Badge */}
            <div className="animate-logo-entrance inline-flex items-center">
              <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full glass-panel border border-indigo-500/30 bg-slate-900/80 shadow-lg shadow-indigo-950/40">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-400 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                    <Wrench className="w-3 h-3 text-teal-400" />
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
                  <span className="tracking-wider uppercase text-[10px] text-indigo-400 font-bold">FIXORA NETWORK</span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center space-x-1 text-emerald-400 font-medium text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    <span>Live Dispatch Active</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Pill */}
            <div className="animate-fade-up delay-150">
              <Link
                to="/emergency"
                className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:text-white hover:bg-rose-500/20 text-xs font-semibold transition-all group shadow-sm shadow-rose-950/30"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Need Urgent Breakdown Help? 24/7 Roadside & Home Emergency Active</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 2. Staggered Hero Heading with Premium Gradient */}
            <div className="animate-fade-up delay-200 space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Local Service Pros, <br />
                <span className="bg-gradient-to-r from-indigo-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Dispatched in Minutes.
                </span>
              </h1>
            </div>

            {/* Hero Subtitle */}
            <p className="animate-fade-up delay-300 text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Connect directly with verified mechanics, master electricians, plumbers, and HVAC specialists. Live GPS tracking, verified credentials, and upfront transparent pricing.
            </p>

            {/* 5. Polished Primary Buttons: "Book a Service" and "Get Started" */}
            <div className="animate-fade-up delay-450 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
              <Link
                to="/services"
                className="btn-primary-glow w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 flex items-center justify-center space-x-2.5 text-sm sm:text-base shadow-lg shadow-indigo-600/30 group"
              >
                <CalendarCheck className="w-4 h-4 text-teal-200 group-hover:scale-110 transition-transform" />
                <span>Book a Service</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/register"
                className="btn-secondary-glow w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-200 hover:text-white glass-panel border border-slate-700 hover:border-indigo-500/60 flex items-center justify-center space-x-2 text-sm sm:text-base group"
              >
                <Sparkles className="w-4 h-4 text-teal-400 group-hover:rotate-12 transition-transform" />
                <span>Get Started</span>
              </Link>
            </div>

            {/* Quick Search Bar */}
            <div className="animate-fade-up delay-600 max-w-2xl mx-auto pt-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="glass-panel p-2 rounded-2xl flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 border border-slate-700/80 focus-within:border-indigo-500/70 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.25)] transition-all">
                  <div className="flex-1 flex items-center px-4 w-full">
                    <Search className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search e.g. Car battery, AC gas refill, Pipe burst..."
                      className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm py-2.5"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-glow w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 text-sm flex-shrink-0"
                  >
                    <span>Find Nearby Pros</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Popular Search Quick Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs">
                <span className="text-slate-500 font-medium">Quick search:</span>
                {[
                  { label: '⚡ Flat Battery', query: 'battery jumpstart', cat: 'auto-mechanic' },
                  { label: '💧 Water Leak', query: 'water leak', cat: 'plumbing' },
                  { label: '❄️ AC Not Cooling', query: 'AC cooling', cat: 'ac-repair' },
                  { label: '🔌 Circuit Trip', query: 'short circuit', cat: 'electrician' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickTagClick(chip.query, chip.cat)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-teal-300 border border-slate-700/60 hover:border-indigo-500/40 transition-all cursor-pointer text-[11px]"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="animate-fade-up delay-750 pt-2 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">100% ID Verified Pros</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">Under 20 Min Dispatch</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">4.9/5 Average Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">Direct GPS Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PLATFORM METRICS HIGHLIGHTS ================= */}
      <section
        ref={statsReveal.ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll ${
          statsReveal.isVisible ? 'is-revealed' : ''
        }`}
      >
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/90 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            <div className="pt-2 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-teal-300 bg-clip-text text-transparent">
                1,240+
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Verified Technicians</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-white bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                &lt; 15 mins
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Average Response Time</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-white bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                99.4%
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Five-Star Satisfaction</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-white bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                <span>24/7</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Live Emergency Radius</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. SERVICE CATEGORIES GRID ================= */}
      <section
        ref={categoriesReveal.ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll ${
          categoriesReveal.isVisible ? 'is-revealed' : ''
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Local Solutions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Browse Service Categories
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Select a specialized category to connect with top-rated, background-checked specialists on standby.
            </p>
          </div>
          <Link
            to="/services"
            className="mt-4 md:mt-0 text-sm font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Cards with Smooth Hover Elevation & Gradient Accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(isSelected ? null : cat.id);
                  navigate(`/services?category=${cat.id}`);
                }}
                className={`glass-card-interactive p-6 rounded-2xl cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
                  isSelected ? 'border-teal-400/60 ring-2 ring-teal-400/20' : ''
                }`}
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                {/* Subtle card corner decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center border group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300 shadow-md`}
                    >
                      <Icon className="w-6 h-6 transition-transform group-hover:rotate-6" />
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/80 shadow-sm">
                        {cat.badge}
                      </span>
                      <span className="text-[10px] text-teal-400 font-medium">
                        {cat.highlight}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-semibold group-hover:text-teal-300 transition-colors">
                  <span>Explore Available Technicians</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center group-hover:bg-indigo-600/30 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 6. HOW FIXORA WORKS ================= */}
      <section
        ref={howItWorksReveal.ref}
        className={`bg-slate-950/70 py-16 sm:py-20 border-y border-slate-800/70 relative overflow-hidden reveal-on-scroll ${
          howItWorksReveal.isVisible ? 'is-revealed' : ''
        }`}
      >
        {/* Ambient glow behind steps */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Simple, Fast & Transparent</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              How Fixora Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Experience seamless on-demand servicing in three easy steps with live GPS monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 01 */}
            <div className="glass-card-interactive p-8 rounded-2xl relative text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/30 text-xl font-extrabold shadow-lg shadow-indigo-600/20">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Request or Emergency Ping</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Choose your required maintenance service or tap Emergency Mode to instantly broadcast your location to nearby technicians.
              </p>
              <div className="mt-4 inline-flex items-center text-[11px] font-semibold text-indigo-400">
                <span>Instant dispatch match</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="glass-card-interactive p-8 rounded-2xl relative text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-600/20 text-teal-400 flex items-center justify-center mb-6 border border-teal-500/30 text-xl font-extrabold shadow-lg shadow-teal-600/20">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Pro Assignment</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                A verified background-checked specialist accepts your request. Watch their real-time vehicle GPS navigation in real time.
              </p>
              <div className="mt-4 inline-flex items-center text-[11px] font-semibold text-teal-400">
                <span>Real-time GPS tracking</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="glass-card-interactive p-8 rounded-2xl relative text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30 text-xl font-extrabold shadow-lg shadow-emerald-600/20">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Direct Fix & Secure Checkout</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                The job is inspected and resolved professionally. Pay seamlessly online, leave honest feedback, and download your digital warranty.
              </p>
              <div className="mt-4 inline-flex items-center text-[11px] font-semibold text-emerald-400">
                <span>Protected payment & invoice</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. FEATURED PROFESSIONALS ================= */}
      <section
        ref={prosReveal.ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll ${
          prosReveal.isVisible ? 'is-revealed' : ''
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Certified Top Performers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Top Verified Professionals
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Top-tier service partners with proven 5-star reliability and immediate dispatch records.
            </p>
          </div>
          <Link
            to="/services"
            className="mt-4 md:mt-0 text-sm font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1 group"
          >
            <span>View All Professionals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topProfessionals.map((pro, index) => (
            <div
              key={index}
              className="glass-card-interactive p-6 rounded-2xl relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-teal-500/40 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white truncate">{pro.name}</h3>
                    <p className="text-xs text-slate-400 truncate">{pro.role}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {pro.experience}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{pro.dispatch}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50 mb-3">
                  <span className="text-slate-500 font-medium">Expertise: </span>
                  <span className="text-slate-300">{pro.specialty}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="text-xs font-bold">{pro.rating}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">({pro.reviews} reviews)</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-teal-400">{pro.hourly}</span>
                    <span className="block text-[10px] text-slate-500">Base Hourly</span>
                  </div>
                </div>
              </div>

              {/* Polished Book Service Button */}
              <button
                onClick={() => navigate('/services')}
                className="btn-primary-glow w-full mt-2 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-teal-500 transition-all flex items-center justify-center space-x-2 group"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>Book Service</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 6. VERIFIED TESTIMONIALS SECTION ================= */}
      <section
        ref={testimonialsReveal.ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll ${
          testimonialsReveal.isVisible ? 'is-revealed' : ''
        }`}
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Real Local Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Trusted by Homeowners & Drivers
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            See how FIXORA delivers peace of mind when unexpected breakdowns happen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="glass-card-interactive p-6 rounded-2xl flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    {item.serviceUsed}
                  </span>
                </div>

                <Quote className="w-6 h-6 text-indigo-400/40 mb-2" />
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center space-x-3">
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-400/30"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{item.author}</h4>
                  <p className="text-[11px] text-slate-400">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 7. EMERGENCY CALLOUT BANNER ================= */}
      <section
        ref={emergencyReveal.ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll ${
          emergencyReveal.isVisible ? 'is-revealed' : ''
        }`}
      >
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 relative overflow-hidden shadow-2xl shadow-rose-950/20">
          {/* Subtle animated radar ring */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/10 rounded-full blur-2xl pointer-events-none animate-pulse-glow" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40 shadow-sm">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Urgent Emergency Mode Active</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Facing a sudden roadside breakdown or water leak?
              </h2>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Tap Emergency Mode to immediately dispatch all verified mechanics, emergency plumbers, and electricians within your 15km local radius.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
              <Link
                to="/emergency"
                className="btn-primary-glow px-8 py-4 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-xl shadow-rose-600/30 transition-all flex items-center space-x-3 text-base group"
              >
                <PhoneCall className="w-5 h-5 text-white animate-bounce" />
                <span>Launch Emergency Dispatch</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
