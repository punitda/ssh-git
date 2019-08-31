export default function addKeyReducer(state, action) {
  switch (action.type) {
    case 'ASKING_PERMISSION':
      return {
        ...state,
        askingPermission: true,
        askingPermissionError: false,
      };
    case 'PERMISSION_SUCCESS':
      return {
        ...state,
        askingPermission: false,
        askingPermissionSuccess: true,
      };
    case 'PERMISSION_ERROR':
      return {
        ...state,
        askingPermission: false,
        askingPermissionError: true,
      };
    case 'ADDING_KEYS':
      return {
        ...state,
        askingPermissionSuccess: false,
        addingKeys: true,
        addingKeysError: false,
      };
    case 'ADD_KEYS_SUCCESS':
      return {
        ...state,
        addingKeys: false,
        addingKeysSuccess: true,
      };
    case 'ADD_KEYS_ERROR':
      return {
        ...state,
        addingKeys: false,
        addingKeysError: true,
      };
    default:
      throw new Error(`Invalid action.type: ${action.type}`);
  }
}
