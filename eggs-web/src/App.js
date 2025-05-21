"use client"

import { useEffect, useState, cloneElement} from "react"
import { Plus, Trash2, Loader2, Egg, ChevronRight, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import "./App.css"

const API_BASE = "http://localhost:3000"
const STATUSES = ["set", "incubating", "hatched"]

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.status === 204 ? null : await res.json()
}
const listEggs = () => api("/eggs")
const createEgg = (label) => api("/eggs", { method: "POST", body: JSON.stringify({ label }) })
const updateEggStatus = (id, status) => api(`/eggs/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
const deleteEgg = (id) => api(`/eggs/${id}`, { method: "DELETE" })

const statusConfig = {
  set: {
    icon: <Egg className="w-6 h-6" />,
    gradient: "from-amber-100 to-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    shadow: "shadow-amber-200/50",
    label: "Set",
    description: "Egg is set and waiting",
  },
  incubating: {
    icon: <Egg className="w-6 h-6" />,
    gradient: "from-orange-100 to-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    shadow: "shadow-orange-200/50",
    label: "Incubating",
    description: "Egg is being incubated",
  },
  hatched: {
    icon: <Egg className="w-6 h-6" />,
    gradient: "from-emerald-100 to-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    shadow: "shadow-emerald-200/50",
    label: "Hatched",
    description: "Egg has hatched successfully",
  },
}

const cn = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

export default function EggIncubator() {
  const [eggs, setEggs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    listEggs()
      .then((data) => {
        setEggs(data);
        setLoading(false);
      })
      .catch((e) => {
        setErr(e.message);
        setLoading(false);
      });
  }, []);

  const addEgg = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;

    try {
      setLoading(true);
      const egg = await createEgg(label.trim());
      setEggs((prev) => [...prev, egg]);
      setLabel("");
      showNotification("Egg added successfully!", "success");
    } catch (e) {
      showNotification(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const cycleStatus = async (egg) => {
    const currentIndex = STATUSES.indexOf(egg.status);
    const next = STATUSES[(currentIndex + 1) % STATUSES.length];

    try {
      const updated = await updateEggStatus(egg.id, next);
      setEggs((prev) => prev.map((e) => (e.id === egg.id ? updated : e)));
      showNotification(`Egg status updated to ${statusConfig[next].label}!`, "success");
    } catch (e) {
      showNotification(e.message, "error");
    }
  };

  const removeEgg = async (id, e) => {
    e.stopPropagation();

    try {
      await deleteEgg(id);
      setEggs((prev) => prev.filter((e) => e.id !== id));
      showNotification("Egg removed successfully!", "success");
    } catch (e) {
      showNotification(e.message, "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const eggsToShow = filter === "all" ? eggs : eggs.filter((e) => e.status === filter);

  return (
    <div className="egg-incubator-app">
      <div className="app-container">
        <header className="header">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="header-icon-wrapper"
          >
            <div className="header-icon-bg">
              <Egg className="header-icon" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="header-title"
          >
            Egg Incubator
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="header-subtitle"
          >
            Track and manage your eggs through their lifecycle
          </motion.p>
        </header>

        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`notification-popup ${
                notification.type === "success"
                  ? "notification-popup-success"
                  : "notification-popup-error"
              }`}
            >
              <div className="notification-content">
                <div
                  className={`notification-icon-wrapper ${
                    notification.type === "success"
                      ? "notification-icon-wrapper-success"
                      : "notification-icon-wrapper-error"
                  }`}
                >
                  {notification.type === "success" ? (
                    <ChevronRight className="notification-icon" />
                  ) : (
                    <AlertCircle className="notification-icon" />
                  )}
                </div>
                <p
                  className={`notification-message ${
                    notification.type === "success"
                      ? "notification-message-success"
                      : "notification-message-error"
                  }`}
                >
                  {notification.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={addEgg}
          className="add-egg-form"
        >
          <h2 className="form-title">Add New Egg</h2>
          <div className="form-input-group">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter egg label..."
              className="form-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !label.trim()}
              className="form-button"
            >
              {loading ? (
                <Loader2 className="button-icon animate-spin" />
              ) : (
                <Plus className="button-icon" />
              )}
              <span className="button-text">Add Egg</span>
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="filter-controls"
        >
          <div className="filter-buttons-list">
            {[
              { key: "all", label: "All Eggs" },
              ...STATUSES.map((status) => ({
                key: status,
                label: statusConfig[status].label,
                iconComponent: statusConfig[status].icon,
                iconColorClass: statusConfig[status].colorClass,
              })),
            ].map(({ key, label, iconComponent, iconColorClass }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`filter-button ${
                  filter === key ? "filter-button-active" : ""
                }`}
              >
                {iconComponent && iconColorClass && (
                  <span className={`filter-button-icon ${iconColorClass}`}>
                    {cloneElement(iconComponent, { className: 'icon-small' } )}
                  </span>
                )}
                 <span>{label}</span>
                {filter === key && (
                  <span className="filter-button-count">
                    {key === "all"
                      ? eggs.length
                      : eggs.filter((e) => e.status === key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {err && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="error-message-box"
          >
            <div className="error-message-content">
              <AlertCircle className="error-icon" />
              <p>{err}</p>
            </div>
          </motion.div>
        )}

        {loading && !err && (
          <div className="loading-indicator">
            <Loader2 className="loading-spinner-icon animate-spin" />
            <p className="loading-text">Loading eggs...</p>
          </div>
        )}

        {!loading && !err && eggs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="no-eggs-placeholder"
          >
            <div className="no-eggs-icon-container">
              <Egg className="no-eggs-icon" />
            </div>
            <h3 className="no-eggs-title">No eggs yet</h3>
            <p className="no-eggs-message">
              Add your first egg using the form above to get started
            </p>
          </motion.div>
        )}

        {!loading && !err && eggs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="eggs-grid">
              <AnimatePresence>
                {eggsToShow.map((egg) => (
                  <motion.div
                    key={egg.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="egg-card-wrapper"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => cycleStatus(egg)}
                      className={`egg-card egg-card-status-${egg.status}`}
                    >
                      <div className="egg-card-header">
                        <div className={`egg-card-icon-area egg-card-icon-area-${egg.status}`}>
                           {cloneElement(statusConfig[egg.status].icon, { className: `egg-card-main-icon egg-text-color-${egg.status}` })}
                        </div>
                        <div className={`egg-card-status-badge egg-card-status-badge-${egg.status}`}>
                          {statusConfig[egg.status].label}
                        </div>
                      </div>

                      <h3 className={`egg-card-label egg-text-color-${egg.status}`}>{egg.label}</h3>
                      <p className="egg-card-description">
                        {statusConfig[egg.status].description}
                      </p>

                      <div className="egg-card-footer">
                        <div className="egg-card-footer-hint">
                          Click to change status
                        </div>
                        <div className="egg-card-footer-arrow-bg">
                          <ChevronRight className={`egg-card-footer-arrow-icon egg-text-color-${egg.status}`} />
                        </div>
                      </div>
                    </motion.div>

                    <button
                      onClick={(e) => removeEgg(egg.id, e)}
                      aria-label="Delete egg"
                      className="delete-egg-button"
                    >
                      <Trash2 className="delete-egg-icon" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}