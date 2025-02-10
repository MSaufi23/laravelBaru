import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

const FilterSection = ({ filters, onFilterChange }) => {
    return (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Filter Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date From</label>
                    <input
                        type="date"
                        name="date_from"
                        value={filters.date_from || ''}
                        onChange={onFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Date To</label>
                    <input
                        type="date"
                        name="date_to"
                        value={filters.date_to || ''}
                        onChange={onFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={filters.location || ''}
                        onChange={onFilterChange}
                        placeholder="Search by location..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="status"
                        value={filters.status || ''}
                        onChange={onFilterChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="">All</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Min Price</label>
                    <input
                        type="number"
                        name="min_price"
                        value={filters.min_price || ''}
                        onChange={onFilterChange}
                        placeholder="Min price..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Max Price</label>
                    <input
                        type="number"
                        name="max_price"
                        value={filters.max_price || ''}
                        onChange={onFilterChange}
                        placeholder="Max price..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default function Index({ auth, events, filters }) {
    const [processing, setProcessing] = useState(false);
    const [currentFilters, setCurrentFilters] = useState(filters);

    const handleDelete = (eventId) => {
        if (confirm('Are you sure you want to delete this event?')) {
            setProcessing(true);
            router.delete(route('event-organizer.events.destroy', eventId), {
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...currentFilters, [name]: value };
        setCurrentFilters(newFilters);
        
        // Use Inertia to reload the page with new filters
        router.get(route('event-organizer.events.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        My Events
                    </h2>
                    <Link
                        href={route('event-organizer.events.create')}
                        className="rounded-md bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                    >
                        Create New Event
                    </Link>
                </div>
            }
        >
            <Head title="My Events" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <FilterSection 
                                filters={currentFilters} 
                                onFilterChange={handleFilterChange} 
                            />

                            {events.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="text-lg text-gray-500">You haven't created any events yet.</p>
                                    <Link
                                        href={route('event-organizer.events.create')}
                                        className="mt-4 inline-block rounded-md bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                                    >
                                        Create Your First Event
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Event Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Location
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Registered Users
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {events.map((event) => (
                                                <tr key={event.id}>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {event.title}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            {new Date(event.event_date).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            {event.location}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                                                            ${event.status === 'active' ? 'bg-green-100 text-green-800' : 
                                                              event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                                              'bg-red-100 text-red-800'}`}>
                                                            {event.status}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            {event.registrations.length} / {event.capacity}
                                                            <Link
                                                                href={route('event-organizer.events.registrations', event.id)}
                                                                className="ml-2 text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                View Registrations
                                                            </Link>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium space-x-2">
                                                        <Link
                                                            href={route('event-organizer.events.show', event.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={route('event-organizer.events.edit', event.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(event.id)}
                                                            disabled={processing}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 