<?php

namespace App\Http\Controllers\EventOrganizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::where('organizer_id', Auth::id());

        // Date filtering
        if ($request->has('date_from')) {
            $query->whereDate('event_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('event_date', '<=', $request->date_to);
        }

        // Location/region filtering
        if ($request->has('location')) {
            $query->where(function($q) use ($request) {
                $q->where('location', 'like', '%' . $request->location . '%')
                  ->orWhere('city', 'like', '%' . $request->location . '%')
                  ->orWhere('state', 'like', '%' . $request->location . '%');
            });
        }

        // Status filtering
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Price range filtering
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Get the filtered events with registrations
        $events = $query->with(['registrations' => function($query) {
            $query->where('status', 'registered')
                ->with('user');
        }])
        ->orderBy('event_date', 'asc')
        ->get();
        
        return Inertia::render('EventOrganizer/Events/Index', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'events' => $events,
            'filters' => [
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'location' => $request->location,
                'status' => $request->status,
                'min_price' => $request->min_price,
                'max_price' => $request->max_price,
            ]
        ]);
    }

    public function show(Event $event)
    {
        // Check if the event belongs to the authenticated organizer
        if ($event->organizer_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('EventOrganizer/Events/Show', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'event' => $event
        ]);
    }

    public function edit(Event $event)
    {
        // Check if the event belongs to the authenticated organizer
        if ($event->organizer_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('EventOrganizer/Events/Edit', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'event' => $event
        ]);
    }

    public function update(Request $request, Event $event)
    {
        // Check if the event belongs to the authenticated organizer
        if ($event->organizer_id !== Auth::id()) {
            abort(403);
        }

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'event_date' => 'required|date',
                'location' => 'required|string|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'capacity' => 'required|integer|min:1',
                'status' => 'required|in:draft,active,inactive',
                'is_paid' => 'required|boolean',
                'price' => 'required_if:is_paid,true|nullable|numeric|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            $eventData = [
                'title' => $validated['title'],
                'description' => $validated['description'],
                'event_date' => $validated['event_date'],
                'location' => $validated['location'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'capacity' => $validated['capacity'],
                'status' => $validated['status'],
                'is_paid' => $validated['is_paid'],
                'price' => $validated['is_paid'] ? $validated['price'] : null,
            ];

            if ($request->hasFile('image')) {
                Log::info('Image upload attempted');
                $path = $request->file('image')->store('event-images', 'public');
                Log::info('Image stored at: ' . $path);
                $eventData['image'] = $path;
            }

            $event->update($eventData);

            return redirect()->route('event-organizer.events.show', $event->id)
                ->with('success', 'Event updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update event. ' . $e->getMessage()]);
        }
    }

    public function destroy(Event $event)
    {
        // Check if the event belongs to the authenticated organizer
        if ($event->organizer_id !== Auth::id()) {
            abort(403);
        }

        $event->delete();

        return redirect()->route('event-organizer.events.index')
            ->with('success', 'Event deleted successfully.');
    }

    public function create()
    {
        return Inertia::render('EventOrganizer/Events/Create', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'event_date' => 'required|date',
                'location' => 'required|string|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'capacity' => 'required|integer|min:1',
                'is_paid' => 'required|boolean',
                'price' => 'required_if:is_paid,true|nullable|numeric|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            $eventData = [
                'organizer_id' => Auth::id(),
                'title' => $validated['title'],
                'description' => $validated['description'],
                'event_date' => $validated['event_date'],
                'location' => $validated['location'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'capacity' => $validated['capacity'],
                'is_paid' => $validated['is_paid'],
                'price' => $validated['is_paid'] ? $validated['price'] : null,
                'status' => 'draft'
            ];

            if ($request->hasFile('image')) {
                Log::info('Image upload attempted');
                $path = $request->file('image')->store('event-images', 'public');
                Log::info('Image stored at: ' . $path);
                $eventData['image'] = $path;
            }

            $event = Event::create($eventData);

            return to_route('event-organizer.dashboard');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create event. ' . $e->getMessage()]);
        }
    }

    public function dashboard()
    {
        $events = Event::where('organizer_id', Auth::id())
            ->with(['registrations' => function($query) {
                $query->where('status', 'registered')
                    ->with('user');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('EventOrganizer/Dashboard', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'eventStats' => [
                'events' => $events,
            ],
        ]);
    }

    public function showRegistrations(Event $event)
    {
        // Check if the event belongs to the authenticated organizer
        if ($event->organizer_id !== Auth::id()) {
            abort(403);
        }

        $event->load(['registrations' => function($query) {
            $query->where('status', 'registered')
                ->with('user');
        }]);

        return Inertia::render('EventOrganizer/Events/Registrations', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'event' => $event
        ]);
    }
} 