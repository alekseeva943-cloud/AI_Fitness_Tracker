export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RequestState {
  status: RequestStatus;
  error: string | null;
  lastUpdated?: number;
}

export const INITIAL_REQUEST_STATE: RequestState = {
  status: 'idle',
  error: null,
};
