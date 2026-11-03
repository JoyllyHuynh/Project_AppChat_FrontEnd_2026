import * as mock from './authMockService';
import * as socket from './authSocketApi';

const mode = import.meta.env.VITE_API_MODE || 'mock';

export default mode === 'socket' ? socket : mock;