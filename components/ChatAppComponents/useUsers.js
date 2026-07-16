import { getActiveInactiveUsers } from "@/services/auth/Auth.services";
import { useEffect, useRef, useState, useCallback } from "react";

const BASE_INTERVAL_MS = 30_000; // roster refresh cadence — NOT a presence poll
const MAX_BACKOFF_MS = 5 * 60_000;

/**
 * Fetches the chat user roster from the API.
 *
 * Expected response shape:
 *   GET /api/users  →  { data: { active: [...], inactiveUsers: [...] } }
 *
 * Polls on a slow cadence (default 30s) purely to catch roster changes
 * (new hires, deactivated accounts) — NOT for live online/offline status,
 * which should come from socket presence events instead.
 *
 * @returns {{ users: Array, inActiveUsers: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export function useUsers({ pollInterval = BASE_INTERVAL_MS } = {}) {
    const [users, setUsers] = useState([]);
    const [inActiveUsers, setInactiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const timeoutRef = useRef(null);
    const abortRef = useRef(null);
    const failCountRef = useRef(0);
    const mountedRef = useRef(true);

    const fetchUsers = useCallback(async ({ isBackground = false } = {}) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await getActiveInactiveUsers({ signal: controller.signal });
            if (!mountedRef.current || controller.signal.aborted) return;

            setUsers(res?.data?.active || []);
            setInactiveUsers(res?.data?.inactiveUsers || []);
            setError(null);
            failCountRef.current = 0;
        } catch (err) {
            if (controller.signal.aborted) return;
            if (mountedRef.current) {
                setError(err.message || "Failed to load users");
                failCountRef.current += 1;
            }
        } finally {
            if (mountedRef.current && !isBackground) setLoading(false);
            scheduleNext();
        }
    }, []);

    function scheduleNext() {
        if (!mountedRef.current) return;
        clearTimeout(timeoutRef.current);

        // Exponential backoff on repeated failures, capped at MAX_BACKOFF_MS
        const backoffMultiplier = Math.min(2 ** failCountRef.current, MAX_BACKOFF_MS / pollInterval);
        const delay = document.hidden
            ? pollInterval * 4          // ease off while tab is backgrounded
            : pollInterval * backoffMultiplier;

        timeoutRef.current = setTimeout(() => fetchUsers({ isBackground: true }), delay);
    }

    const refetch = useCallback(() => {
        clearTimeout(timeoutRef.current);
        fetchUsers({ isBackground: true });
    }, [fetchUsers]);

    useEffect(() => {
        mountedRef.current = true;
        fetchUsers(); 

        function onVisibilityChange() {
            if (!document.hidden) refetch(); // refresh right away when tab regains focus
        }
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            mountedRef.current = false;
            clearTimeout(timeoutRef.current);
            abortRef.current?.abort();
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [fetchUsers, refetch]);

    return { users, inActiveUsers, loading, error, refetch };
}