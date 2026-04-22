import React, { useState, useRef, useEffect } from 'react';
import styles from './SearchableSelect.module.css';

interface Option {
  id: number | string;
  label: string;
  sublabel?: string;
  image?: string | null;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | string | undefined;
  onChange: (value: number | string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => String(opt.id) === String(value));

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getImageUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return "";
    if (photoUrl.startsWith("http") || photoUrl.startsWith("data:")) return photoUrl;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/alumnos/foto/${photoUrl}`;
  };

  const handleSelect = (optionId: number | string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <div 
        className={`${styles.selectBox} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <div className={styles.selectedContent}>
            {selectedOption.image && (
              <img src={getImageUrl(selectedOption.image)} alt="" className={styles.optionImg} />
            )}
            <div className={styles.selectedText}>
                <span className={styles.label}>{selectedOption.label}</span>
                {selectedOption.sublabel && <span className={styles.sublabel}>{selectedOption.sublabel}</span>}
            </div>
          </div>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <span className={styles.arrow}>{isOpen ? '▴' : '▾'}</span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Escribe para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className={styles.optionsList}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.id} 
                  className={`${styles.option} ${opt.id === value ? styles.selected : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.id);
                  }}
                >
                  {opt.image && (
                    <img src={getImageUrl(opt.image)} alt="" className={styles.optionImg} />
                  )}
                  <div className={styles.optionInfo}>
                    <span className={styles.label}>{opt.label}</span>
                    {opt.sublabel && <span className={styles.sublabel}>{opt.sublabel}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>No se encontraron resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
