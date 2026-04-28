/**
 * Thin wrapper that embeds the Journey Builder inside the Segment Builder.
 * Uses MemoryRouter so Journey routing is self-contained (no URL pollution).
 * EmbeddedContext=true suppresses redundant headers inside the journey pages.
 */
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { EmbeddedContext }   from '@journey/contexts/embedded-context';
import { JourneyListPage }   from '@journey/components/journey-list/journey-list-page';
import { JourneyCanvasPage } from '@journey/components/canvas/journey-canvas-page';

export function JourneyApp() {
  return (
    <EmbeddedContext value={true}>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <MemoryRouter initialEntries={['/journeys']}>
          <Routes>
            <Route path="/journeys"             element={<JourneyListPage />} />
            <Route path="/journeys/:id/builder" element={<JourneyCanvasPage />} />
            <Route path="*"                     element={<Navigate to="/journeys" replace />} />
          </Routes>
        </MemoryRouter>
        <Toaster position="top-right" richColors closeButton />
      </div>
    </EmbeddedContext>
  );
}
