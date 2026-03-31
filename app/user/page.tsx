"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";

export default function UserPage() {
    useAuth("user");

    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchNotes = async () => {
        const res = await fetch("/api/notes", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        setNotes(data.notes || []);
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

        fetchNotes();
    };

    const deleteNote = async (id: string) => {
        await fetch(`/api/notes/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        fetchNotes();
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="rounded-2xl bg-indigo-500/20 p-6 backdrop-blur border border-indigo-200/20">
                    <h1 className="text-2xl font-bold">User Dashboard</h1>
                    <p className="mt-1 text-sm text-indigo-100/90">
                        Personal notes workflow with secure access.
                    </p>
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
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-100">{note.title}</h3>
                                            <p className="mt-1 text-sm text-slate-300">{note.content}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteNote(note._id)}
                                            className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-rose-400"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </section>
            </div>
        </div>
    );
}