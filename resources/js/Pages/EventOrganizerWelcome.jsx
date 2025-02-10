import { Link, Head } from '@inertiajs/react';

export default function EventOrganizerWelcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Event Organizer Welcome" />
            <div className="min-h-screen" style={{ backgroundColor: '#0A1017' }}>
                <div className="relative">
                    {/* Navigation */}
                    <nav className="p-6 flex justify-end">
                        {auth.user && (
                            <Link
                                href={route('event-organizer.dashboard')}
                                className="text-white hover:text-gray-300 px-4 py-2 rounded-md transition"
                            >
                                Dashboard
                            </Link>
                        )}
                    </nav>

                    {/* Main Content */}
                    <main className="flex flex-col items-center justify-center min-h-[80vh]">
                        <h1 
                            className="text-6xl font-bold mb-8" 
                            style={{ color: '#27A13C' }}
                        >
                            Welcome Event Organizer
                        </h1>

                        <div className="max-w-3xl text-center">
                            <p className="text-gray-400 text-xl mb-8">
                                Create and manage your events with our powerful tools
                            </p>
                            
                            <div className="flex gap-4 justify-center">
                                <Link
                                    href={route('event-organizer.login')}
                                    className="px-8 py-3 rounded-lg text-white text-lg transition"
                                    style={{ 
                                        backgroundColor: '#27A13C',
                                        hover: {
                                            backgroundColor: '#218A32'
                                        }
                                    }}
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('event-organizer.register')}
                                    className="px-8 py-3 rounded-lg text-white text-lg border-2 transition hover:bg-white/10"
                                    style={{ borderColor: '#27A13C' }}
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="absolute bottom-0 w-full py-6 text-center text-gray-400">
                        <p>Event Management System v{laravelVersion} (PHP v{phpVersion})</p>
                    </footer>
                </div>
            </div>
        </>
    );
} 