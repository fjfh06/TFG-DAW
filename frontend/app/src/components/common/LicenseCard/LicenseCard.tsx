import React, { useRef } from "react";
import { Download } from "lucide-react";
import type { Alumno, LicenciaAlumno, TipoLicencia } from "../../../types";
import styles from "./LicenseCard.module.css";
import tarjetaLicenciaVacia from "../../../assets/TarjetaLicenciaVacia.png";

interface LicenseCardProps {
  alumno: Alumno;
  licencia: LicenciaAlumno | null;
  tipoLicencia: TipoLicencia | null;
}

const formatLicenseDate = (dateStr?: string | null) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "---";
  
  const day = date.getDate();
  const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

const formatBirthDate = (dateStr?: string | null) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "---";
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

export const LicenseCard: React.FC<LicenseCardProps> = ({
  alumno,
  licencia,
  tipoLicencia
}) => {
  const fullName = `${alumno.nombre} ${alumno.apellidos}`.toUpperCase();
  const nameLength = fullName.length;
  
  // Custom font size scaling for names so they fit nicely by default
  const nameFontSize = 
    nameLength > 30 ? "4cqw" :
    nameLength > 25 ? "4cqw" :
    nameLength > 20 ? "5cqw" :
    nameLength > 16 ? "5cqw" :
    "5cqw";

  const isPagado = licencia?.estado_pago === "pagado";

  // React Refs for high-fidelity DOM-to-Canvas image export
  const cardRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const dniRef = useRef<HTMLDivElement>(null);
  const fnRef = useRef<HTMLDivElement>(null);
  const licNameRef = useRef<HTMLDivElement>(null);
  const desdeRef = useRef<HTMLDivElement>(null);
  const hastaRef = useRef<HTMLDivElement>(null);

  // Compiles current DOM absolute coordinates/styles and exports as a high-res flat PNG
  const handleDownload = () => {
    const card = cardRef.current;
    if (!card) return;

    const renderedWidth = card.clientWidth;
    const renderedHeight = card.clientHeight;
    if (renderedWidth === 0 || renderedHeight === 0) return;

    // Aspect ratio locking scale factors to match 1061x674 template resolution
    const scaleX = 1061 / renderedWidth;
    const scaleY = 674 / renderedHeight;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = tarjetaLicenciaVacia;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1061;
      canvas.height = 674;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw high-resolution template background (transparent corners preserved)
      ctx.drawImage(img, 0, 0, 1061, 674);

      // Sub-function to extract computed style and draw onto the canvas
      const drawField = (el: HTMLDivElement | null, isCentered = false) => {
        if (!el) return;
        const style = window.getComputedStyle(el);
        const text = el.textContent || "";
        
        // Exact scaled positions relative to the locked-aspect-ratio container
        const left = el.offsetLeft * scaleX;
        const top = el.offsetTop * scaleY;
        const width = el.clientWidth * scaleX;
        const height = el.clientHeight * scaleY;
        
        const fontSizeStr = style.fontSize;
        const fontSize = parseFloat(fontSizeStr) * scaleX;
        const fontWeight = style.fontWeight || "600";
        const fontFamily = style.fontFamily || "Inter, Arimo, sans-serif";
        
        ctx.fillStyle = "#000000";
        ctx.textBaseline = "middle";
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        
        if (isCentered) {
          ctx.textAlign = "center";
          ctx.fillText(text, left + width / 2, top + height / 2);
        } else {
          ctx.textAlign = "left";
          ctx.fillText(text, left, top + height / 2);
        }
      };

      // Draw every absolute overlay field using their exact CSS configurations!
      drawField(nameRef.current, true);
      drawField(dniRef.current, false);
      drawField(fnRef.current, false);
      drawField(licNameRef.current, true);
      drawField(desdeRef.current, false);
      drawField(hastaRef.current, false);

      // Trigger standard browser download
      try {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `Licencia_${alumno.nombre.toUpperCase()}_${alumno.apellidos.toUpperCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error("No se pudo generar la imagen descargable:", err);
      }
    };
  };

  return (
    <div className={styles.idCardWrapper}>
      <div 
        ref={cardRef}
        className={`${styles.digitalCard} ${isPagado ? styles.cardPaid : styles.cardUnpaid}`}
      >
        
        {/* Card Background Template (natively preserves transparency!) */}
        <img src={tarjetaLicenciaVacia} alt="Tarjeta Licencia" className={styles.cardBgImage} />
        
        {/* Status glow overlay */}
        <div className={styles.cardGlow}></div>
        
        {/* Dynamic Text Fields (Absolute Overlays, fully editable in CSS) */}
        <div 
          ref={nameRef}
          className={styles.fieldName} 
          style={{ fontSize: nameFontSize }}
        >
          {fullName}
        </div>
        
        <div ref={dniRef} className={styles.fieldDni}>
          {alumno.dni || "---"}
        </div>
        
        <div ref={fnRef} className={styles.fieldBirthDate}>
          {formatBirthDate(alumno.fecha_nacimiento)}
        </div>
        
        <div ref={licNameRef} className={styles.fieldLicenseName}>
          {tipoLicencia?.nombre.toUpperCase() || (licencia ? "LICENCIA OFICIAL" : "SEGURO EN TRÁMITE")}
        </div>
        
        <div ref={desdeRef} className={styles.fieldValidoDesde}>
          {formatLicenseDate(licencia?.fecha_inicio_validez)}
        </div>
        
        <div ref={hastaRef} className={styles.fieldValidoHasta}>
          {formatLicenseDate(licencia?.fecha_fin_validez)}
        </div>

      </div>
      
      {/* Action panel with status badge and download button */}
      <div className={styles.cardActionsRow}>
        <div className={`${styles.cardStatusBadgeRow} ${isPagado ? styles.badgePaid : styles.badgeUnpaid}`}>
          <span className={`${styles.statusDot} ${isPagado ? styles.dotActive : styles.dotInactive}`}></span>
          <span className={styles.statusBadgeText}>
            {licencia 
              ? `Licencia ${isPagado ? 'Pagada y Activa' : 'Pendiente de Pago'}` 
              : 'Seguro deportivo en trámite por Shifu'}
          </span>
        </div>
        
        <button onClick={handleDownload} className={styles.downloadButton}>
          <Download size={13} />
          <span>Descargar PNG</span>
        </button>
      </div>
    </div>
  );
};
