export function createPresencePoller({ getNames, check, onResult, intervalMs = 30000, isVisible = () => true,}) {
    let timer = null;
    let stopped = true;
    let running = false;
    let cycle = 0;

    const refresh = async () => {
        if (stopped || running || !isVisible()) return;

        running = true;
        const thisCycle = cycle;

        try {
            for (const name of getNames()) {
                if (stopped || thisCycle !== cycle) break;
                try {
                    onResult(name, await check(name));
                } catch (err) {
                    if (err?.authRequired) break;
                }
            }
        } finally {
            running = false;
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
            clearInterval(timer);
            timer = null;
        },
        refresh,
    };
}