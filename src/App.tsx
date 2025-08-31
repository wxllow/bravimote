import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Remote from './Remote';
import Setup from './Setup';
import { platform } from '@tauri-apps/plugin-os';

function Layout() {
    return (
        <>
            <div
                className={`text-white flex flex-col items-center justify-center p-4 ${
                    ['android', 'ios'].includes(platform()) ? 'mt-8' : ''
                }`}
            >
                <div className="flex items-center justify-center max-w-screen overflow-x-hidden">
                    <Outlet />
                </div>
            </div>
            <Toaster richColors />
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Setup />} />
                    <Route path="/remote" element={<Remote />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
