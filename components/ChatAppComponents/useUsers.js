import { getActiveInactiveUsers } from "@/services/auth/Auth.services";
import { useEffect, useState } from "react";

/**
 * Fetches the chat user roster from the API.
 *
 * Expected response shape:
 *   GET /api/users  →  [{ id, name, color }, ...]
 *
 * @returns {{ users: Array, loading: boolean, error: string|null }}
 */
export function useUsers() {
    const [users, setUsers] = useState([]);
    const [inActiveUsers, setInactiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function fetchUsers() {
            try {
                const res = await getActiveInactiveUsers();
                if (!cancelled) {
                    setUsers(res?.data?.active || []);
                    setInactiveUsers(res?.data?.inactiveUsers
                        || [])
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        const interval = setInterval(fetchUsers, 300);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };

    }, []);

    return { users, loading, error, inActiveUsers };
}