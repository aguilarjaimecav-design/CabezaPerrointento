import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Especie } from '@/types';

const STORAGE_KEY = 'cabezaperro_pets';
const ACTIVE_KEY = 'cabezaperro_active_pet';

export interface Pet {
  id: string;
  nombre: string;
  especie: Especie;
  edad: 'cachorro' | 'adulto' | 'senior';
  esterilizado: boolean;
  sensibilidades: string[];
  talla: 'mini' | 'mediana' | 'grande';
}

export interface PetProfileContextValue {
  pets: Pet[];
  activePetId: string | null;
  activePet: Pet | null;
  isProfileActive: boolean;
  addPet: (pet: Pet) => void;
  updatePet: (pet: Pet) => void;
  removePet: (id: string) => void;
  setActivePetId: (id: string | null) => void;
}

const PetProfileContext = createContext<PetProfileContextValue | undefined>(undefined);

function readStoredPets(): Pet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function genId(): string {
  return `pet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createPet(partial: Omit<Pet, 'id'>): Pet {
  return { ...partial, id: genId() };
}

export function PetProfileProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>(() => readStoredPets());
  const [activePetId, setActivePetIdState] = useState<string | null>(() => readStoredActiveId());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    if (activePetId) {
      localStorage.setItem(ACTIVE_KEY, activePetId);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activePetId]);

  // Ensure activePetId is valid
  useEffect(() => {
    if (activePetId && !pets.some((p) => p.id === activePetId)) {
      setActivePetIdState(null);
    }
  }, [pets, activePetId]);

  const addPet = (pet: Pet) => {
    setPets((prev) => [...prev, pet]);
    setActivePetIdState(pet.id);
  };

  const updatePet = (pet: Pet) => {
    setPets((prev) => prev.map((p) => (p.id === pet.id ? pet : p)));
  };

  const removePet = (id: string) => {
    setPets((prev) => prev.filter((p) => p.id !== id));
    if (activePetId === id) setActivePetIdState(null);
  };

  const setActivePetId = (id: string | null) => setActivePetIdState(id);

  const activePet = activePetId ? pets.find((p) => p.id === activePetId) ?? null : null;

  return (
    <PetProfileContext.Provider
      value={{ pets, activePetId, activePet, isProfileActive: activePet !== null, addPet, updatePet, removePet, setActivePetId }}
    >
      {children}
    </PetProfileContext.Provider>
  );
}

export function usePetProfile() {
  const ctx = useContext(PetProfileContext);
  if (!ctx) throw new Error('usePetProfile debe usarse dentro de PetProfileProvider');
  return ctx;
}

export function profileMatchesProduct(product: { especie: Especie; nombre: string; descripcionBreve?: string }, profile: Pet): boolean {
  if (product.especie !== profile.especie) return false;

  const name = product.nombre.toLowerCase();
  const desc = (product.descripcionBreve ?? '').toLowerCase();
  const text = `${name} ${desc}`;

  if (profile.edad === 'cachorro') {
    if (!text.includes('cachorro') && !text.includes('gatito') && !text.includes('puppy') && !text.includes('kitten')) return false;
  } else if (profile.edad === 'senior') {
    if (text.includes('cachorro') || text.includes('gatito') || text.includes('puppy') || text.includes('kitten')) return false;
  }

  if (profile.esterilizado && !(text.includes('esterilizado') || text.includes('castrado') || text.includes('light') || text.includes('ligero'))) {
    // esterilizado products get priority but we don't exclude everything else
  }

  if (profile.talla === 'mini' && text.includes('large')) return false;
  if (profile.talla === 'grande' && text.includes('mini')) return false;

  for (const sens of profile.sensibilidades) {
    if (sens === 'digestion' && (text.includes('digestive') || text.includes('prescription'))) return true;
    if (sens === 'renal' && (text.includes('renal') || text.includes('prescription'))) return true;
    if (sens === 'urinario' && (text.includes('urinary') || text.includes('prescription'))) return true;
    if (sens === 'alergias' && (text.includes('monoproteico') || text.includes('grain free') || text.includes('sin cereal'))) return true;
    if (sens === 'peso' && (text.includes('light') || text.includes('ligero') || text.includes('senior'))) return true;
  }

  return true;
}
