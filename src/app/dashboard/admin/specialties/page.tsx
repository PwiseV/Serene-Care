"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Specialty {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface FormState {
  name: string;
  icon: string;
  description: string;
}

const EMPTY_FORM: FormState = { name: "", icon: "", description: "" };

export default function AdminSpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [showCreate, setShowCreate] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  const fetchSpecialties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/specialties");
      const data = await res.json();
      if (res.ok) setSpecialties(data.specialties);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/specialties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lỗi tạo chuyên khoa");
        return;
      }
      setCreateForm(EMPTY_FORM);
      setShowCreate(false);
      await fetchSpecialties();
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/specialties/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lỗi cập nhật");
        return;
      }
      setEditId(null);
      await fetchSpecialties();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Xoá chuyên khoa "${name}"?`)) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/specialties/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Lỗi xoá");
        return;
      }
      await fetchSpecialties();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(s: Specialty) {
    setEditId(s._id);
    setEditForm({ name: s.name, icon: s.icon, description: s.description });
    setShowCreate(false);
  }

  return (
    <main className="pt-24 pb-20 min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard/admin"
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold font-heading">Quản lý chuyên khoa</h1>
            <p className="text-on-surface-variant font-sans text-sm mt-0.5">
              {specialties.length} chuyên khoa
            </p>
          </div>
          <button
            onClick={() => { setShowCreate((v) => !v); setEditId(null); setError(""); }}
            className="px-5 py-2 rounded-full bg-primary text-on-primary text-sm font-bold font-sans hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base leading-none">add</span>
            Thêm mới
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm font-sans">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5 mb-6"
          >
            <h2 className="font-bold font-heading mb-4">Thêm chuyên khoa mới</h2>
            <SpecialtyFormFields
              form={createForm}
              onChange={(f) => setCreateForm(f)}
            />
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-full bg-primary text-on-primary text-sm font-bold font-sans hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setError(""); }}
                className="px-5 py-2 rounded-full bg-surface-container text-on-surface text-sm font-bold font-sans hover:bg-surface-container-high transition-colors"
              >
                Huỷ
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-16 text-on-surface-variant font-sans">Đang tải...</div>
        ) : specialties.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-16 text-center shadow-xl shadow-indigo-500/5">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">
              category
            </span>
            <p className="text-on-surface-variant font-sans">Chưa có chuyên khoa nào.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {specialties.map((s) => (
              <div
                key={s._id}
                className="bg-surface-container-lowest rounded-2xl shadow-xl shadow-indigo-500/5 overflow-hidden"
              >
                {editId === s._id ? (
                  <form onSubmit={handleEdit} className="p-6">
                    <SpecialtyFormFields
                      form={editForm}
                      onChange={(f) => setEditForm(f)}
                    />
                    <div className="flex gap-3 mt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 rounded-full bg-primary text-on-primary text-sm font-bold font-sans hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        {saving ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditId(null); setError(""); }}
                        className="px-5 py-2 rounded-full bg-surface-container text-on-surface text-sm font-bold font-sans hover:bg-surface-container-high transition-colors"
                      >
                        Huỷ
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-5 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {s.icon && (
                        <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0">
                          {s.icon}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface font-sans">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-on-surface-variant font-sans truncate">
                            {s.description}
                          </p>
                        )}
                        <p className="text-xs text-outline font-sans font-mono">{s.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEdit(s)}
                        className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
                        title="Sửa"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(s._id, s.name)}
                        disabled={saving}
                        className="p-2 rounded-full hover:bg-error-container transition-colors text-error disabled:opacity-50"
                        title="Xoá"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SpecialtyFormFields({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-bold font-sans text-on-surface mb-1">
          Tên chuyên khoa <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="Ví dụ: Tim mạch"
          required
          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-sans text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-bold font-sans text-on-surface mb-1">
          Icon (Material Symbol)
        </label>
        <input
          type="text"
          value={form.icon}
          onChange={(e) => onChange({ ...form, icon: e.target.value })}
          placeholder="Ví dụ: favorite, vaccines, biotech"
          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-sans text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-bold font-sans text-on-surface mb-1">Mô tả</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          rows={2}
          placeholder="Mô tả ngắn về chuyên khoa..."
          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-sans text-sm focus:outline-none focus:border-primary resize-none"
        />
      </div>
    </div>
  );
}
