import * as mock from './authMockService';
import * as api from './authApi';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export default useMock ? mock : api;