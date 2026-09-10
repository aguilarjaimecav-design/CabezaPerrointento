import { FormEvent, MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleUserRound,
  Clock3, Heart, Instagram, MapPin, Menu, MessageCircle, Minus, PackageCheck,
  PawPrint, Phone, Plus, Search, ShoppingBag, ShoppingCart, Sparkles, Truck, X, Mail,
  Home as HomeIcon, ShieldCheck, Trash2, Utensils, Star, Send, Dog, Cat, Tag, ZoomIn,
  Download, FileText,
} from 'lucide-react';
import {
  BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate, useParams,
} from 'react-router-dom';
import { CartProvider, useCart } from '@/context/CartContext';
import { CATEGORIAS, categoriaNombre, fetchFeaturedProducts, fetchProductById, fetchProducts, fetchRelatedProducts } from '@/data/products';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { formatPrice, displayPrice } from '@/utils/format';
import { getProductTags } from '@/utils/product-tags';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { StarRating } from '@/components/ui/StarRating';
import {
  AvisoLegal, PoliticaPrivacidad, PoliticaCookies, CondicionesCompra,
  DevolucionesDesistimiento, ReservasCancelaciones, EnviosEntregas, AtencionReclamaciones,
} from '@/components/LegalPages';

const logo = '/images/logo-cabeza-perro.jpg';
const careImage = 'https://images.pexels.com/photos/5426879/pexels-photo-5426879.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const walkImage = 'https://images.pexels.com/photos/14929572/pexels-photo-14929572.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const catAbout = 'https://images.pexels.com/photos/17267274/pexels-photo-17267274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';


function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link to="/" onClick={scrollTop} className={`flex items-center gap-2.5 ${compact ? '' : 'group'}`}>
    <img src={logo} alt="Logo CabezaPerro" className={`${compact ? 'h-12 w-12' : 'h-14 w-14'} rounded-full object-cover ring-1 ring-cream-300 transition group-hover:rotate-3`} />
    <span className={`font-serif text-xl font-bold tracking-tight ${compact ? 'text-cream-300' : 'text-primary-700'}`}>Cabeza<span className={compact ? 'text-cream-300' : 'text-accent-600'}>Perro</span></span>
  </Link>;
}

const FREE_SHIPPING_THRESHOLD = 25;
const TOP_BANNER_MESSAGES = [
  `ENTREGA A DOMICILIO EN SEVILLA · ENVÍO GRATIS DESDE ${FREE_SHIPPING_THRESHOLD} €`,
  'PASEOS Y CUIDADOS A DOMICILIO EN SEVILLA',
  'PAGO SEGURO · ATENCIÓN POR WHATSAPP',
];

function ImageZoom({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };
  return (
    <div
      ref={containerRef}
      className="aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-cream-100"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMove}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover mix-blend-multiply transition-transform duration-200"
        style={zoom ? { transform: `scale(2.2)`, transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
      />
      {!zoom && <span className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream-50/90 text-primary-700 shadow-sm"><ZoomIn size={15} /></span>}
    </div>
  );
}

const PROMO_MESSAGES = [
  { icon: 'truck', text: 'Envío gratis en pedidos desde 25 € en Sevilla y alrededores' },
  { icon: 'paw', text: 'Paseos disponibles esta semana — reserva tu hueco' },
  { icon: 'sparkles', text: 'Novedad: aceite de salmón para perros y gatos' },
  { icon: 'tag', text: 'Complementos y aperitivos nuevos en la tienda' },
];

function PromoBanner() {
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % PROMO_MESSAGES.length);
        setExiting(false);
      }, 300);
    }, 4500);
    return () => clearInterval(interval);
  }, []);
  const msg = PROMO_MESSAGES[index];
  const iconEl = msg.icon === 'truck' ? <Truck size={15} /> : msg.icon === 'paw' ? <PawPrint size={15} /> : msg.icon === 'sparkles' ? <Sparkles size={15} /> : <Tag size={15} />;
  return (
    <div className="bg-accent-500/10 border-y border-accent-500/20">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2.5 px-5 py-2.5 lg:px-8">
        <span className="text-accent-700">{iconEl}</span>
        <p className={`text-xs font-semibold text-primary-800 sm:text-sm ${exiting ? 'promo-exit' : 'promo-enter'}`}>{msg.text}</p>
      </div>
    </div>
  );
}

function TopBanner() {
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % TOP_BANNER_MESSAGES.length);
        setExiting(false);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="bg-primary-700 px-4 py-2 text-center text-[11px] font-semibold tracking-[0.16em] text-cream-100 overflow-hidden">
      <p className={`transition-all duration-300 ${exiting ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>{TOP_BANNER_MESSAGES[index]}</p>
    </div>
  );
}

function CartToast() {
  const { lastAdded } = useCart();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  useEffect(() => {
    if (!lastAdded) return;
    setProduct(lastAdded);
    setVisible(true);
    setExiting(false);
    const t1 = setTimeout(() => setExiting(true), 1900);
    const t2 = setTimeout(() => setVisible(false), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [lastAdded]);
  if (!visible || !product) return null;
  return (
    <div className={`fixed bottom-24 right-5 z-50 flex items-center gap-3 rounded-2xl bg-primary-800 px-5 py-4 text-cream-50 shadow-soft ${exiting ? 'toast-exit' : 'toast-enter'}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-500 text-cream-50"><Check size={18} /></span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-accent-300">Añadido al carrito</p>
        <p className="mt-0.5 truncate text-sm font-semibold">{product.nombre}</p>
      </div>
    </div>
  );
}

function SearchBar({ term, setTerm, onSubmit, onClose }: { term: string; setTerm: (v: string) => void; onSubmit: () => void; onClose: () => void }) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { fetchProducts().then(setAllProducts); }, []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setSuggestionsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const suggestions = useMemo(() => {
    if (!term.trim()) return [];
    const q = term.toLowerCase();
    return allProducts.filter((p) => `${p.nombre} ${p.marca} ${p.descripcionBreve}`.toLowerCase().includes(q)).slice(0, 5);
  }, [allProducts, term]);
  return (
    <div ref={containerRef} className="relative mx-auto max-w-2xl">
      <form onSubmit={(e) => { e.preventDefault(); if (suggestions.length > 0) { setSuggestionsOpen(false); } onSubmit(); }} className="flex items-center gap-2 rounded-full border border-secondary-300 bg-white px-4 py-2">
        <Search size={17} className="text-secondary-500" />
        <input autoFocus value={term} onChange={(e) => { setTerm(e.target.value); setSuggestionsOpen(true); }} onFocus={() => term && setSuggestionsOpen(true)} placeholder="¿Qué estás buscando?" className="flex-1 bg-transparent text-sm outline-none" />
        {term && <button type="button" onClick={() => { setTerm(''); setSuggestionsOpen(false); }} aria-label="Limpiar"><X size={15} className="text-secondary-400" /></button>}
        <button type="submit" className="text-xs font-bold uppercase tracking-wider text-primary-700">Buscar</button>
      </form>
      {suggestionsOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 py-2 shadow-soft">
          {suggestions.map((p) => (
            <Link key={p.id} to={`/producto/${p.id}`} onClick={() => { setSuggestionsOpen(false); onClose(); scrollTop(); }} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-cream-100">
              <img src={p.imagen} alt="" className="h-11 w-11 rounded-lg object-cover mix-blend-multiply" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-primary-800">{p.nombre}</p>
                <p className="text-xs text-secondary-500">{p.marca} · {displayPrice(p.precio)}</p>
              </div>
              <ArrowRight size={15} className="shrink-0 text-secondary-400" />
            </Link>
          ))}
          <button onClick={() => { setSuggestionsOpen(false); onSubmit(); }} className="mt-1 w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent-700 transition hover:bg-cream-100">Ver todos los resultados</button>
        </div>
      )}
    </div>
  );
}

function Header() {
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState('');
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    ['Inicio', '/'], ['Tienda', '/tienda'], ['Perros', '/tienda?especie=perro'],
    ['Gatos', '/tienda?especie=gato'], ['Paseos y cuidados', '/paseos-y-cuidados'],
    ['Quiénes somos', '/quienes-somos'], ['Contacto', '/contacto'],
  ];
  const submitSearch = () => {
    if (!term.trim()) return;
    navigate(`/tienda?busqueda=${encodeURIComponent(term)}`);
    setSearchOpen(false); setMobile(false); scrollTop();
  };
  return <>
    <TopBanner />
    <header className="sticky top-0 z-40 border-b border-cream-300/60 bg-cream-50/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-5 xl:flex">
          {navItems.map(([label, href]) => <NavLink key={label} to={href} onClick={scrollTop} className={({ isActive }) => `text-[11px] font-bold uppercase tracking-[0.09em] transition ${isActive && (href === '/' ? location.pathname === '/' : location.pathname.startsWith(href.split('?')[0])) ? 'text-accent-700' : 'text-primary-700 hover:text-accent-700'}`}>{label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-1">
          <button aria-label="Buscar" onClick={() => setSearchOpen((v) => !v)} className="icon-button"><Search size={19} /></button>
          <button aria-label="Mi cuenta" onClick={() => navigate('/contacto')} className="icon-button hidden sm:flex"><CircleUserRound size={19} /></button>
          <Link aria-label="Carrito" to="/carrito" onClick={scrollTop} className="icon-button relative"><ShoppingCart size={20} />{totalItems > 0 && <span key={totalItems} className="cart-badge cart-badge-bounce">{totalItems}</span>}</Link>
          <button aria-label="Abrir menú" onClick={() => setMobile((v) => !v)} className="icon-button xl:hidden">{mobile ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {searchOpen && <div className="border-t border-cream-300/60 bg-cream-100 px-5 py-3"><SearchBar term={term} setTerm={setTerm} onSubmit={submitSearch} onClose={() => setSearchOpen(false)} /></div>}
      {mobile && <nav className="border-t border-cream-300 bg-cream-50 px-5 py-4 xl:hidden"><div className="grid gap-1">{navItems.map(([label, href]) => <Link key={label} to={href} onClick={() => { setMobile(false); scrollTop(); }} className="border-b border-cream-200 py-3 text-sm font-bold text-primary-700 transition hover:text-accent-700">{label}</Link>)}</div></nav>}
    </header>
  </>;
}

function Footer() {
  return <footer className="bg-primary-800 text-cream-100"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-8">
    <div><Brand compact /><p className="mt-5 max-w-xs text-sm leading-7 text-cream-200">Alimentación, paseos y cuidados para quienes más quieres. Una tienda cercana en Sevilla.</p><div className="mt-6 flex gap-3"><a href="https://instagram.com/cabeza.perro" target="_blank" rel="noreferrer" className="social-dark"><Instagram size={17} /></a><a href="https://www.tiktok.com/@cabeza_perro" target="_blank" rel="noreferrer" className="social-dark">♪</a><a href="https://wa.me/34644789324" target="_blank" rel="noreferrer" className="social-dark"><MessageCircle size={17} /></a></div></div>
    <div><h3 className="footer-heading">Navegación</h3><div className="footer-links grid gap-3 text-sm text-cream-200"><Link to="/" onClick={scrollTop}>Inicio</Link><Link to="/tienda" onClick={scrollTop}>Tienda</Link><Link to="/tienda?especie=perro" onClick={scrollTop}>Perros</Link><Link to="/tienda?especie=gato" onClick={scrollTop}>Gatos</Link><Link to="/paseos-y-cuidados" onClick={scrollTop}>Paseos y cuidados</Link><Link to="/quienes-somos" onClick={scrollTop}>Quiénes somos</Link><Link to="/contacto" onClick={scrollTop}>Contacto</Link></div></div>
    <div><h3 className="footer-heading">Ayuda</h3><div className="footer-links grid gap-3 text-sm text-cream-200"><Link to="/contacto#faq" onClick={scrollTop}>Preguntas frecuentes</Link><Link to="/envios-y-entregas" onClick={scrollTop}>Envíos</Link><Link to="/devoluciones-y-desistimiento" onClick={scrollTop}>Devoluciones</Link><Link to="/contacto" onClick={scrollTop}>Contacto</Link></div></div>
    <div><h3 className="footer-heading">Información legal</h3><div className="footer-links grid gap-2.5 text-sm text-cream-200"><Link to="/aviso-legal" onClick={scrollTop}>Aviso legal</Link><Link to="/politica-privacidad" onClick={scrollTop}>Política de privacidad</Link><Link to="/politica-cookies" onClick={scrollTop}>Política de cookies</Link><Link to="/condiciones-compra" onClick={scrollTop}>Condiciones de compra</Link><Link to="/devoluciones-y-desistimiento" onClick={scrollTop}>Devoluciones y desistimiento</Link><Link to="/reservas-y-cancelaciones" onClick={scrollTop}>Reservas y cancelaciones</Link><Link to="/envios-y-entregas" onClick={scrollTop}>Envíos y entregas</Link><Link to="/atencion-al-cliente-y-reclamaciones" onClick={scrollTop}>Atención al cliente y reclamaciones</Link></div></div>
    <div><h3 className="footer-heading">Estamos cerca</h3><div className="footer-links grid gap-4 text-sm text-cream-200"><a href="https://wa.me/34644789324" target="_blank" rel="noreferrer" className="flex gap-2"><MessageCircle size={17} className="shrink-0 text-accent-300" /> +34 644 789 324</a><a href="mailto:cabezaperro015@gmail.com" className="flex gap-2"><Mail size={17} className="shrink-0 text-accent-300" /> cabezaperro015@gmail.com</a><span className="flex gap-2"><MapPin size={17} className="shrink-0 text-accent-300" /> Sevilla</span></div></div>
  </div><div className="border-t border-primary-600 px-5 py-5 text-center text-xs text-cream-300">© {new Date().getFullYear()} CabezaPerro · Hecho con cuidado en Sevilla</div></footer>;
}

function WhatsAppButton() { return <a href="https://wa.me/34644789324" target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp" className="whatsapp-breathing fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary-700 text-cream-50 shadow-soft transition hover:-translate-y-1 hover:bg-primary-600"><MessageCircle size={25} /></a>; }

function Layout({ children }: { children: React.ReactNode }) { return <><Header /><main>{children}</main><WhatsAppButton /><CartToast /><Footer /></>; }

function SectionIntro({ eyebrow, title, text, centered = false }: { eyebrow: string; title: string; text?: string; centered?: boolean }) { return <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}><p className="eyebrow">{eyebrow}</p><h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-primary-800 md:text-5xl">{title}</h1>{text && <p className="mt-5 text-base leading-7 text-secondary-700">{text}</p>}</div>; }

function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart(); const navigate = useNavigate();
  const { ref, visible } = useScrollReveal<HTMLElement>();
  const tags = getProductTags(product);
  const hasOldPrice = product.precioAnterior && product.precioAnterior > product.precio;
  return <article ref={ref} className={`reveal-item group relative flex flex-col overflow-hidden rounded-2xl border border-cream-300/80 bg-cream-50 transition duration-300 hover:-translate-y-1 hover:shadow-soft ${visible ? 'reveal-visible' : ''}`} style={visible ? { animationDelay: `${index * 60}ms` } : undefined}>
    <Link to={`/producto/${product.id}`} onClick={scrollTop} className="relative aspect-square overflow-hidden bg-cream-100"><img src={product.imagen} alt={product.nombre} className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" />{tags.length > 0 && <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{tags.slice(0, 2).map((tag) => <span key={tag.label} className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${tag.className}`}>{tag.label}</span>)}</div>}<button type="button" aria-label="Añadir a favoritos" onClick={(e) => e.preventDefault()} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream-50/85 text-primary-700 opacity-0 shadow-sm transition group-hover:opacity-100"><Heart size={17} /></button></Link>
    <div className="flex flex-1 flex-col p-5"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-700">{product.marca} · {product.formato}</p><Link to={`/producto/${product.id}`} onClick={scrollTop}><h3 className="mt-2 font-serif text-xl leading-snug text-primary-800 transition hover:text-accent-700">{product.nombre}</h3></Link><p className="mt-2 line-clamp-2 text-sm leading-6 text-secondary-600">{product.descripcionBreve}</p><div className="mt-3"><StarRating valoracion={product.valoracion} numValoraciones={product.numValoraciones} size={13} /></div><div className="mt-auto pt-5"><div className="flex items-center justify-between"><div className="flex items-baseline gap-2">{hasOldPrice && <span className="text-sm text-secondary-400 line-through">{formatPrice(product.precioAnterior!)}</span>}<span className="text-xl font-bold text-primary-800">{displayPrice(product.precio)}</span></div>{product.precio > 0 ? <button onClick={() => addItem(product, 1)} className="button-icon bg-primary-700 text-cream-50 hover:bg-primary-600" aria-label="Añadir al carrito"><ShoppingBag size={18} /></button> : <span className="text-xs text-secondary-500">Disponible pronto</span>}</div></div></div>
  </article>;
}

function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Product[]>([]);
  useEffect(() => { fetchFeaturedProducts(3).then(setFeatured); }, []);
  return <div className="animate-fadeIn"><section className="hero-section"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20"><div className="relative z-10"><p className="eyebrow text-cream-200">Alimentación · Paseos · Cuidados</p><h1 className="mt-5 max-w-xl font-serif text-5xl font-semibold leading-[1.05] text-cream-50 sm:text-6xl lg:text-7xl">Alimenta,<br /><em className="font-normal text-cream-300">cuida</em> y disfruta.</h1><p className="mt-7 max-w-lg text-base leading-7 text-cream-100 md:text-lg">Alimentación para perros y gatos, paseos y cuidados a domicilio en Sevilla. Todo lo que necesitan, con el cariño de siempre.</p><div className="mt-9 flex flex-wrap gap-3"><button onClick={() => { navigate('/tienda'); scrollTop(); }} className="button-light">Ver productos <ArrowRight size={17} /></button><button onClick={() => { navigate('/reservar'); scrollTop(); }} className="button-outline-light">Reservar un paseo</button></div><div className="mt-12 flex items-center gap-5 border-t border-cream-100/20 pt-5 text-xs text-cream-200"><span className="flex items-center gap-2"><MapPin size={15} /> Sevilla</span><span className="h-1 w-1 rounded-full bg-accent-400" /><span className="flex items-center gap-2"><ShieldCheck size={15} /> Trato cercano</span></div></div><div className="relative"><div className="relative mx-auto" style={{ maxWidth: '315px' }}><div className="absolute -inset-3 rounded-[2rem] border border-accent-400/40" /><div className="relative aspect-[9/16] max-h-[560px] overflow-hidden rounded-[1.7rem]"><img src="/images/WhatsApp_Image_2026-08-14_at_23.53.43.jpeg" alt="Cuidado con raíces" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-primary-900/45 via-transparent to-transparent" /><div className="absolute bottom-6 left-6 rounded-xl bg-cream-50/95 px-4 py-3 shadow-soft"><p className="font-serif text-lg text-primary-800">Cuidado con raíces</p><p className="mt-0.5 text-xs text-secondary-600">Desde Sevilla, para ellos.</p></div></div><div className="absolute -bottom-5 -left-4 hidden h-20 w-20 items-center justify-center rounded-full border border-accent-400 bg-cream-100 text-center text-[10px] font-bold uppercase leading-4 tracking-wider text-primary-700 sm:flex">Hecho<br />con cariño</div></div></div></div></section>
    <section className="bg-primary-800 py-10"><div className="mx-auto max-w-7xl px-5 lg:px-8"><TrustBar variant="dark" /></div></section>
    <section className="border-b border-cream-300/60 bg-cream-100"><div className="mx-auto grid max-w-7xl divide-y divide-cream-300/70 px-5 py-7 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8"><InfoMini icon={<Truck size={20} />} title="Te lo llevamos" text="En Sevilla" /><InfoMini icon={<Utensils size={20} />} title="Bien elegido" text="Productos de confianza" /><InfoMini icon={<MessageCircle size={20} />} title="Estamos cerca" text="Te atendemos por WhatsApp" /></div></section>
    <PromoBanner />
    <section className="section-space"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><SectionIntro eyebrow="Para cada compañero" title="Lo que más se llevan" text="Alimentación pensada para cada etapa, cada gusto y cada forma de ser." /><Link to="/tienda" onClick={scrollTop} className="button-text shrink-0">Ver toda la tienda <ArrowRight size={16} /></Link></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.map((p, i) => <ProductCard product={p} key={p.id} index={i} />)}</div></div></section>
    <section className="section-space"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="rounded-3xl bg-primary-700 p-8 text-cream-50 md:p-12"><div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><p className="eyebrow text-cream-300">Cuando lo necesitas</p><h2 className="mt-3 font-serif text-4xl md:text-5xl">Paseos y cuidados<br /><em className="font-normal text-cream-300">personalizados.</em></h2><p className="mt-5 max-w-xl leading-7 text-cream-100">Porque ellos también necesitan su momento. Conocemos sus rutinas, respetamos su forma de ser y les cuidamos como si fueran nuestros.</p></div><Link to="/paseos-y-cuidados" onClick={scrollTop} className="button-light">Descubrir servicios <ArrowRight size={17} /></Link></div></div></div></section>
    <section className="bg-cream-100 py-20"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[1fr_1fr] lg:px-8"><div className="overflow-hidden rounded-2xl"><img src={careImage} alt="Persona cuidando a su perro en casa" className="h-[440px] w-full object-cover" /></div><div className="max-w-xl"><SectionIntro eyebrow="Mucho más que una tienda" title="Ellos son uno más de la familia." text="En CabezaPerro creemos que cuidar bien empieza por conocerles. Por eso juntamos alimentación de calidad con servicios pensados para que estén bien, también cuando tú no puedes estar." /><div className="mt-8 grid gap-5 sm:grid-cols-3"><Value icon={<Heart size={19} />} title="Cercanía" /><Value icon={<Sparkles size={19} />} title="Calidad" /><Value icon={<ShieldCheck size={19} />} title="Confianza" /></div><Link to="/quienes-somos" onClick={scrollTop} className="button-dark mt-9">Conócenos <ArrowRight size={17} /></Link></div></div></section>
  </div>;
}

function InfoMini({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="flex items-center gap-4 px-0 py-4 sm:px-6 sm:first:pl-0"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-50 text-accent-600">{icon}</span><div><p className="text-sm font-bold text-primary-800">{title}</p><p className="mt-0.5 text-xs text-secondary-600">{text}</p></div></div>; }
function Value({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="flex items-center gap-3"><span className="text-accent-600">{icon}</span><span className="text-sm font-bold text-primary-800">{title}</span></div>; }
function TrustBar({ variant = 'light' }: { variant?: 'light' | 'dark' }) { const items = [{ icon: <ShieldCheck size={18} />, label: 'Pago seguro' }, { icon: <Truck size={18} />, label: 'Envío en 24h' }, { icon: <Sparkles size={18} />, label: 'Productos seleccionados' }, { icon: <MessageCircle size={18} />, label: 'Atención por WhatsApp' }]; const isDark = variant === 'dark'; return <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{items.map((item) => <div key={item.label} className={`flex flex-col items-center gap-2 text-center ${isDark ? 'text-cream-200' : 'text-secondary-700'}`}><span className={`flex h-11 w-11 items-center justify-center rounded-full ${isDark ? 'bg-cream-50/10 text-accent-300' : 'bg-cream-50 text-accent-600 ring-1 ring-cream-300'}`}>{item.icon}</span><span className="text-xs font-bold">{item.label}</span></div>)}</div>; }

function Shop() {
  const location = useLocation(); const params = new URLSearchParams(location.search); const initialCategory = params.get('categoria') || 'todas'; const initialSpecies = params.get('especie') || 'todas'; const initialSearch = params.get('busqueda') || '';
  const [category, setCategory] = useState(initialCategory); const [species, setSpecies] = useState(initialSpecies); const [search, setSearch] = useState(initialSearch); const [sort, setSort] = useState('destacados'); const [brand, setBrand] = useState('todas');
  const [allProducts, setAllProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetchProducts().then((p) => { setAllProducts(p); setLoading(false); }); }, []);
  useEffect(() => { const p = new URLSearchParams(location.search); setCategory(p.get('categoria') || 'todas'); setSpecies(p.get('especie') || 'todas'); setSearch(p.get('busqueda') || ''); }, [location.search]);
  const visibleCategories = useMemo(() => { if (species === 'todas') return CATEGORIAS; return CATEGORIAS.filter((c) => c.especie === species || c.especie === 'ambas'); }, [species]);
  const brands = useMemo(() => { const set = new Set<string>(); allProducts.filter((p) => (species === 'todas' || p.especie === species) && (category === 'todas' || p.categoria === category)).forEach((p) => set.add(p.marca)); return Array.from(set).sort(); }, [allProducts, species, category]);
  useEffect(() => { if (species !== 'todas') { const validCats = CATEGORIAS.filter((c) => c.especie === species || c.especie === 'ambas').map((c) => c.slug); if (category !== 'todas' && !validCats.includes(category as string)) setCategory('todas'); } if (brand !== 'todas') { const validBrands = new Set(allProducts.filter((p) => (species === 'todas' || p.especie === species) && (category === 'todas' || p.categoria === category)).map((p) => p.marca)); if (!validBrands.has(brand)) setBrand('todas'); } }, [species, category, brand, allProducts]);
  const filtered = useMemo(() => { let result = allProducts.filter((p) => (category === 'todas' || p.categoria === category) && (species === 'todas' || p.especie === species) && (brand === 'todas' || p.marca === brand) && (!search || `${p.nombre} ${p.marca} ${p.descripcionBreve} ${p.categoria}`.toLowerCase().includes(search.toLowerCase()))); if (sort === 'precio-asc') result = [...result].sort((a, b) => a.precio - b.precio); if (sort === 'precio-desc') result = [...result].sort((a, b) => b.precio - a.precio); return result; }, [allProducts, category, species, search, sort, brand]);
  return <div className="animate-fadeIn"><div className="page-heading"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionIntro eyebrow="La tienda" title="Comer bien también es cuidar." text="Elige con calma. Hemos seleccionado alimentos honestos y equilibrados para perros y gatos felices." /></div></div><div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="grid gap-4 md:grid-cols-[1fr_auto]"><div className="flex flex-wrap gap-2"><FilterPill active={species === 'todas'} onClick={() => setSpecies('todas')} icon={<PawPrint size={14} />}>Todos</FilterPill><FilterPill active={species === 'perro'} onClick={() => setSpecies('perro')} icon={<Dog size={14} />}>Perros</FilterPill><FilterPill active={species === 'gato'} onClick={() => setSpecies('gato')} icon={<Cat size={14} />}>Gatos</FilterPill></div><div className="relative"><select value={sort} onChange={(e) => setSort(e.target.value)} className="select-control pr-9"><option value="destacados">Ordenar: destacados</option><option value="precio-asc">Precio: menor a mayor</option><option value="precio-desc">Precio: mayor a menor</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-secondary-500" /></div></div><div className="mt-5 flex gap-2 overflow-x-auto pb-2"><FilterPill active={category === 'todas'} onClick={() => setCategory('todas')}>Toda la tienda</FilterPill>{visibleCategories.map((c) => <FilterPill key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>{c.nombre}</FilterPill>)}</div>{brands.length > 1 && <div className="mt-4"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary-500"><Tag size={13} /> Marcas</div><div className="flex flex-wrap gap-2"><FilterPill active={brand === 'todas'} onClick={() => setBrand('todas')}>Todas las marcas</FilterPill>{brands.map((b) => <FilterPill key={b} active={brand === b} onClick={() => setBrand(b)}>{b}</FilterPill>)}</div></div>}<div className="mt-5 relative max-w-md"><Search size={16} className="pointer-events-none absolute left-4 top-3.5 text-secondary-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, marca o categoría…" className="w-full rounded-full border border-cream-300 bg-cream-50 py-3 pl-11 pr-4 text-sm text-primary-800 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-200" />{search && <button onClick={() => setSearch('')} aria-label="Limpiar búsqueda" className="absolute right-3 top-3 text-secondary-400 transition hover:text-secondary-600"><X size={16} /></button>}</div>{search && <p className="mt-3 text-sm text-secondary-600">Mostrando resultados para: <strong className="text-primary-800">"{search}"</strong></p>}<div className="mt-6 flex items-center justify-between border-b border-cream-300 pb-4"><p className="text-sm text-secondary-600"><strong className="text-primary-800">{loading ? '…' : filtered.length}</strong> productos</p><div className="hidden items-center gap-2 text-xs text-secondary-500 sm:flex"><Tag size={14} /> Selección local y honesta</div></div>{loading ? <div className="mt-12 text-center text-secondary-500">Cargando productos…</div> : filtered.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div> : <EmptyState title="No hemos encontrado productos" text="Prueba con otra búsqueda o categoría." onReset={() => { setSearch(''); setCategory('todas'); setSpecies('todas'); setBrand('todas'); }} />}</div></div>;
}
function FilterPill({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon?: React.ReactNode }) { return <button onClick={onClick} className={`filter-pill ${active ? 'filter-pill-active' : ''}`}>{icon}{children}</button>; }
function EmptyState({ title, text, onReset }: { title: string; text: string; onReset?: () => void }) { return <div className="py-20 text-center"><PawPrint className="mx-auto text-accent-500" size={35} /><h2 className="mt-4 font-serif text-2xl text-primary-800">{title}</h2><p className="mt-2 text-sm text-secondary-600">{text}</p>{onReset && <button onClick={onReset} className="button-dark mt-6">Ver todo</button>}</div>; }
function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) { const steps = ['Carrito', 'Datos', 'Pago']; return <div className="mx-auto flex max-w-md items-center justify-center">{steps.map((label, i) => { const stepNum = i + 1; const isActive = stepNum === current; const isDone = stepNum < current; return <div key={label} className="flex items-center"><div className="flex flex-col items-center gap-2"><div className={`step-circle ${isActive ? 'step-active' : isDone ? 'step-done' : 'step-pending'}`}>{isDone ? <Check size={16} /> : stepNum}</div><span className={`text-xs font-bold ${isActive ? 'text-primary-800' : 'text-secondary-400'}`}>{label}</span></div>{i < steps.length - 1 && <div className={`step-line mx-3 mb-6 ${stepNum < current ? 'step-line-done' : 'step-line-pending'}`} />}</div>; })}</div>; }

function ProductDetail() {
  const { id } = useParams(); const { addItem } = useCart(); const [quantity, setQuantity] = useState(1); const [tab, setTab] = useState<'descripcion' | 'nutricional'>('descripcion');
  const [product, setProduct] = useState<Product | null>(null); const [related, setRelated] = useState<Product[]>([]); const [loading, setLoading] = useState(true); const [image, setImage] = useState('');
  useEffect(() => { let active = true; setLoading(true); setProduct(null); setImage(''); setQuantity(1); fetchProductById(id || '').then((p) => { if (!active) return; setProduct(p); setImage(p?.imagen || ''); setLoading(false); if (p) fetchRelatedProducts(p).then((r) => { if (active) setRelated(r); }); }); return () => { active = false; }; }, [id]);
  if (loading) return <div className="page-heading"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="py-20 text-center text-secondary-500">Cargando producto…</div></div></div>;
  if (!product) return <div className="page-heading"><div className="mx-auto max-w-7xl px-5 lg:px-8"><EmptyState title="Producto no encontrado" text="Puede que ya no esté disponible." /></div></div>;
  const p = product;
  return <div className="animate-fadeIn"><div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><Link to="/tienda" onClick={scrollTop} className="button-text"><ChevronLeft size={16} /> Volver a la tienda</Link><div className="mt-8 grid gap-12 lg:grid-cols-2"><div className="flex gap-4"><div className="hidden w-20 shrink-0 gap-3 sm:grid">{p.galeria.map((img) => <button key={img} onClick={() => setImage(img)} className={`aspect-square overflow-hidden rounded-xl border-2 ${image === img ? 'border-accent-500' : 'border-transparent'}`}><img src={img} alt="" className="h-full w-full object-cover" /></button>)}</div><ImageZoom src={image} alt={p.nombre} /></div><div className="flex flex-col justify-center"><p className="eyebrow">{p.marca} · {categoriaNombre(p.categoria)}</p><h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-primary-800 md:text-5xl">{p.nombre}</h1><div className="mt-5"><StarRating valoracion={p.valoracion} numValoraciones={p.numValoraciones} /></div><p className="mt-6 text-3xl font-bold text-primary-800">{displayPrice(p.precio)}</p><p className="mt-1 text-sm text-secondary-600">Formato: {p.formato}</p><p className="mt-6 leading-7 text-secondary-700">{p.descripcionLarga}</p><div className="mt-8 flex flex-wrap items-center gap-4">{p.precio > 0 ? <><QuantitySelector cantidad={quantity} onChange={setQuantity} /><button onClick={() => addItem(p, quantity)} className="button-dark flex-1 sm:flex-none">Añadir al carrito <ShoppingBag size={17} /></button></> : <span className="rounded-xl bg-cream-100 px-4 py-3 text-sm text-secondary-600">Disponible próximamente. Consúltanos por WhatsApp.</span>}</div><div className="mt-8 grid gap-3 border-t border-cream-300 pt-6 text-sm text-secondary-700 sm:grid-cols-2"><span className="flex items-center gap-2"><Truck size={17} className="text-accent-600" /> Entrega en Sevilla</span><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-accent-600" /> Compra segura</span></div><FreeShippingBar subtotal={p.precio} /></div></div><div className="mt-16 border-t border-cream-300 pt-8"><div className="flex gap-6 border-b border-cream-300"><button onClick={() => setTab('descripcion')} className={`pb-3 text-sm font-bold ${tab === 'descripcion' ? 'border-b-2 border-primary-700 text-primary-800' : 'text-secondary-500'}`}>Ingredientes</button><button onClick={() => setTab('nutricional')} className={`pb-3 text-sm font-bold ${tab === 'nutricional' ? 'border-b-2 border-primary-700 text-primary-800' : 'text-secondary-500'}`}>Información nutricional</button></div><div className="max-w-3xl py-6 text-sm leading-7 text-secondary-700">{tab === 'descripcion' ? p.ingredientes : <div className="grid max-w-md gap-2">{p.informacionNutricional.map((n) => <div key={n.etiqueta} className="flex justify-between border-b border-cream-200 py-2"><span>{n.etiqueta}</span><strong className="text-primary-800">{n.valor}</strong></div>)}</div>}</div></div><div className="mt-12"><SectionIntro eyebrow="Para completar" title="También te puede interesar" /><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((rp, i) => <ProductCard key={rp.id} product={rp} index={i} />)}</div></div></div></div>;
}

function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart(); const navigate = useNavigate();
  return <div className="animate-fadeIn"><div className="page-heading"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionIntro eyebrow="Tu selección" title="Tu carrito" text="Revisa tu pedido antes de seguir. Los productos se guardan mientras navegas." /></div></div><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_370px] lg:px-8">{items.length === 0 ? <div className="lg:col-span-2"><EmptyState title="Tu carrito está esperando" text="Añade algo rico para empezar a preparar tu pedido." onReset={() => navigate('/tienda')} /></div> : <><div className="space-y-3"><FreeShippingBar subtotal={subtotal} />{items.map(({ product, cantidad }) => <div key={product.id} className="flex gap-4 rounded-2xl border border-cream-300 bg-cream-50 p-4 sm:items-center"><img src={product.imagen} alt={product.nombre} className="h-24 w-24 rounded-xl object-cover mix-blend-multiply" /><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-accent-700">{product.marca} · {product.formato}</p><Link to={`/producto/${product.id}`} onClick={scrollTop} className="mt-1 block font-serif text-lg text-primary-800">{product.nombre}</Link><p className="mt-1 text-sm font-bold text-primary-800">{displayPrice(product.precio)}</p></div><div className="flex flex-col items-end gap-3"><button onClick={() => removeItem(product.id)} aria-label="Eliminar producto" className="text-secondary-400 transition hover:text-error-600"><Trash2 size={17} /></button><QuantitySelector cantidad={cantidad} onChange={(n) => updateQuantity(product.id, n)} size="sm" /></div></div>)}<Link to="/tienda" onClick={scrollTop} className="button-text mt-5"><ChevronLeft size={16} /> Continuar comprando</Link></div><aside className="h-fit rounded-2xl bg-cream-100 p-6"><h2 className="font-serif text-2xl text-primary-800">Resumen del pedido</h2><FreeShippingBar subtotal={subtotal} /><div className="mt-6 grid gap-4 border-b border-cream-300 pb-5 text-sm"><div className="flex justify-between text-secondary-700"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between text-secondary-700"><span>Envío</span><span className="text-secondary-500">Se calcula en el checkout</span></div></div><div className="flex justify-between py-5 text-lg font-bold text-primary-800"><span>Total</span><span>{formatPrice(subtotal)}</span></div><button onClick={() => { navigate('/checkout'); scrollTop(); }} className="button-dark w-full">Finalizar compra <ArrowRight size={17} /></button><p className="mt-4 text-center text-xs leading-5 text-secondary-600">Pago seguro · Envío a domicilio en Sevilla y alrededores</p></aside></>}</div></div>;
}

function Checkout() {
  const { items, subtotal, clearCart } = useCart(); const navigate = useNavigate();
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const [envio, setEnvio] = useState<number | null>(null);
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [envioDisponible, setEnvioDisponible] = useState(true);
  const [envioError, setEnvioError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCode, setAppliedCode] = useState('');
  const totalDiscount = discount ?? 0;
  const total = envio !== null ? Math.max(0, subtotal - totalDiscount) + envio : Math.max(0, subtotal - totalDiscount);
  const calcularEnvio = async (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = (e.currentTarget.closest('form') as HTMLFormElement);
    const data = new FormData(form);
    const calle = (data.get('calle') as string || '').trim();
    const numero = (data.get('numero') as string || '').trim();
    const codigoPostal = (data.get('codigo_postal') as string || '').trim();
    const localidad = (data.get('localidad') as string || '').trim();
    if (!calle || !numero || !codigoPostal || !localidad) { setEnvioError('Rellena calle, número, código postal y localidad para calcular el envío.'); return; }
    setCalculando(true); setEnvioError(''); setEnvio(null); setDistanciaKm(null); setEnvioDisponible(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ calle, numero, codigo_postal: codigoPostal, localidad, subtotal }),
      });
      const result = await res.json();
      if (!res.ok) { setEnvioError(result.error || 'No se pudo calcular el envío.'); setCalculando(false); return; }
      setEnvio(result.envio); setDistanciaKm(result.distancia_km); setEnvioDisponible(result.disponible); if (!result.disponible) { setEnvio(null); setEnvioError(result.zona === 'fuera_provincia' ? 'Lo sentimos, actualmente solo realizamos entregas en la provincia de Sevilla. Contáctanos por WhatsApp para alternativas.' : 'Lo sentimos, no realizamos envíos a domicilio a destinos a más de 18 km. Contáctanos por WhatsApp para alternativas.'); } else { setEnvioError(''); } setCalculando(false);
    } catch { setEnvioError('No se pudo conectar con el servicio de cálculo. Inténtalo de nuevo.'); setCalculando(false); }
  };
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError(''); setDiscount(null); setAppliedCode('');
    try {
      const { data, error: queryError } = await supabase
        .from('coupons')
        .select('codigo, tipo, valor, fecha_inicio, fecha_fin, usos_maximos, usos')
        .eq('codigo', couponCode.trim().toUpperCase())
        .maybeSingle();
      if (queryError || !data) { setCouponError('Código no válido o no encontrado.'); setCouponLoading(false); return; }
      const now = new Date();
      if (data.fecha_inicio && new Date(data.fecha_inicio) > now) { setCouponError('Este cupón aún no está disponible.'); setCouponLoading(false); return; }
      if (data.fecha_fin && new Date(data.fecha_fin) < now) { setCouponError('Este cupón ha expirado.'); setCouponLoading(false); return; }
      if (data.usos_maximos !== null && data.usos >= data.usos_maximos) { setCouponError('Este cupón ha alcanzado su límite de usos.'); setCouponLoading(false); return; }
      const calc = data.tipo === 'porcentaje' ? (subtotal * Number(data.valor)) / 100 : Math.min(Number(data.valor), subtotal);
      setDiscount(calc); setAppliedCode(data.codigo); setCouponLoading(false);
    } catch { setCouponError('No se pudo validar el cupón.'); setCouponLoading(false); }
  };
  const removeCoupon = () => { setDiscount(null); setAppliedCode(''); setCouponCode(''); setCouponError(''); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length) { navigate('/tienda'); return; }
    if (envio === null) { setError('Calcula el envío antes de continuar.'); return; }
    if (!envioDisponible) { setError('No podemos entregar en esta dirección. Contáctanos por WhatsApp.'); return; }
    setSaving(true); setError('');
    const data = new FormData(event.currentTarget);
    const payload = {
      items: items.map(({ product, cantidad }) => ({ id: product.id, cantidad })),
      cliente: { nombre: data.get('nombre'), apellidos: data.get('apellidos'), telefono: data.get('telefono'), email: data.get('email'), calle: data.get('calle'), numero: data.get('numero'), piso: data.get('piso') || '', codigo_postal: data.get('codigo_postal'), localidad: data.get('localidad') },
      coupon: appliedCode || undefined,
      origin: window.location.origin,
    };
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || !result.url) { setError(result.error || 'No se pudo iniciar el pago. Inténtalo de nuevo.'); setSaving(false); return; }
      clearCart();
      window.location.href = result.url;
    } catch { setError('No se pudo conectar con el servicio de pago. Inténtalo de nuevo.'); setSaving(false); }
  };
  if (!items.length) return <div className="page-heading"><div className="mx-auto max-w-7xl px-5 lg:px-8"><EmptyState title="No hay nada que comprar todavía" text="Añade tus favoritos al carrito y vuelve aquí para completar el pedido." onReset={() => navigate('/tienda')} /></div></div>;
  return <div className="animate-fadeIn"><div className="page-heading"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionIntro eyebrow="Último paso" title="Finalizar compra" text="Entregamos tu pedido con cariño en Sevilla y alrededores. El pago se procesa de forma segura con Stripe." /><div className="mt-8"><CheckoutSteps current={2} /></div><div className="mt-10"><TrustBar variant="light" /></div></div></div><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_360px] lg:px-8"><form onSubmit={submit} className="space-y-8"><FormSection title="Datos personales"><div className="form-grid"><Field label="Nombre" name="nombre" required /><Field label="Apellidos" name="apellidos" required /><Field label="Teléfono" name="telefono" type="tel" required /><Field label="Email" name="email" type="email" required /></div></FormSection><FormSection title="Dirección de entrega"><div className="form-grid"><Field label="Calle" name="calle" required /><Field label="Número" name="numero" required /><Field label="Piso / puerta" name="piso" /><Field label="Código postal" name="codigo_postal" required /><Field label="Localidad" name="localidad" required placeholder="Ej. Tomares, Mairena…" /><div><label className="field-label">Provincia</label><input value="Sevilla" readOnly className="field-input bg-cream-100" /></div></div>{envio === null ? <div className="mt-5 rounded-xl border-2 border-dashed border-accent-500 bg-accent-500/5 p-5"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-500 text-cream-50"><Truck size={18} /></span><div className="flex-1"><p className="text-sm font-bold text-primary-800">Calcula el envío antes de pagar</p><p className="mt-1 text-xs leading-5 text-secondary-600">Rellena tu dirección arriba y pulsa el botón para ver el coste de entrega. No podrás continuar al pago sin haberlo calculado.</p></div></div><button type="button" onClick={calcularEnvio} disabled={calculando} className="button-dark mt-4 w-full">{calculando ? 'Calculando…' : 'Calcular coste de envío'} <MapPin size={16} /></button>{envioError && <p className="mt-3 rounded-xl bg-error-50 p-3 text-sm text-error-700">{envioError}</p>}</div> : <div className="mt-5 rounded-xl border border-cream-300 bg-cream-50 p-4 text-sm text-secondary-700"><div className="flex items-center justify-between"><p className="font-bold text-primary-800">{distanciaKm === 0 ? 'Sevilla Capital' : `Distancia: ${distanciaKm} km`}</p><p>Envío: {envio === 0 ? <span className="font-bold text-success-600">Gratis</span> : formatPrice(envio)}</p></div><button type="button" onClick={calcularEnvio} disabled={calculando} className="button-text mt-2 text-xs">Recalcular envío</button></div>}</FormSection><div className="rounded-xl border border-cream-300 bg-cream-100 p-4 text-sm text-secondary-700"><ShieldCheck size={18} className="mb-1 text-accent-600" /> Pago seguro con Stripe. Se te redirigirá a la pasarela de pago para completar la compra.</div>
    <div className="rounded-xl border border-cream-300 bg-cream-50 p-5"><h3 className="flex items-center gap-2 text-sm font-bold text-primary-800"><Tag size={16} className="text-accent-600" /> Código de descuento</h3>{appliedCode ? <div className="mt-3 flex items-center justify-between rounded-xl bg-success-50 px-4 py-3"><span className="flex items-center gap-2 text-sm font-bold text-success-700"><Check size={16} /> {appliedCode} aplicado</span><button type="button" onClick={removeCoupon} className="text-xs font-bold text-secondary-500 hover:text-error-600">Quitar</button></div> : <div className="mt-3 flex gap-2"><input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Introduce tu código" className="flex-1 rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm uppercase outline-none focus:border-accent-500" /><button type="button" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()} className="button-small shrink-0">{couponLoading ? 'Validando…' : 'Aplicar'}</button></div>}{couponError && <p className="mt-2 text-xs font-semibold text-error-600">{couponError}</p>}</div>{error && <p className="rounded-xl bg-error-50 p-4 text-sm text-error-700">{error}</p>}{envio === null && <p className="rounded-xl border border-accent-500/40 bg-accent-500/5 p-3 text-xs font-semibold text-accent-700">Primero calcula el envío para poder continuar al pago.</p>}<button disabled={saving || envio === null || !envioDisponible} className="button-dark w-full sm:w-auto">{saving ? 'Redirigiendo al pago…' : 'Pagar ahora'} <ArrowRight size={17} /></button></form><OrderSummary subtotal={subtotal} envio={envio} total={total} discount={totalDiscount} appliedCode={appliedCode} /></div></div>;
}

function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  if (remaining <= 0) {
    return <div className="mt-5 rounded-xl bg-success-50 px-4 py-3 text-sm font-bold text-success-700"><Truck size={16} className="mr-1.5 inline" /> ¡Tienes envío gratis!</div>;
  }
  return <div className="mt-5"><div className="flex items-center justify-between text-xs font-bold text-secondary-600"><span className="flex items-center gap-1.5"><Truck size={14} className="text-accent-600" /> Envío gratis desde {FREE_SHIPPING_THRESHOLD} €</span><span className="text-primary-700">Te faltan {formatPrice(remaining)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-cream-300"><div className="h-full rounded-full bg-accent-500 transition-all duration-500" style={{ width: `${pct}%` }} /></div></div>;
}

function PaymentSuccess() {
  const [order, setOrder] = useState<{ id: string; total: number; subtotal: number; envio: number; nombre: string; email: string; calle: string; numero: string; codigo_postal: string; localidad: string; ticket_pdf_path: string | null } | null>(null);
  const [items, setItems] = useState<{ product_name: string; cantidad: number; precio_unitario: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get('session_id');
  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    supabase
      .from('orders')
      .select('id, total, subtotal, envio, nombre, email, calle, numero, codigo_postal, localidad, ticket_pdf_path')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOrder(data as typeof order);
          supabase
            .from('order_items')
            .select('product_name, cantidad, precio_unitario')
            .eq('order_id', (data as { id: string }).id)
            .then(({ data: itemData }) => { if (itemData) setItems(itemData as typeof items); });
        }
        setLoading(false);
      });
  }, [sessionId]);
  const downloadTicket = async () => {
    if (!order?.ticket_pdf_path) return;
    setDownloading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-ticket?path=${encodeURIComponent(order.ticket_pdf_path)}&type=order`, { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` } });
      if (!res.ok) throw new Error('No se pudo descargar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `ticket-${order.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* best-effort */ }
    setDownloading(false);
  };
  if (loading) return <div className="flex min-h-[560px] items-center justify-center px-5 py-20"><div className="text-center text-secondary-500">Cargando detalles de tu pedido…</div></div>;
  if (!order) return <Confirmation icon={<PackageCheck size={42} />} title="¡Pago completado!" text="Gracias por tu compra. Hemos recibido tu pago correctamente y prepararemos tu pedido para entrega en Sevilla." action="Volver a la tienda" href="/tienda" />;
  return <div className="animate-fadeIn"><div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
    <div className="text-center"><span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success-50 text-success-600"><PackageCheck size={42} /></span><h1 className="mt-8 font-serif text-4xl text-primary-800">¡Pago completado!</h1><p className="mt-4 leading-7 text-secondary-700">Gracias por tu compra, <strong className="text-primary-800">{order.nombre}</strong>. Hemos enviado los detalles a <strong className="text-primary-800">{order.email}</strong>.</p></div>
    <div className="mt-10 rounded-2xl border border-cream-300 bg-cream-50 p-6 md:p-8">
      <div className="flex items-center justify-between border-b border-cream-300 pb-4"><span className="text-xs font-bold uppercase tracking-wider text-secondary-500">Nº de pedido</span><span className="font-mono text-sm font-bold text-primary-800">#{order.id.slice(0, 8).toUpperCase()}</span></div>
      {items.length > 0 && <div className="mt-5 space-y-3">{items.map((item, i) => <div key={i} className="flex items-center justify-between text-sm"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-100 text-xs font-bold text-primary-700">{item.cantidad}×</span><span className="text-primary-800">{item.product_name}</span></div><span className="font-bold text-primary-800">{formatPrice(item.precio_unitario * item.cantidad)}</span></div>)}</div>}
      <div className="mt-5 space-y-2 border-t border-cream-300 pt-4 text-sm"><div className="flex justify-between text-secondary-700"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div><div className="flex justify-between text-secondary-700"><span>Envío</span><span>{order.envio === 0 ? <span className="font-bold text-success-600">Gratis</span> : formatPrice(order.envio)}</span></div><div className="flex justify-between border-t border-cream-300 pt-3 text-lg font-bold text-primary-800"><span>Total</span><span>{formatPrice(order.total)}</span></div></div>
    </div>
    <div className="mt-6 rounded-2xl border border-cream-300 bg-cream-100 p-5">
      <h2 className="mb-3 flex items-center gap-2 font-serif text-lg text-primary-800"><MapPin size={18} className="text-accent-600" /> Dirección de entrega</h2>
      <p className="text-sm leading-6 text-secondary-700">{order.calle}, {order.numero}<br />{order.codigo_postal} {order.localidad}, Sevilla</p>
    </div>
    {order.ticket_pdf_path && <div className="mt-6 flex justify-center"><button onClick={downloadTicket} disabled={downloading} className="button-dark flex items-center gap-2"><Download size={18} /> {downloading ? 'Descargando…' : 'Descargar ticket'}</button></div>}
    <div className="mt-8 flex justify-center gap-3"><Link to="/tienda" onClick={scrollTop} className="button-dark">Seguir comprando <ArrowRight size={17} /></Link><Link to="/" onClick={scrollTop} className="button-text">Volver al inicio</Link></div>
  </div></div>;
}

function PaymentCancelled() {
  const navigate = useNavigate();
  return <div className="flex min-h-[560px] items-center justify-center px-5 py-20"><div className="max-w-lg text-center"><span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-error-50 text-error-600"><X size={42} /></span><h1 className="mt-8 font-serif text-4xl text-primary-800">Pago cancelado</h1><p className="mt-4 leading-7 text-secondary-700">El pago no se ha completado. Puedes volver a tu carrito e intentarlo de nuevo cuando quieras.</p><div className="mt-8 flex justify-center gap-3"><button onClick={() => { navigate('/carrito'); scrollTop(); }} className="button-dark">Volver al carrito</button><Link to="/tienda" onClick={scrollTop} className="button-text">Seguir comprando</Link></div></div></div>;
}
function FormSection({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="mb-4 font-serif text-2xl text-primary-800">{title}</h2>{children}</section>; }
function Field({ label, name, type = 'text', required = false, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) { return <div><label htmlFor={name} className="field-label">{label}{required && ' *'}</label><input id={name} name={name} type={type} required={required} placeholder={placeholder} className="field-input" /></div>; }
function OrderSummary({ subtotal, envio, total, discount = 0, appliedCode = '' }: { subtotal: number; envio: number | null; total: number; discount?: number; appliedCode?: string }) { return <aside className="h-fit rounded-2xl bg-cream-100 p-6 lg:sticky lg:top-28"><h2 className="font-serif text-2xl text-primary-800">Tu pedido</h2><div className="mt-6 grid gap-4 border-b border-cream-300 pb-5 text-sm"><div className="flex justify-between text-secondary-700"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>{discount > 0 && <div className="flex justify-between text-success-700"><span>Descuento{appliedCode && ` (${appliedCode})`}</span><span>−{formatPrice(discount)}</span></div>}<div className="flex justify-between text-secondary-700"><span>Envío</span><span>{envio === null ? <span className="text-secondary-500">Pendiente de cálculo</span> : envio === 0 ? <span className="font-bold text-success-600">Gratis</span> : formatPrice(envio)}</span></div></div><div className="flex justify-between pt-5 text-lg font-bold text-primary-800"><span>Total</span><span>{formatPrice(total)}</span></div></aside>; }
function Confirmation({ icon, title, text, action, href }: { icon: React.ReactNode; title: string; text: string; action: string; href: string }) { return <div className="flex min-h-[560px] items-center justify-center px-5 py-20"><div className="max-w-lg text-center"><span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-cream-100 text-primary-700">{icon}</span><h1 className="mt-8 font-serif text-4xl text-primary-800">{title}</h1><p className="mt-4 leading-7 text-secondary-700">{text}</p><Link to={href} onClick={scrollTop} className="button-dark mt-8">{action} <ArrowRight size={17} /></Link></div></div>; }

function Services() {
  const navigate = useNavigate(); const services = [{ title: 'Paseo individual', text: 'Un paseo tranquilo y adaptado a su ritmo, con atención plena y mucho olfato.', price: '6 € / media hora', image: walkImage, icon: <Dog size={20} /> }, { title: 'Visitas a domicilio', text: 'Una visita para jugar, dar de comer, medicar o simplemente hacerles compañía.', price: '6 € / media hora', image: catAbout, icon: <Heart size={20} /> }];
  return <div className="animate-fadeIn"><div className="page-heading"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionIntro eyebrow="A su lado" title="Paseos y cuidados" text="Porque ellos también necesitan su momento. Un servicio cercano, pensado para que estén bien cuando tú no puedes estar." /></div></div><section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="grid gap-6 lg:grid-cols-2">{services.map((s) => <article key={s.title} className="group overflow-hidden rounded-2xl border border-cream-300 bg-cream-50"><div className="relative h-64 overflow-hidden"><img src={s.image} alt={s.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream-50 text-primary-700">{s.icon}</div></div><div className="p-6"><h2 className="font-serif text-2xl text-primary-800">{s.title}</h2><p className="mt-3 text-sm leading-6 text-secondary-700">{s.text}</p><div className="mt-6 flex items-center justify-between border-t border-cream-200 pt-5"><span className="font-bold text-primary-800">{s.price}</span><button onClick={() => { navigate('/reservar'); scrollTop(); }} className="button-small">Reservar <ArrowRight size={15} /></button></div></div></article>)}</div></section><section className="bg-cream-100 py-20"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-2 lg:px-8"><div><SectionIntro eyebrow="Cómo trabajamos" title="Tranquilidad para ti. Bienestar para ellos." text="Antes de cada servicio nos gusta conocerles: sus horarios, sus manías y aquello que les hace sentirse seguros. Así cada paseo y cada visita se adapta de verdad a su forma de ser." /><div className="mt-8 grid gap-4"><InfoMini icon={<MessageCircle size={19} />} title="Hablamos contigo" text="Nos cuentas lo que necesitan." /><InfoMini icon={<PawPrint size={19} />} title="Les conocemos" text="Creamos un vínculo de confianza." /><InfoMini icon={<Check size={19} />} title="Te mantenemos al día" text="Sabrás cómo están en todo momento." /></div></div><img src={walkImage} alt="Paseo de perro por Sevilla" className="h-[430px] w-full rounded-2xl object-cover" /></div></section><section className="section-space"><div className="mx-auto max-w-3xl px-5 text-center lg:px-8"><p className="eyebrow">¿Empezamos?</p><h2 className="mt-3 font-serif text-4xl text-primary-800">Reserva su próximo paseo.</h2><p className="mt-4 text-secondary-700">Elige el día y la hora que mejor os venga. Te contactaremos para confirmar todos los detalles.</p><Link to="/reservar" onClick={scrollTop} className="button-dark mt-7">Reservar un paseo <CalendarDays size={17} /></Link></div></section></div>;
}

function Booking() {
  const [date, setDate] = useState(''); const [time, setTime] = useState(''); const [duracion, setDuracion] = useState<'30' | '60'>('30'); const [done, setDone] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [hasSecondDog, setHasSecondDog] = useState(false); const [autorizaFotos, setAutorizaFotos] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [ticketPath, setTicketPath] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const slots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
  const minDate = new Date().toISOString().split('T')[0];
  const downloadBookingTicket = async () => {
    if (!ticketPath) return;
    setDownloading(true); setDownloadError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-ticket?path=${encodeURIComponent(ticketPath)}&type=booking`, { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` } });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || `Error ${res.status}`); }
      const blob = await res.blob();
      if (blob.size === 0) throw new Error('El archivo está vacío.');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `reserva-${bookingId?.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { setDownloadError(e instanceof Error ? e.message : 'No se pudo descargar el ticket.'); }
    setDownloading(false);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!date || !time) { setError('Elige una fecha y una hora para continuar.'); return; } setSaving(true); setError(''); const data = new FormData(event.currentTarget); const payload = { nombre_dueno: data.get('nombre'), telefono: data.get('telefono'), email: data.get('email') || '', nombre_perro: data.get('nombre_perro'), raza: data.get('raza'), edad: data.get('edad'), nombre_perro_2: data.get('nombre_perro_2') || '', raza_2: data.get('raza_2') || '', edad_2: data.get('edad_2') || '', fecha: date, hora: time, duracion: duracion === '60' ? '60 min' : '30 min', observaciones: data.get('observaciones') || '', autoriza_fotos: autorizaFotos }; try { const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-booking`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }, body: JSON.stringify(payload) }); if (!res.ok) { setError('No hemos podido guardar la reserva. Escríbenos por WhatsApp y te ayudamos.'); setSaving(false); return; } const result = await res.json(); if (result.booking_id) setBookingId(result.booking_id); if (result.ticket_pdf_path) setTicketPath(result.ticket_pdf_path); } catch { setError('No hemos podido guardar la reserva. Escríbenos por WhatsApp y te ayudamos.'); setSaving(false); return; } setSaving(false); setDone(true); };
  if (done) return <div className="flex min-h-[560px] items-center justify-center px-5 py-20"><div className="max-w-lg text-center"><span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-cream-100 text-primary-700"><CalendarDays size={42} /></span><h1 className="mt-8 font-serif text-4xl text-primary-800">¡Reserva registrada!</h1><p className="mt-4 leading-7 text-secondary-700">Nos pondremos en contacto contigo para confirmar los detalles. Gracias por confiar en CabezaPerro.</p>{bookingId && <div className="mt-6 rounded-xl border border-cream-300 bg-cream-50 p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-secondary-500">Nº de reserva</span><span className="font-mono text-sm font-bold text-primary-800">#{bookingId.slice(0, 8).toUpperCase()}</span></div><div className="mt-3 flex items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-700"><Clock3 size={13} /> Pendiente de pago</span></div></div>}{ticketPath && <div className="mt-6 flex flex-col items-center gap-3"><button onClick={downloadBookingTicket} disabled={downloading} className="button-dark flex items-center gap-2"><Download size={18} /> {downloading ? 'Descargando…' : 'Descargar ticket de reserva'}</button>{downloadError && <p className="text-sm text-error-600">{downloadError}</p>}</div>}<div className="mt-8 flex justify-center gap-3"><Link to="/" onClick={scrollTop} className="button-dark">Volver al inicio <ArrowRight size={17} /></Link><Link to="/paseos-y-cuidados" onClick={scrollTop} className="button-text">Ver servicios</Link></div></div></div>;
  return <div className="animate-fadeIn"><div className="page-heading"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionIntro eyebrow="Paseos y cuidados" title="Reserva un paseo" text="Elige el momento que mejor os venga y cuéntanos un poquito sobre tu compañero." /></div></div><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><form onSubmit={submit} className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]"><div className="rounded-2xl bg-cream-100 p-6 md:p-8"><h2 className="font-serif text-2xl text-primary-800">Elige tu momento</h2><label className="field-label mt-6">Fecha</label><div className="relative"><CalendarDays size={17} className="pointer-events-none absolute left-3 top-3.5 text-accent-600" /><input type="date" min={minDate} value={date} onChange={(e) => { setDate(e.target.value); setTime(''); }} required className="field-input pl-10" /></div><h3 className="mt-8 text-sm font-bold text-primary-800">Duración del paseo</h3><div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => setDuracion('30')} className={`rounded-xl border p-4 text-left transition ${duracion === '30' ? 'border-primary-700 bg-primary-700 text-cream-50' : 'border-cream-300 bg-cream-50 text-primary-700 hover:border-accent-500'}`}><span className="block text-sm font-bold">Media hora</span><span className={`mt-1 block text-xs ${duracion === '30' ? 'text-cream-200' : 'text-secondary-500'}`}>6 €</span></button><button type="button" onClick={() => setDuracion('60')} className={`rounded-xl border p-4 text-left transition ${duracion === '60' ? 'border-primary-700 bg-primary-700 text-cream-50' : 'border-cream-300 bg-cream-50 text-primary-700 hover:border-accent-500'}`}><span className="block text-sm font-bold">Una hora</span><span className={`mt-1 block text-xs ${duracion === '60' ? 'text-cream-200' : 'text-secondary-500'}`}>11 €</span></button></div><h3 className="mt-8 text-sm font-bold text-primary-800">Horas disponibles {date && <span className="font-normal text-secondary-500">· {new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>}</h3><div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">{slots.map((slot) => <button type="button" key={slot} disabled={!date} onClick={() => setTime(slot)} className={`rounded-xl border px-2 py-3 text-sm font-bold transition ${time === slot ? 'border-primary-700 bg-primary-700 text-cream-50' : 'border-cream-300 bg-cream-50 text-primary-700 hover:border-accent-500 disabled:cursor-not-allowed disabled:opacity-40'}`}>{slot}</button>)}</div><div className="mt-8 rounded-xl border border-cream-300 bg-cream-50 p-4 text-xs leading-5 text-secondary-600"><Clock3 size={15} className="mb-1 text-accent-600" /> Las reservas se confirman personalmente por teléfono. Te responderemos lo antes posible.</div></div><div className="rounded-2xl border border-cream-300 p-6 md:p-8"><h2 className="font-serif text-2xl text-primary-800">Cuéntanos sobre él</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Nombre del perro" name="nombre_perro" required /><Field label="Raza" name="raza" required /><Field label="Edad" name="edad" placeholder="Ej. 3 años" required /><Field label="Tu nombre" name="nombre" required /><Field label="Teléfono" name="telefono" type="tel" required /><Field label="Email" name="email" type="email" required /><div className="sm:col-span-2"><label className="field-label">Observaciones</label><textarea name="observaciones" rows={4} className="field-input resize-none" placeholder="Carácter, necesidades, indicaciones…" /><p className="mt-2 text-xs leading-5 text-secondary-500">Introduce únicamente información relevante para la prestación del servicio (carácter, necesidades, indicaciones de cuidado). Evita incluir datos personales innecesarios.</p></div></div><div className="mt-6 flex items-center gap-3 border-t border-cream-200 pt-5"><label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-primary-800"><input type="checkbox" checked={hasSecondDog} onChange={(e) => setHasSecondDog(e.target.checked)} className="h-4 w-4 rounded accent-primary-700" /> ¿Vais con un segundo perro? <span className="font-normal text-secondary-500">(+5 €)</span></label></div>{hasSecondDog && <div className="mt-4 grid gap-4 rounded-xl bg-cream-100 p-5 sm:grid-cols-3"><Field label="Nombre del 2º perro" name="nombre_perro_2" /><Field label="Raza" name="raza_2" /><Field label="Edad" name="edad_2" placeholder="Ej. 5 años" /></div>}<div className="mt-5 flex items-start gap-3 border-t border-cream-200 pt-5"><label className="flex cursor-pointer items-start gap-3 text-sm text-secondary-700"><input type="checkbox" checked={autorizaFotos} onChange={(e) => setAutorizaFotos(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary-700" /> <span>Autorizo a CabezaPerro a publicar fotografías de mi perro en sus redes sociales y canales de comunicación. <span className="block text-xs text-secondary-500 mt-1">Opcional. Puedes dejar esta casilla sin marcar.</span></span></label></div>{error && <p className="mt-5 rounded-xl bg-error-50 p-4 text-sm text-error-700">{error}</p>}<button disabled={saving} className="button-dark mt-6 w-full">{saving ? 'Guardando reserva…' : 'Confirmar reserva'} <ArrowRight size={17} /></button></div></form></div></div>;
}

function About() { return <div className="animate-fadeIn"><div className="page-heading"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionIntro eyebrow="Nuestra historia" title="Cuidarles es nuestra manera de estar cerca." text="CabezaPerro nace de una idea sencilla: hacer más fácil cuidar bien de nuestros compañeros de cuatro patas." /></div></div><section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-2 lg:px-8"><div className="overflow-hidden rounded-2xl"><img src={catAbout} alt="Persona y perro compartiendo un momento en casa" className="h-[500px] w-full object-cover" /></div><div><p className="text-lg leading-8 text-primary-800">En CabezaPerro creemos que ellos son uno más de la familia. Por eso hemos creado un espacio donde encontrar alimentación de calidad y servicios pensados para cuidar de nuestros compañeros de cuatro patas.</p><p className="mt-6 leading-7 text-secondary-700">Somos un negocio local de Sevilla, cercano y especializado. Seleccionamos cada producto con calma, escuchamos lo que necesitas y estamos a un WhatsApp de distancia cuando tengas una duda.</p><div className="mt-9 grid gap-5 border-t border-cream-300 pt-7 sm:grid-cols-3"><Value icon={<Heart size={19} />} title="Cercanía" /><Value icon={<Utensils size={19} />} title="Calidad" /><Value icon={<ShieldCheck size={19} />} title="Confianza" /></div></div></section><section className="bg-cream-100 py-20"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionIntro eyebrow="Nuestros valores" title="Una forma de hacer las cosas." /><div className="mt-10 grid gap-5 md:grid-cols-3"><ValueCard number="01" title="Cercanía" text="Tratamos a cada cliente y a cada animal como se merece, con tiempo y atención de verdad." icon={<Heart size={22} />} /><ValueCard number="02" title="Calidad" text="Seleccionamos productos pensando en su bienestar, no solo en llenar una estantería." icon={<Sparkles size={22} />} /><ValueCard number="03" title="Confianza" text="Queremos ser tu tienda de confianza en Sevilla, hoy y dentro de muchos años." icon={<ShieldCheck size={22} />} /></div></div></section></div>; }
function ValueCard({ number, title, text, icon }: { number: string; title: string; text: string; icon: React.ReactNode }) { return <div className="rounded-2xl border border-cream-300 bg-cream-50 p-7"><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-widest text-accent-600">{number}</span><span className="text-accent-600">{icon}</span></div><h3 className="mt-12 font-serif text-2xl text-primary-800">{title}</h3><p className="mt-3 text-sm leading-6 text-secondary-700">{text}</p></div>; }

function Contact() { const [sent, setSent] = useState(false); const [error, setError] = useState(''); const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); const data = new FormData(event.currentTarget); const payload = { nombre: data.get('nombre'), email: data.get('email'), telefono: data.get('telefono') || '', motivo: data.get('motivo'), mensaje: data.get('mensaje') }; const { error: saveError } = await supabase.from('contact_messages').insert(payload); if (saveError) { setError('No hemos podido enviar el mensaje. Escríbenos directamente por WhatsApp.'); return; } try { await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-contact`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }, body: JSON.stringify(payload) }); } catch { /* la notificación es best-effort */ } setSent(true); event.currentTarget.reset(); }; return <div className="animate-fadeIn"><div className="page-heading"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionIntro eyebrow="Hablemos" title="Estamos cerca cuando nos necesites." text="¿Tienes una duda sobre un producto, un paseo o una entrega? Escríbenos, estaremos encantados de ayudarte." /></div></div><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[0.75fr_1.25fr] lg:px-8"><div className="grid gap-3 content-start"><ContactCard icon={<MessageCircle size={21} />} title="WhatsApp" value="+34 644 789 324" href="https://wa.me/34644789324" label="Escribir por WhatsApp" external /><ContactCard icon={<Mail size={21} />} title="Email" value="cabezaperro015@gmail.com" href="mailto:cabezaperro015@gmail.com" label="Enviar email" /><ContactCard icon={<Instagram size={21} />} title="Instagram" value="@cabeza.perro" href="https://instagram.com/cabeza.perro" label="Ver Instagram" external /><ContactCard icon={<span className="font-bold">♪</span>} title="TikTok" value="@cabeza_perro" href="https://www.tiktok.com/@cabeza_perro" label="Ver TikTok" external /><div className="mt-4 rounded-2xl bg-primary-700 p-6 text-cream-50"><MapPin className="text-accent-300" size={21} /><h3 className="mt-4 font-serif text-2xl">Sevilla</h3><p className="mt-2 text-sm leading-6 text-cream-200">Alimentación y cuidados para tus compañeros de cuatro patas, muy cerca de ti.</p></div></div><div className="rounded-2xl border border-cream-300 p-6 md:p-8"><p className="eyebrow">Escríbenos</p><h2 className="mt-3 font-serif text-3xl text-primary-800">¿Tienes alguna pregunta?</h2>{sent ? <div className="mt-10 rounded-2xl bg-success-50 p-7 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-700"><Check size={24} /></span><h3 className="mt-4 font-serif text-2xl text-primary-800">Mensaje enviado</h3><p className="mt-2 text-sm text-secondary-700">Gracias por escribirnos. Te responderemos muy pronto.</p><button onClick={() => setSent(false)} className="button-text mt-5">Enviar otro mensaje</button></div> : <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2"><Field label="Nombre" name="nombre" required /><Field label="Email" name="email" type="email" required /><Field label="Teléfono" name="telefono" type="tel" /><div><label className="field-label">Motivo de contacto *</label><select name="motivo" required className="field-input"><option value="">Selecciona una opción</option><option>Consulta sobre productos</option><option>Pedido y entrega</option><option>Paseos y cuidados</option><option>Otro</option></select></div><div className="sm:col-span-2"><label className="field-label">Mensaje *</label><textarea name="mensaje" required rows={5} className="field-input resize-none" /></div>{error && <p className="sm:col-span-2 rounded-xl bg-error-50 p-4 text-sm text-error-700">{error}</p>}<button className="button-dark sm:col-span-2 sm:w-fit">Enviar mensaje <Send size={16} /></button></form>}</div></div><section id="faq" className="border-t border-cream-300 bg-cream-100 py-16"><div className="mx-auto max-w-3xl px-5 lg:px-8"><SectionIntro eyebrow="Información" title="Lo que necesitas saber" /><div className="mt-8 grid gap-3"><Faq title="¿Dónde entregáis?" text="Realizamos entregas a domicilio en Sevilla. Si tienes dudas sobre tu zona, escríbenos por WhatsApp." /><Faq title="¿Cuánto cuesta el envío?" text="Si estás en Sevilla Capital: envío gratis en pedidos superiores a 25 €, y 2 € para pedidos de 25 € o menos. Si estás en Sevilla Provincia (fuera de la capital), el envío se calcula por distancia: hasta 6 km gratis (pedido > 25 €) o 2 € (pedido ≤ 25 €); de 6 a 9 km: 2,90 € (pedido > 25 €) o 4,90 € (pedido ≤ 25 €); de 9 a 18 km: 4,90 € (pedido > 25 €) o 6,90 € (pedido ≤ 25 €). Más de 18 km no realizamos envío a domicilio." /><Faq title="¿Cómo puedo reservar un paseo?" text="Puedes hacerlo desde la página de reservas, eligiendo fecha y hora. Después te contactaremos para confirmar." /></div></div></section></div>; }
function ContactCard({ icon, title, value, href, label, external }: { icon: React.ReactNode; title: string; value: string; href: string; label: string; external?: boolean }) { return <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5"><div className="flex items-start gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-100 text-accent-600">{icon}</span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-secondary-500">{title}</p><p className="mt-1 break-all text-sm font-semibold text-primary-800">{value}</p><a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="button-text mt-3 text-xs">{label} <ArrowRight size={13} /></a></div></div></div>; }
function Faq({ title, text }: { title: string; text: string }) { return <details className="rounded-xl border border-cream-300 bg-cream-50 p-5"><summary className="cursor-pointer list-none pr-5 text-sm font-bold text-primary-800">{title}</summary><p className="mt-3 text-sm leading-6 text-secondary-700">{text}</p></details>; }

function AppRoutes() { return <Layout><Routes><Route path="/" element={<Home />} /><Route path="/tienda" element={<Shop />} /><Route path="/producto/:id" element={<ProductDetail />} /><Route path="/carrito" element={<Cart />} /><Route path="/checkout" element={<Checkout />} /><Route path="/pago-exitoso" element={<PaymentSuccess />} /><Route path="/pago-cancelado" element={<PaymentCancelled />} /><Route path="/paseos-y-cuidados" element={<Services />} /><Route path="/reservar" element={<Booking />} /><Route path="/quienes-somos" element={<About />} /><Route path="/contacto" element={<Contact />} /><Route path="/aviso-legal" element={<AvisoLegal />} /><Route path="/politica-privacidad" element={<PoliticaPrivacidad />} /><Route path="/politica-cookies" element={<PoliticaCookies />} /><Route path="/condiciones-compra" element={<CondicionesCompra />} /><Route path="/devoluciones-y-desistimiento" element={<DevolucionesDesistimiento />} /><Route path="/reservas-y-cancelaciones" element={<ReservasCancelaciones />} /><Route path="/envios-y-entregas" element={<EnviosEntregas />} /><Route path="/atencion-al-cliente-y-reclamaciones" element={<AtencionReclamaciones />} /><Route path="*" element={<Home />} /></Routes></Layout>; }

export default function App() { return <BrowserRouter><CartProvider><AppRoutes /></CartProvider></BrowserRouter>; }
