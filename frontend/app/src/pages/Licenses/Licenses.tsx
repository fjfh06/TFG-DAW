import { useState } from "react";
import LicenseTypesTab from "./LicenseTypesTab";
import AssignedLicensesTab from "./AssignedLicensesTab";
import styles from "./Licenses.module.css";

const Licenses = () => {
  const [activeTab, setActiveTab] = useState<"assigned" | "types">("assigned");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Licencias Federativas</h2>
        <p className="text-gray-600">
          Gestiona las cuotas federativas anuales y repásalas por alumno
        </p>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === "assigned" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("assigned")}
        >
          Licencias de Alumnos
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "types" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("types")}
        >
          Tipos de Licencia
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "assigned" && <AssignedLicensesTab />}
        {activeTab === "types" && <LicenseTypesTab />}
      </div>
    </div>
  );
};

export default Licenses;
