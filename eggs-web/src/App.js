"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Loader2, Egg, ChevronRight, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import "./styles.css"

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
  const [eggs, setEggs] = useState([])
  const [filter, setFilter] = useState("all")
  const [label, setLabel] = useState("")
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    listEggs()
      .then((data) => {
        setEggs(data)
        setLoading(false)
      })
      .catch((e) => {
        setErr(e.message)
        setLoading(false)
      })
  }, [])

  const addEgg = async (e) => {
    e.preventDefault()
    if (!label.trim()) return

    try {
      setLoading(true)
      const egg = await createEgg(label.trim())
      setEggs((prev) => [...prev, egg])
      setLabel("")
      showNotification("Egg added successfully!", "success")
    } catch (e) {
      showNotification(e.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const cycleStatus = async (egg) => {
    const currentIndex = STATUSES.indexOf(egg.status)
    const next = STATUSES[(currentIndex + 1) % STATUSES.length]

    try {
      const updated = await updateEggStatus(egg.id, next)
      setEggs((prev) => prev.map((e) => (e.id === egg.id ? updated : e)))
      showNotification(`Egg status updated to ${statusConfig[next].label}!`, "success")
    } catch (e) {
      showNotification(e.message, "error")
    }
  }

  const removeEgg = async (id, e) => {
    e.stopPropagation()

    try {
      await deleteEgg(id)
      setEggs((prev) => prev.filter((e) => e.id !== id))
      showNotification("Egg removed successfully!", "success")
    } catch (e) {
      showNotification(e.message, "error")
    }
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const eggsToShow = filter === "all" ? eggs : eggs.filter((e) => e.status === filter)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 bg-white p-3 rounded-full shadow-lg mb-4"
          >
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-3 rounded-full">
              <Egg className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-800"
          >
            Egg Incubator
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 mt-2 max-w-md mx-auto"
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
              className={cn(
                "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md",
                notification.type === "success"
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-red-50 border border-red-200",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    notification.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600",
                  )}
                >
                  {notification.type === "success" ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                </div>
                <p className={cn("font-medium", notification.type === "success" ? "text-emerald-700" : "text-red-700")}>
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
          className="bg-white rounded-2xl shadow-xl p-6 mb-10 max-w-md mx-auto"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Egg</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter egg label..."
              className="flex-1 h-10 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !label.trim()}
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              <span className="ml-2 hidden sm:inline">Add Egg</span>
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-10"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { key: "all", label: "All Eggs" },
              ...STATUSES.map((status) => ({
                key: status,
                label: statusConfig[status].label,
                icon: statusConfig[status].icon,
                color: statusConfig[status].text,
              })),
            ].map(({ key, label, icon, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2",
                  filter === key ? "bg-white shadow-md scale-105" : "bg-white/50 hover:bg-white hover:shadow-sm",
                )}
              >
                {icon && <span className={color}>{icon}</span>}
                <span className={filter === key ? "text-slate-800" : "text-slate-500"}>{label}</span>
                {filter === key && (
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 rounded-full text-xs text-slate-500">
                    {key === "all" ? eggs.length : eggs.filter((e) => e.status === key).length}
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
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700 max-w-md mx-auto"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p>{err}</p>
            </div>
          </motion.div>
        )}

        {loading && !err && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-500">Loading eggs...</p>
          </div>
        )}

        {!loading && !err && eggs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-2xl shadow-sm max-w-md mx-auto"
          >
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Egg className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No eggs yet</h3>
            <p className="text-slate-500 mb-6 max-w-xs mx-auto">
              Add your first egg using the form above to get started
            </p>
          </motion.div>
        )}

        {!loading && !err && eggs.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {eggsToShow.map((egg) => (
                  <motion.div
                    key={egg.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative group"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => cycleStatus(egg)}
                      className={cn(
                        "bg-gradient-to-br rounded-2xl border p-6 cursor-pointer",
                        statusConfig[egg.status].gradient,
                        statusConfig[egg.status].border,
                        statusConfig[egg.status].shadow,
                        "shadow-lg hover:shadow-xl transition-all",
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={cn(
                            "p-3 rounded-full",
                            egg.status === "set"
                              ? "bg-amber-200"
                              : egg.status === "incubating"
                                ? "bg-orange-200"
                                : "bg-emerald-200",
                          )}
                        >
                          <Egg className={cn("w-6 h-6", statusConfig[egg.status].text)} />
                        </div>
                        <div
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider",
                            egg.status === "set"
                              ? "bg-amber-200/50 text-amber-700"
                              : egg.status === "incubating"
                                ? "bg-orange-200/50 text-orange-700"
                                : "bg-emerald-200/50 text-emerald-700",
                          )}
                        >
                          {statusConfig[egg.status].label}
                        </div>
                      </div>

                      <h3 className={cn("text-xl font-bold mb-1", statusConfig[egg.status].text)}>{egg.label}</h3>
                      <p className="text-slate-600 text-sm">{statusConfig[egg.status].description}</p>

                      <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-between items-center">
                        <div className="text-xs text-slate-500">Click to change status</div>
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            "bg-white/80 backdrop-blur-sm",
                          )}
                        >
                          <ChevronRight className={cn("w-4 h-4", statusConfig[egg.status].text)} />
                        </div>
                      </div>
                    </motion.div>

                    <button
                      onClick={(e) => removeEgg(egg.id, e)}
                      aria-label="Delete egg"
                      className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity 
                        bg-white border border-red-200 text-red-500 hover:bg-red-500 hover:text-white 
                        rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
