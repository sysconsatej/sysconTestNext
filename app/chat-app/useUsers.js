import { fetchReportData } from "@/services/auth/FormControl.services";
import { useEffect, useState } from "react";

/**
 * Fetches the chat user roster from the API.
 *
 * Expected response shape:
 *   GET /api/users  →  [{ id, name, color }, ...]
 *
 * @returns {{ users: Array, loading: boolean, error: string|null }}
 */
export function useUsers({ clientId }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchUsers() {
            try {

                const queryObj = {
                    clientIdCondition: 'status = 1 FOR JSON PATH',
                    columns:
                        'u.id, u.name as name, u.profilePhoto as avatar',
                    tableName: 'tblUser u',
                    whereCondition: `clientId = ${clientId}`,
                }

                const res = await fetchReportData(queryObj);
                if (!cancelled) setUsers(res.data || []);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchUsers();
        return () => { cancelled = true; };
    }, [clientId]);

    return { users, loading, error };
}