import { useState } from "react";
import RatesTab from "./RatesTab";
import ReceiptsTab from "./ReceiptsTab";
import styles from "./Payments.module.css";

const Payments = () => {
  const [activeTab, setActiveTab] = useState<"rates" | "receipts">("receipts");

  return (
    <div className={styles.paymentsContainer}>
      <div className={styles.header}>
        <h2>Cobros y Tarifas</h2>
        <p className="text-gray-600">
          Administra las tarifas de la temporada y registra los pagos mensuales de los alumnos.
        </p>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === "receipts" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("receipts")}
        >
          Control de Recibos
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "rates" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("rates")}
        >
          Gestión de Tarifas
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "receipts" && <ReceiptsTab />}
        {activeTab === "rates" && <RatesTab />}
      </div>
    </div>
  );
};

export default Payments;
