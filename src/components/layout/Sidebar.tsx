import { LayoutDashboard, Users, FolderKanban, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Consultants', path: '/consultants' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 z-50">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">I</span>
                    </div>
                    <span className="text-white font-semibold text-lg tracking-tight">IBC Analytics</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                                isActive
                                    ? 'bg-indigo-600/10 text-indigo-400 font-medium'
                                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                            )
                        }
                    >
                        <item.icon
                            size={20}
                            className="group-hover:scale-110 transition-transform duration-200"
                        />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-gray-800">
                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
