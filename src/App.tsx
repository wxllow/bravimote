import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import Remote from './Remote';
import Setup from './Setup';

function Layout() {
    return (
        <div className="text-white flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
                <Outlet />
            </div>
        </div>
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
