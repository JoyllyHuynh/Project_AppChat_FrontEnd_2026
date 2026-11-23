import * as mock from "./presenceMockService";
import * as socket from "./presenceSocketApi";

const mode = import.meta.env.VITE_API_MODE || "socket";

export default mode === "socket" ? socket : mock;