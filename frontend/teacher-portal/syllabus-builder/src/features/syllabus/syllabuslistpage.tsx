import { useEffect, useState } from "react";
import { listSyllabuses } from "./syllabusapi";
import type { SyllabusListItem } from "../../lib/types";

export default function SyllabusList() {
  const [items, setItems] = useState<SyllabusListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await listSyllabuses();
        if (!alive) return;

        setItems(data);
      } catch (e: unknown) {
        if (!alive) return;

        // minimal safe error message
        const msg =
          e instanceof Error ? e.message : "Failed to load syllabuses.";
        setError(msg);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <div>Loading syllabuses...</div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ marginBottom: 8 }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  if (items.length === 0) {
    return <div>No syllabuses found.</div>;
  }

  return (
    <div>
      <h2>Syllabuses</h2>

      <ul>
        {items.map((s) => (
          <li key={s.id}>
            <strong>{s.syllabusCode}</strong>
            {}
          </li>
        ))}
      </ul>
    </div>
  );
}
