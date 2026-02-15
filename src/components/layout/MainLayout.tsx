import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
            <Sidebar />
            <main className="pl-64 min-h-screen transition-all duration-300">
                <div className="max-w-7xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
