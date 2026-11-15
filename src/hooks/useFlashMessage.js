import { useCallback, useEffect, useState } from 'react';

export default function useFlashMessage(duration = 4000) {
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!message) return undefined;
        const timer = setTimeout(() => setMessage(null), duration);
        return () => clearTimeout(timer);
    }, [message, duration]);

    const show = useCallback((type, text) => setMessage({ type, text }), []);
    const clear = useCallback(() => setMessage(null), []);

    return { message, show, clear };
}