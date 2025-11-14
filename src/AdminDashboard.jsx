import React, { useEffect, useMemo, useState } from "react";

const LOGO_URL =
  "https://scontent-lga3-2.xx.fbcdn.net/v/t39.30808-6/335322893_222820200226688_1211221556763724466_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=lPAlpUQgavMQ7kNvwGzHEny&_nc_oc=Adker9sL8-COYd6zlLN40hOCEAIvLe6T_t_kJK_92izZgsH9C0r9YLkxmTdvAoRp58k&_nc_zt=23&_nc_ht=scontent-lga3-2.xx&_nc_gid=XLaijGiFsHdo-_APKlQnZQ&oh=00_AfhV0_NTUPe-HNxO6AiF3bZzff_yDhFMtHLUHMCFSNWdrA&oe=691C332E";

const PRIMARY = "#0B4DA2";
const ACCENT = "#EE6C4D";

// IMPORTANT: root Apps Script URL (no query string)
const ADMIN_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbymKxV156gkuGKI_eyKb483W4cGORMMcWqKsFcmgHAif51xQHyOCDO4KeXPJdK4gHpD/exec";

function StatCard({ label, value, helper }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-1">
        {value}
      </div>
      {helper && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {helper}
        </div>
      )}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
      {children}
    </span>
  );
}

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${ADMIN_ENDPOINT}?mode=responses`);
        const data = await res.json();

        if (data.status !== "ok") {
          throw new Error(data.message || "Unknown error from Apps Script");
        }

        const cols = data.columns || [];
        const colIndex = (name) => cols.indexOf(name);

        const tsIdx = colIndex("Timestamp");
        const nameIdx = colIndex("Name");
        const emailIdx = colIndex("Email");
        const primaryCommIdx = colIndex("PrimaryComm");
        const secondaryCommIdx = colIndex("SecondaryComm");
        const primaryMotivIdx = colIndex("PrimaryMotiv");
        const secondaryMotivIdx = colIndex("SecondaryMotiv");
        const roleIdx = colIndex("Role");

        const parsed = (data.rows || []).map((row, i) => {
          const tsRaw = row[tsIdx];
          let tsDate = null;
          if (tsRaw) {
            const d = new Date(tsRaw);
            if (!isNaN(d.getTime())) tsDate = d;
          }

          return {
            id: i,
            timestamp: tsDate,
            timestampRaw: tsRaw || "",
            name: row[nameIdx] ?? "",
            email: row[emailIdx] ?? "",
            primaryComm: row[primaryCommIdx] ?? "",
            secondaryComm: row[secondaryCommIdx] ?? "",
            primaryMotiv: row[primaryMotivIdx] ?? "",
            secondaryMotiv: row[secondaryMotivIdx] ?? "",
            role: row[roleIdx] ?? "",
          };
        });

        // Sort most recent first
        parsed.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp.getTime() - a.timestamp.getTime();
          }
          return 0;
        });

        setRows(parsed);
      } catch (err) {
        console.error("Admin load error:", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredRows = useMemo(() => {
    if (roleFilter === "All") return rows;
    return rows.filter((r) => r.role === roleFilter);
  }, [rows, roleFilter]);

  const totalSubmissions = rows.length;
  const lastSubmission = rows[0];

  const roleCounts = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const key = r.role || "Unknown";
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [rows]);

  const primaryCommCounts = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (!r.primaryComm) return;
      map[r.primaryComm] = (map[r.primaryComm] || 0) + 1;
    });
    return map;
  }, [rows]);

  const primaryMotivCounts = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (!r.primaryMotiv) return;
      map[r.primaryMotiv] = (map[r.primaryMotiv] || 0) + 1;
    });
    return map;
  }, [rows]);

  const recent = filteredRows.slice(0, 25);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="w-full border-b bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <img src={LOGO_URL} alt="Elmcrest" className="h-10 w-10 rounded" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold" style={{ color: PRIMARY }}>
              Elmcrest Compass – Admin Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Internal view of Communication &amp; Motivation Compass
              submissions
            </p>
          </div>
          <Pill>Admin</Pill>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Status / errors */}
        {loading && (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Loading responses from Google Sheets…
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            Error loading data from Apps Script: {error}
          </div>
        )}

        {/* Top stats */}
        <section className="grid md:grid-cols-4 gap-4">
          <StatCard
            label="Total submissions"
            value={totalSubmissions}
            helper="All-time count from the Responses sheet"
          />
          <StatCard
            label="Unique roles"
            value={Object.keys(roleCounts).length || 0}
            helper={Object.entries(roleCounts)
              .map(([role, count]) => `${role}: ${count}`)
              .join(" • ") || "No data yet"}
          />
          <StatCard
            label="Most common primary Comm"
            value={
              Object.keys(primaryCommCounts).length
                ? Object.entries(primaryCommCounts).sort(
                    (a, b) => b[1] - a[1]
                  )[0][0]
                : "—"
            }
            helper={
              Object.keys(primaryCommCounts).length
                ? Object.entries(primaryCommCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" • ")
                : "No data yet"
            }
          />
          <StatCard
            label="Most common primary Motiv"
            value={
              Object.keys(primaryMotivCounts).length
                ? Object.entries(primaryMotivCounts).sort(
                    (a, b) => b[1] - a[1]
                  )[0][0]
                : "—"
            }
            helper={
              Object.keys(primaryMotivCounts).length
                ? Object.entries(primaryMotivCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" • ")
                : "No data yet"
            }
          />
        </section>

        {/* Filters */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold mb-1">Recent submissions</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing up to 25 most recent rows from the{" "}
              <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                Responses
              </code>{" "}
              sheet.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 dark:text-slate-300">Filter by role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/60 px-2 py-1 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="All">All roles</option>
              {Object.keys(roleCounts).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Last submission info */}
        {lastSubmission && (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="font-semibold mb-1 text-slate-800 dark:text-slate-100">
              Last submission
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div>
                <span className="font-medium">Name:</span>{" "}
                {lastSubmission.name || "—"}
              </div>
              <div>
                <span className="font-medium">Email:</span>{" "}
                {lastSubmission.email || "—"}
              </div>
              <div>
                <span className="font-medium">Role:</span>{" "}
                {lastSubmission.role || "—"}
              </div>
              <div>
                <span className="font-medium">Primary Comm:</span>{" "}
                {lastSubmission.primaryComm || "—"}
              </div>
              <div>
                <span className="font-medium">Primary Motiv:</span>{" "}
                {lastSubmission.primaryMotiv || "—"}
              </div>
              <div>
                <span className="font-medium">Timestamp:</span>{" "}
                {lastSubmission.timestamp
                  ? lastSubmission.timestamp.toLocaleString()
                  : lastSubmission.timestampRaw || "—"}
              </div>
            </div>
          </section>
        )}

        {/* Table */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-xs text-slate-500 dark:text-slate-300">
                    Timestamp
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-xs text-slate-500 dark:text-slate-300">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-xs text-slate-500 dark:text-slate-300">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-xs text-slate-500 dark:text-slate-300">
                    Role
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-xs text-slate-500 dark:text-slate-300">
                    Primary Comm
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-xs text-slate-500 dark:text-slate-300">
                    Secondary Comm
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-xs text-slate-500 dark:text-slate-300">
                    Primary Motiv
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-xs text-slate-500 dark:text-slate-300">
                    Secondary Motiv
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No submissions found yet.
                    </td>
                  </tr>
                )}
                {recent.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={
                      idx % 2 === 0
                        ? "bg-white dark:bg-slate-800"
                        : "bg-slate-50/60 dark:bg-slate-900/40"
                    }
                  >
                    <td className="px-3 py-2 align-top whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                      {row.timestamp
                        ? row.timestamp.toLocaleString()
                        : row.timestampRaw || "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-800 dark:text-slate-100">
                      {row.name || "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-600 dark:text-slate-300">
                      {row.email || "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-700 dark:text-slate-200">
                      {row.role || "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-700 dark:text-slate-200">
                      {row.primaryComm || "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-600 dark:text-slate-300">
                      {row.secondaryComm || "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-700 dark:text-slate-200">
                      {row.primaryMotiv || "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-600 dark:text-slate-300">
                      {row.secondaryMotiv || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-xs text-slate-500 dark:text-slate-400 text-center pt-4 pb-6">
          Data source: Google Sheets “Responses” via Apps Script •{" "}
          <span style={{ color: PRIMARY }}>Elmcrest Children’s Center</span>
        </footer>
      </main>
    </div>
  );
}
