// src/app/dashboard/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function DashboardPage() {
    const [notes, setNotes] = useState([]);
    const [user, setUser] = useState(null);
    const [planInfo, setPlanInfo] = useState({ plan: '', count: 0 });
    const [error, setError] = useState('');
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const router = useRouter();

    const fetchNotes = async (token) => {
        try {
            const res = await fetch('/api/notes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch notes');
            const data = await res.json();
            setNotes(data.notes);
            setPlanInfo({ plan: data.subscriptionPlan, count: data.noteCount });
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
            return;
        }
        try {
            const decoded = jwtDecode(token);
            setUser(decoded);
            fetchNotes(token);
        } catch (error) {
            localStorage.removeItem('token');
            router.push('/');
        }
    }, [router]);

    const handleCreateNote = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newNote),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create note');
            }
            setNewNote({ title: '', content: '' });
            fetchNotes(token); // Refresh notes list
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteNote = async (noteId) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotes(token); // Refresh notes list
        } catch (err) {
            setError('Failed to delete note');
        }
    };

    const handleUpgrade = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/tenants/${user.tenantSlug}/upgrade`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to upgrade');
            fetchNotes(token); // Refresh to show updated plan status
            setError('');
        } catch (err) {
            setError('Upgrade failed. Only admins can upgrade.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    const canCreateNote = planInfo.plan === 'pro' || planInfo.count < 3;

    if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-4xl px-4 mx-auto">
                    <div className="flex justify-between items-center py-3">
                        <h1 className="text-xl font-bold text-indigo-600">SaaS Notes</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{user.email} ({user.role})</span>
                            <button onClick={handleLogout} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl p-4 mx-auto mt-6">
                {error && <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md">{error}</div>}
                
                {/* Subscription Banner */}
                {planInfo.plan === 'free' && (
                    <div className="p-4 mb-6 text-center text-blue-800 bg-blue-100 rounded-lg">
                        You are on the <span className="font-bold">Free Plan</span> ({planInfo.count}/3 notes used).
                        {user.role === 'admin' && (
                            <button onClick={handleUpgrade} className="ml-4 px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600">
                                Upgrade to Pro
                            </button>
                        )}
                    </div>
                )}
                
                {/* Create Note Form */}
                {canCreateNote ? (
                    <div className="p-6 mb-8 bg-white rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-800">Create a New Note</h2>
                        <form onSubmit={handleCreateNote} className="mt-4 space-y-4">
                            <input
                                type="text"
                                placeholder="Note Title"
                                value={newNote.title}
                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                            <textarea
                                placeholder="Note Content"
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                rows="3"
                                required
                            ></textarea>
                            <button type="submit" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Add Note</button>
                        </form>
                    </div>
                ) : (
                    <div className="p-6 mb-8 text-center bg-white rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-800">Note Limit Reached</h2>
                        <p className="mt-2 text-gray-600">Please upgrade to the Pro plan to add more notes.</p>
                    </div>
                )}

                {/* Notes List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Your Notes</h2>
                    {notes.length > 0 ? (
                        notes.map(note => (
                            <div key={note._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                                <div>
                                    <h3 className="font-bold text-gray-900">{note.title}</h3>
                                    <p className="text-gray-600">{note.content}</p>
                                </div>
                                <button onClick={() => handleDeleteNote(note._id)} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200">Delete</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No notes found. Create your first one!</p>
                    )}
                </div>
            </main>
        </div>
    );
}