"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_ERRORS = ["Relogin is required", "Invalid Compact JWS"];

function handleApiError(error: any, router: any) {
    if (AUTH_ERRORS.some((msg) => error?.message?.includes(msg))) {
        localStorage.clear();
        router.replace("/login");
        router.refresh();
    }
}

async function fetchWithAuthCheck(input: RequestInfo, init?: RequestInit, router?: any) {
    const token = localStorage.getItem("auth_token");

    if (!token) {
        router?.replace("/login");
        return Promise.reject(new Error("No auth token found"));
    }

    const response = await fetch(input, init);

    if (!response.ok) {
        try {
            const error = await response.json();
            handleApiError(error, router);
            return Promise.reject(error);
        } catch (parseError) {
            console.error("Unhandled API error:", parseError);
            return Promise.reject(parseError);
        }
    }

    return response;
}

export function useApiErrorHandler() {
    const router = useRouter();

    useEffect(() => {
        if (!localStorage.getItem("auth_token")) {
            router.replace("/login");
        }
    }, [router]);

    return (input: RequestInfo, init?: RequestInit) => fetchWithAuthCheck(input, init, router);
}

export function DisconnectAfterRevocationWrapper({ children }: { children: React.ReactNode }) {
    useApiErrorHandler();
    return <>{children}</>;
}