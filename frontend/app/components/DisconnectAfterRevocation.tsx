"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function handleApiError(error: any, router: any) {
    if (error?.message?.includes("Relogin is required") || error?.message?.includes("Invalid Compact JWS")) {
        localStorage.clear();
        router.replace("/login");
        router.refresh();

    }
}

export function useApiErrorHandler() {
    const router = useRouter();

    useEffect(() => {
        // ✅ Bloquer immédiatement si aucun token
        if (!localStorage.getItem("auth_token")) {
            router.replace("/login");
            return;
        }

        const handleFetchError = async (response: Response) => {
            if (!response.ok) {
                try {
                    const error = await response.json();
                    if (error?.message?.includes("Relogin is required")) {
                        localStorage.clear(); // ✅ Efface tout
                        router.replace("/login"); // ✅ Redirection forcée
                    }
                    throw error;
                } catch (err) {
                    console.error("Erreur API non gérée :", err);
                }
            }
            return response;
        };

        // Sauvegarder l'original fetch
        const originalFetch = window.fetch;

        // Remplacer fetch par une version qui gère les erreurs
        window.fetch = async (...args) => {
            if (!localStorage.getItem("auth_token")) {
                console.warn("Tentative de requête API sans token. Redirection forcée...");
                router.replace("/login");
                return Promise.reject("No auth token found");
            }

            const response = await originalFetch(...args);
            return handleFetchError(response);
        };

        // Nettoyage : Restaurer l'ancien fetch quand le composant est démonté
        return () => {
            window.fetch = originalFetch;
        };
    }, [router]);
}

export function DisconnectAfterRevocationWrapper({ children }: { children: React.ReactNode }) {
    useApiErrorHandler()
    return <>{children}</>
}
