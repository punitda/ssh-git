export default function fetchReducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, isError: false };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        data: action.payload,
        isError: false,
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, isError: true };
    case 'FETCH_RESET':
      return { ...state, isLoading: false, isError: false, data: null };
    default:
      throw new Error(`Invalid action.type: ${action.type}`);
  }
}
