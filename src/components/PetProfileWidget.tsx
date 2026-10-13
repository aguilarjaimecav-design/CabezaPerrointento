import { useState } from 'react';
import { Cat, Dog, PawPrint, X, Check, Heart, Sparkles, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { usePetProfile, createPet, Pet } from '@/context/PetProfileContext';
import { Especie } from '@/types';

const SENSIBILIDADES_OPTIONS: { value: string; label: string }[] = [
  { value: 'digestion', label: 'Digestión sensible' },
  { value: 'renal', label: 'Problemas renales' },
  { value: 'urinario', label: 'Problemas urinarios' },
  { value: 'alergias', label: 'Alergias alimentarias' },
  { value: 'peso', label: 'Control de peso' },
];

type EditingState = {
  id: string | null;
  nombre: string;
  especie: Especie;
  edad: Pet['edad'];
  esterilizado: boolean;
  sensibilidades: string[];
  talla: Pet['talla'];
};

function emptyEditing(): EditingState {
  return { id: null, nombre: '', especie: 'perro', edad: 'adulto', esterilizado: false, sensibilidades: [], talla: 'mediana' };
}

function petToEditing(pet: Pet): EditingState {
  return { id: pet.id, nombre: pet.nombre, especie: pet.especie, edad: pet.edad, esterilizado: pet.esterilizado, sensibilidades: pet.sensibilidades, talla: pet.talla };
}

export function PetProfileWidget() {
  const { pets, activePetId, activePet, isProfileActive, addPet, updatePet, removePet, setActivePetId } = usePetProfile();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EditingState>(emptyEditing());
  const [isEditing, setIsEditing] = useState(false);

  const toggleSens = (val: string) => {
    setEditing((prev) => ({ ...prev, sensibilidades: prev.sensibilidades.includes(val) ? prev.sensibilidades.filter((s) => s !== val) : [...prev.sensibilidades, val] }));
  };

  const handleSavePet = () => {
    if (!editing.nombre.trim()) return;
    if (editing.id) {
      updatePet({ ...editing, id: editing.id, nombre: editing.nombre.trim() } as Pet);
    } else {
      addPet(createPet({ nombre: editing.nombre.trim(), especie: editing.especie, edad: editing.edad, esterilizado: editing.esterilizado, sensibilidades: editing.sensibilidades, talla: editing.talla }));
    }
    setIsEditing(false);
    setEditing(emptyEditing());
  };

  const startNewPet = () => {
    setEditing(emptyEditing());
    setIsEditing(true);
  };

  const startEditPet = (pet: Pet) => {
    setEditing(petToEditing(pet));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditing(emptyEditing());
  };

  // === No pets, panel closed ===
  if (pets.length === 0 && !open) {
    return (
      <button onClick={() => setOpen(true)} className="pet-profile-trigger" aria-label="Configurar mi mascota">
        <PawPrint size={18} className="pet-profile-trigger-icon" />
        <span>Mi mascota</span>
      </button>
    );
  }

  // === Has pets, panel closed ===
  if (pets.length > 0 && !open) {
    return (
      <div className="pet-profile-bar">
        <div className="pet-profile-bar-pets">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => setActivePetId(activePetId === pet.id ? null : pet.id)}
              className={`pet-profile-pet-pill ${activePetId === pet.id ? 'pet-profile-pet-pill-active' : ''}`}
            >
              {pet.especie === 'perro' ? <Dog size={14} /> : <Cat size={14} />}
              <span>{pet.nombre}</span>
            </button>
          ))}
          <button onClick={() => { setOpen(true); startNewPet(); }} className="pet-profile-add-pill" aria-label="Añadir mascota">
            <Plus size={14} />
          </button>
        </div>
        {isProfileActive && activePet && (
          <span className="pet-profile-bar-status">
            <Check size={12} /> Filtrando para {activePet.nombre}
          </span>
        )}
        {!isProfileActive && pets.length > 0 && (
          <span className="pet-profile-bar-status pet-profile-bar-status-inactive">
            <EyeOff size={12} /> Sin filtro
          </span>
        )}
        <button onClick={() => setOpen(true)} className="pet-profile-bar-edit" aria-label="Gestionar mascotas">
          <Sparkles size={14} />
        </button>
      </div>
    );
  }

  // === Panel open ===
  return (
    <div className="pet-profile-panel">
      <div className="pet-profile-panel-header">
        <div className="flex items-center gap-2">
          <PawPrint size={18} className="text-accent-600" />
          <h3 className="font-serif text-lg text-primary-800">Mis mascotas</h3>
        </div>
        <button onClick={() => { setOpen(false); cancelEdit(); }} className="pet-profile-panel-close" aria-label="Cerrar">
          <X size={18} />
        </button>
      </div>

      {!isEditing && (
        <>
          <p className="pet-profile-panel-desc">Añade los perfiles de tus compañeros y filtra la tienda según el que elijas. Puedes tener varios y cambiar entre ellos cuando quieras.</p>

          {pets.length > 0 && (
            <div className="pet-profile-list">
              {pets.map((pet) => (
                <div key={pet.id} className={`pet-profile-list-item ${activePetId === pet.id ? 'pet-profile-list-item-active' : ''}`}>
                  <button onClick={() => setActivePetId(activePetId === pet.id ? null : pet.id)} className="pet-profile-list-item-main">
                    <span className="pet-profile-list-item-icon">
                      {pet.especie === 'perro' ? <Dog size={18} /> : <Cat size={18} />}
                    </span>
                    <div className="pet-profile-list-item-info">
                      <span className="pet-profile-list-item-name">{pet.nombre}</span>
                      <span className="pet-profile-list-item-detail">
                        {pet.edad === 'cachorro' ? 'Cachorro' : pet.edad === 'senior' ? 'Senior' : 'Adulto'}
                        {pet.esterilizado && ' · Esterilizado'}
                        {pet.sensibilidades.length > 0 && ` · ${pet.sensibilidades.length} necesidad${pet.sensibilidades.length > 1 ? 'es' : ''}`}
                      </span>
                    </div>
                    {activePetId === pet.id && <span className="pet-profile-list-item-badge"><Eye size={14} /> Activo</span>}
                  </button>
                  <div className="pet-profile-list-item-actions">
                    <button onClick={() => startEditPet(pet)} className="pet-profile-list-item-edit" aria-label="Editar">
                      <Sparkles size={14} />
                    </button>
                    <button onClick={() => removePet(pet.id)} className="pet-profile-list-item-delete" aria-label="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={startNewPet} className="pet-profile-add-btn">
            <Plus size={16} /> Añadir nueva mascota
          </button>
        </>
      )}

      {isEditing && (
        <div className="pet-profile-edit-form">
          <div className="pet-profile-edit-header">
            <h4 className="font-serif text-base text-primary-800">{editing.id ? 'Editar mascota' : 'Nueva mascota'}</h4>
            <button onClick={cancelEdit} className="pet-profile-panel-close" aria-label="Cancelar">
              <X size={16} />
            </button>
          </div>

          <div className="pet-profile-field">
            <label className="pet-profile-label">Nombre</label>
            <input
              type="text"
              value={editing.nombre}
              onChange={(e) => setEditing((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej. Luna, Max, Michi…"
              className="pet-profile-input"
              autoFocus
            />
          </div>

          <div className="pet-profile-field">
            <label className="pet-profile-label">Especie</label>
            <div className="pet-profile-options">
              <button onClick={() => setEditing((prev) => ({ ...prev, especie: 'perro' }))} className={`pet-profile-chip ${editing.especie === 'perro' ? 'pet-profile-chip-active' : ''}`}>
                <Dog size={16} /> Perro
              </button>
              <button onClick={() => setEditing((prev) => ({ ...prev, especie: 'gato' }))} className={`pet-profile-chip ${editing.especie === 'gato' ? 'pet-profile-chip-active' : ''}`}>
                <Cat size={16} /> Gato
              </button>
            </div>
          </div>

          <div className="pet-profile-field">
            <label className="pet-profile-label">Edad</label>
            <div className="pet-profile-options">
              {(['cachorro', 'adulto', 'senior'] as const).map((e) => (
                <button key={e} onClick={() => setEditing((prev) => ({ ...prev, edad: e }))} className={`pet-profile-chip ${editing.edad === e ? 'pet-profile-chip-active' : ''}`}>
                  {e === 'cachorro' ? 'Cachorro' : e === 'adulto' ? 'Adulto' : 'Senior'}
                </button>
              ))}
            </div>
          </div>

          <div className="pet-profile-field">
            <label className="pet-profile-label">Tamaño {editing.especie === 'gato' ? '(no aplica)' : ''}</label>
            <div className="pet-profile-options">
              {(['mini', 'mediana', 'grande'] as const).map((t) => (
                <button key={t} onClick={() => setEditing((prev) => ({ ...prev, talla: t }))} disabled={editing.especie === 'gato'} className={`pet-profile-chip ${editing.talla === t ? 'pet-profile-chip-active' : ''} ${editing.especie === 'gato' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {t === 'mini' ? 'Mini' : t === 'mediana' ? 'Mediana' : 'Grande'}
                </button>
              ))}
            </div>
          </div>

          <div className="pet-profile-field">
            <label className="pet-profile-toggle-row">
              <span className="pet-profile-label">Esterilizado / castrado</span>
              <button onClick={() => setEditing((prev) => ({ ...prev, esterilizado: !prev.esterilizado }))} className={`pet-profile-toggle ${editing.esterilizado ? 'pet-profile-toggle-on' : ''}`} aria-pressed={editing.esterilizado}>
                <span className="pet-profile-toggle-knob" />
              </button>
            </label>
          </div>

          <div className="pet-profile-field">
            <label className="pet-profile-label">Necesidades especiales</label>
            <div className="pet-profile-sens-grid">
              {SENSIBILIDADES_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleSens(opt.value)}
                  className={`pet-profile-sens-chip ${editing.sensibilidades.includes(opt.value) ? 'pet-profile-sens-chip-active' : ''}`}
                >
                  {editing.sensibilidades.includes(opt.value) && <Check size={13} />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pet-profile-panel-actions">
            <button onClick={handleSavePet} disabled={!editing.nombre.trim()} className="button-dark w-full">
              <Heart size={16} /> {editing.id ? 'Guardar cambios' : 'Añadir mascota'}
            </button>
            <button onClick={cancelEdit} className="button-text mt-2 w-full justify-center text-xs text-secondary-500">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
