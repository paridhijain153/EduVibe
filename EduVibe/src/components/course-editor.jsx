// Reusable editor for a course's modules and topics.
// Works in two modes:
//  - controlled: pass `value` (modules array) + `onChange` (no persistence)
//  - persisted:  pass `course` + `onSave` (persists via Courses.upsert when Save clicked)
import { useEffect, useState } from "react";
import { Courses } from "../lib/store.js";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyTopic(slug) {
  return {
    id: uid(`${slug || "t"}`),
    title: "New topic",
    duration: "05:00",
    type: "video",
    content: "Replace this with your lesson content.",
  };
}

function emptyModule(slug, n) {
  return {
    id: uid(`${slug || "m"}`),
    title: `Module ${n}: New module`,
    topics: [emptyTopic(slug)],
  };
}

/**
 * Props:
 *  - course?: full course object (persisted mode)
 *  - value?: modules array (controlled mode)
 *  - onChange?: (modules) => void (controlled mode)
 *  - onSave?: (updatedCourse) => void  (persisted mode optional callback)
 *  - hideSave?: boolean — hide the save button (when parent owns saving)
 */
export function CourseEditor({ course, value, onChange, onSave, hideSave }) {
  const controlled = Array.isArray(value);
  const [modules, setModules] = useState(
    controlled ? value : course?.modules ?? []
  );
  const [openModuleId, setOpenModuleId] = useState(modules[0]?.id ?? null);

  useEffect(() => {
    if (controlled) setModules(value);
  }, [controlled, value]);

  const update = (next) => {
    setModules(next);
    onChange?.(next);
  };

  const addModule = () => {
    const slug = course?.slug ?? "new";
    const next = [...modules, emptyModule(slug, modules.length + 1)];
    update(next);
    setOpenModuleId(next[next.length - 1].id);
  };

  const removeModule = (mid) => {
    if (!confirm("Remove this module and all its topics?")) return;
    update(modules.filter((m) => m.id !== mid));
  };

  const renameModule = (mid, title) => {
    update(modules.map((m) => (m.id === mid ? { ...m, title } : m)));
  };

  const moveModule = (mid, dir) => {
    const idx = modules.findIndex((m) => m.id === mid);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= modules.length) return;
    const next = [...modules];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    update(next);
  };

  const addTopic = (mid) => {
    const slug = course?.slug ?? "new";
    update(
      modules.map((m) =>
        m.id === mid ? { ...m, topics: [...m.topics, emptyTopic(slug)] } : m
      )
    );
  };

  const removeTopic = (mid, tid) => {
    update(
      modules.map((m) =>
        m.id === mid
          ? { ...m, topics: m.topics.filter((t) => t.id !== tid) }
          : m
      )
    );
  };

  const updateTopic = (mid, tid, patch) => {
    update(
      modules.map((m) =>
        m.id === mid
          ? {
              ...m,
              topics: m.topics.map((t) =>
                t.id === tid ? { ...t, ...patch } : t
              ),
            }
          : m
      )
    );
  };

  const moveTopic = (mid, tid, dir) => {
    update(
      modules.map((m) => {
        if (m.id !== mid) return m;
        const idx = m.topics.findIndex((t) => t.id === tid);
        const swap = idx + dir;
        if (idx < 0 || swap < 0 || swap >= m.topics.length) return m;
        const t = [...m.topics];
        [t[idx], t[swap]] = [t[swap], t[idx]];
        return { ...m, topics: t };
      })
    );
  };

  const save = () => {
    if (!course) return;
    const updated = { ...course, modules };
    Courses.upsert(updated);
    toast.success("Course saved");
    onSave?.(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Curriculum
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {modules.length} module{modules.length === 1 ? "" : "s"} ·{" "}
            {modules.reduce((a, m) => a + m.topics.length, 0)} topics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addModule}
            className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <Plus className="size-3.5" /> Add module
          </button>
          {!hideSave && course && (
            <button
              onClick={save}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:bg-foreground/90"
            >
              <Save className="size-3.5" /> Save
            </button>
          )}
        </div>
      </div>

      {modules.length === 0 && (
        <div className="rounded-2xl border border-dashed border-foreground/10 p-8 text-center text-sm text-muted-foreground">
          No modules yet. Click "Add module" to start building your curriculum.
        </div>
      )}

      <div className="space-y-3">
        {modules.map((m, mIdx) => {
          const open = openModuleId === m.id;
          return (
            <div
              key={m.id}
              className="rounded-2xl border border-foreground/5 bg-card"
            >
              <div className="flex items-center gap-2 p-4">
                <button
                  onClick={() => setOpenModuleId(open ? null : m.id)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
                  aria-label="Toggle"
                >
                  {open ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </button>
                <GripVertical className="size-4 text-muted-foreground/50" />
                <input
                  value={m.title}
                  onChange={(e) => renameModule(m.id, e.target.value)}
                  className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium outline-none hover:border-foreground/10 focus:border-foreground/20"
                />
                <span className="text-xs text-muted-foreground">
                  {m.topics.length} topics
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveModule(m.id, -1)}
                    disabled={mIdx === 0}
                    className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveModule(m.id, 1)}
                    disabled={mIdx === modules.length - 1}
                    className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeModule(m.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete module"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {open && (
                <div className="space-y-2 border-t border-foreground/5 p-4">
                  {m.topics.map((t, tIdx) => (
                    <TopicRow
                      key={t.id}
                      topic={t}
                      isFirst={tIdx === 0}
                      isLast={tIdx === m.topics.length - 1}
                      onChange={(patch) => updateTopic(m.id, t.id, patch)}
                      onRemove={() => removeTopic(m.id, t.id)}
                      onMove={(dir) => moveTopic(m.id, t.id, dir)}
                    />
                  ))}
                  <button
                    onClick={() => addTopic(m.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-foreground/10 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  >
                    <Plus className="size-3.5" /> Add topic
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopicRow({ topic, isFirst, isLast, onChange, onRemove, onMove }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-foreground/5 bg-background">
      <div className="flex items-center gap-2 p-3">
        <button
          onClick={() => setExpanded((x) => !x)}
          className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
          aria-label="Toggle"
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
        <select
          value={topic.type}
          onChange={(e) => onChange({ type: e.target.value })}
          className="rounded-md border border-foreground/10 bg-card px-2 py-1 text-xs"
        >
          <option value="video">Video</option>
          <option value="reading">Reading</option>
          <option value="quiz">Quiz</option>
        </select>
        <input
          value={topic.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none hover:border-foreground/10 focus:border-foreground/20"
        />
        <input
          value={topic.duration}
          onChange={(e) => onChange({ duration: e.target.value })}
          placeholder="05:00"
          className="w-20 rounded-md border border-foreground/10 bg-card px-2 py-1 text-xs tabular-nums"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(-1)}
            disabled={isFirst}
            className="rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-30"
          >
            ↑
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={isLast}
            className="rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-30"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete topic"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="space-y-2 border-t border-foreground/5 p-3">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Content
            </span>
            <textarea
              value={topic.content ?? ""}
              onChange={(e) => onChange({ content: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-foreground/20"
              placeholder={
                topic.type === "quiz"
                  ? "Quiz instructions / description"
                  : topic.type === "reading"
                  ? "Reading material (markdown)"
                  : "Video description or transcript"
              }
            />
          </label>
          {topic.type === "video" && (
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Video URL (optional)
              </span>
              <input
                value={topic.videoUrl ?? ""}
                onChange={(e) => onChange({ videoUrl: e.target.value })}
                placeholder="https://…"
                className="w-full rounded-lg border border-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:border-foreground/20"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
