"use client";

import CopyClient from "./CopyClient";

export default function CopiesPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">Copies du livre</h1>
            <CopyClient />
        </div>
    );
}
