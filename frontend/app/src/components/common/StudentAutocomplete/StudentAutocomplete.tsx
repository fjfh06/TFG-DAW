import { useState, useRef, useEffect } from 'react';
import type { Alumno } from '../../../types';

interface Props {
  alumnos: Alumno[];
  value: string; // The selected alumno_id (numeric string)
  onChange: (id: string) => void;
  disabled?: boolean;
}

export const StudentAutocomplete = ({ alumnos, value, onChange, disabled }: Props) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [prevValue, setPrevValue] = useState(value);

  // Sync initial value or external value changes to display name during render
  if (value !== prevValue) {
      setPrevValue(value);
      if (value) {
        const selected = alumnos.find(a => a.id.toString() === value);
        if (selected) {
          setQuery(`${selected.nombre} ${selected.apellidos}`);
        }
      } else {
        setQuery('');
      }
  }

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAlumnos = alumnos.filter(a => {
    const searchStr = `${a.nombre} ${a.apellidos} ${a.dni || ''}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  const handleSelect = (alumnoId: number, nombreCompleto: string) => {
    onChange(alumnoId.toString());
    setQuery(nombreCompleto);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        className="input"
        placeholder="Buscar alumno por nombre o DNI..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          onChange(""); // Clear selection while typing
        }}
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        autoComplete="off"
      />
      
      {isOpen && query && !disabled && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: 'white',
          border: '1px solid var(--color-gray-200)',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          zIndex: 50,
          marginTop: '0.25rem',
          padding: 0,
          margin: 0,
          listStyle: 'none'
        }}>
          {filteredAlumnos.length > 0 ? (
            filteredAlumnos.map(a => (
              <li 
                key={a.id}
                style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--color-gray-100)' }}
                onClick={() => handleSelect(a.id, `${a.nombre} ${a.apellidos}`)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-gray-50)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{a.nombre} {a.apellidos}</div>
                {a.dni && <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>DNI: {a.dni}</div>}
              </li>
            ))
          ) : (
            <li style={{ padding: '0.75rem 1rem', color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
              No se encontraron alumnos
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
