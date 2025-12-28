import { Suspense } from "react";
import ConfirmPasswordClient from "./ConfirmPasswordClient";

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>}>
            <ConfirmPasswordClient />
        </Suspense>
    );
}
