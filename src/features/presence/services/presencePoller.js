export function createPresencePoller({
    getNames,
    check,
    onResult,
    intervalMs = 30000,
    isVisible = () => true,
}) {
    let timer = null;
    let stopped = true;
    let running = false;
    let cycle = 0;
    let refreshPending = false;

    const refresh = async () => {
        if (stopped || !isVisible()) return;
        if (running) {
            refreshPending = true;
            return;
        }

        running = true;
        refreshPending = false;

        const thisCycle = cycle;
        try {
            const names = getNames();
            for (const name of names) {
                if (stopped || thisCycle !== cycle) break;
                try {
                    const online = await check(name);
                    onResult(name, online);
                } catch (err) {
                    if (err?.authRequired) break;

                    console.warn(
                        `[Presence] Tạm thời không thể kiểm tra ${name}:`,
                        err.message
                    );
                }
            }
        } finally {
            running = false;
            if (
                refreshPending &&
                !stopped &&
                isVisible()
            ) {
                refreshPending = false;
                refresh();
            }
        }
    };

    return {
        start() {
            if (!stopped) return;
            stopped = false;
            refresh();
            timer = setInterval(refresh, intervalMs);
        },
        stop() {
            stopped = true;
            cycle += 1;
            refreshPending = false;
            clearInterval(timer);
            timer = null;
        },
        refresh,
    };
}
