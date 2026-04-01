"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import LogoutButton from "@/app/components/LogoutButton";

export default function UserPage() {
    useAuth("user");

    const [notes, setNotes] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalNotes, setTotalNotes] = useState(0);

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchNotes = async () => {
        const res = await fetch(`/api/notes?page=${page}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        setNotes(data.notes || []);
        setTotalNotes(data.total || 0);
        setTotalPages(data.totalPages || 1);
    };

    const createNote = async () => {
        const res = await fetch("/api/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        alert("Note created");

        setTitle("");
        setContent("");
        setPage(1);

        fetchNotes();
    };

    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    const deleteNote = async (id: string) => {
        await fetch(`/api/notes/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        fetchNotes();
    };

    const startEdit = (note: any) => {
        setEditingNoteId(note._id);
        setEditTitle(note.title);
        setEditContent(note.content);
    };

    const cancelEdit = () => {
        setEditingNoteId(null);
        setEditTitle("");
        setEditContent("");
    };

    const updateNote = async (id: string) => {
        const res = await fetch(`/api/notes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: editTitle, content: editContent }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Unable to update note");
            return;
        }

        alert("Note updated");
        cancelEdit();
        fetchNotes();
    };

    useEffect(() => {
        fetchNotes();
    }, [page, limit]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between rounded-2xl bg-indigo-500/20 p-6 backdrop-blur border border-indigo-200/20">
                    <div>
                        <h1 className="text-2xl font-bold">User Dashboard</h1>
                        <p className="mt-1 text-sm text-indigo-100/90">
                            Personal notes workflow with secure access.
                        </p>
                    </div>
                    <LogoutButton />
                </header>

                <section className="rounded-2xl bg-slate-900/70 border border-slate-700 p-5">
                    <h2 className="text-xl font-semibold mb-4">Create Note</h2>
                    <div className="space-y-3">
                        <input
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            placeholder="Content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                        />
                        <button
                            onClick={createNote}
                            className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 active:scale-[0.98]"
                        >
                            Create
                        </button>
                    </div>
                </section>

                <section className="rounded-2xl bg-slate-900/70 border border-slate-700 p-5">
                    <h2 className="text-xl font-semibold mb-4">Your Notes</h2>
                    <ul className="space-y-3">
                        {notes.length === 0 ? (
                            <li className="rounded-lg border border-slate-700 bg-slate-800 p-4 text-center text-slate-400">
                                No notes yet. Create your first note above.
                            </li>
                        ) : (
                            notes.map((note: any) => (
                                <li key={note._id} className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                                    {editingNoteId === note._id ? (
                                        <div className="space-y-3">
                                            <input
                                                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                            />
                                            <textarea
                                                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateNote(note._id)}
                                                    className="rounded-lg bg-green-500 px-4 py-1 text-xs font-medium text-white hover:bg-green-400"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="rounded-lg bg-slate-700 px-4 py-1 text-xs font-medium text-white hover:bg-slate-600"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-100">{note.title}</h3>
                                                <p className="mt-1 text-sm text-slate-300">{note.content}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEdit(note)}
                                                    className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-400"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteNote(note._id)}
                                                    className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-rose-400"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-slate-700 bg-slate-800 p-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span>Page</span>
                            <span className="font-semibold text-white">{page}</span>
                            <span>of</span>
                            <span className="font-semibold text-white">{totalPages}</span>
                            <span>({totalNotes} notes)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                className="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-400"
                            >
                                Prev
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                className="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-400"
                            >
                                Next
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <label htmlFor="limit" className="text-slate-300">Per page:</label>
                            <select
                                id="limit"
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}