import { useEffect, useState } from "react";
import authService from "../services/authService";
import useDebounce from "../../../hooks/useDebounce";
import { isUsername } from "../../../utils/validators";

export const resolveAvailability = ({ name, debouncedName, result, canCheck }) => {
    if (!canCheck || !name || !isUsername(name)) return "idle";
    if (debouncedName !== name) return "checking";
    if (result.name === name) return result.status;
    return "checking";
};

export default function useUsernameAvailability(username) {
    const name = username.trim();
    const debouncedName = useDebounce(name, 500);
    const [result, setResult] = useState({ name: "", status: "idle" });

    const canCheck = typeof authService.checkUsernameAvailable === "function";

    useEffect(() => {
        if (!canCheck || !debouncedName || !isUsername(debouncedName)) return undefined;
        let cancelled = false;

        authService
            .checkUsernameAvailable(debouncedName)
            .then((available) => {
                if (!cancelled) {
                    setResult({ name: debouncedName, status: available ? "available" : "taken" });
                }
            })
            .catch(() => {
                if (!cancelled) setResult({ name: debouncedName, status: "unknown" });
            });

        return () => {
            cancelled = true;
        };
    }, [debouncedName, canCheck]);

    return resolveAvailability({ name, debouncedName, result, canCheck });
}