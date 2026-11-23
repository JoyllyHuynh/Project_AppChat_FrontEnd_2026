import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { presenceUpdated } from "../presenceSlice";
import { createPresencePoller } from "../services/presencePoller";
import presenceService from "../services/presenceService";

export default function usePresence(names) {
    const dispatch = useDispatch();
    const namesRef = useRef(names);
    const pollerRef = useRef(null);

    useEffect(() => {
        namesRef.current = names;
    }, [names]);

    useEffect(() => {
        const poller = createPresencePoller({
            getNames: () => namesRef.current,
            check: (name) => presenceService.checkUserOnline(name),
            onResult: (name, online) => dispatch(presenceUpdated({ name, online })),
            isVisible: () => document.visibilityState === "visible",
        });
        pollerRef.current = poller;
        poller.start();

        const handleVisibility = () => {
            if (document.visibilityState === "visible") poller.refresh();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            poller.stop();
            pollerRef.current = null;
        };
    }, [dispatch]);

    const key = names.join("|");
    useEffect(() => {
        pollerRef.current?.refresh();
    }, [key]);
}