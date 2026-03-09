import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { AppState } from 'react-native';
import { useLocationPermission } from '../useLocationPermission';
import { useLocationPrivacy } from '../useLocationPrivacy';

// Mock axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    })),
  },
}));

// Mock API client
jest.mock('../../../../services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock dependencies
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
}));
jest.mock('../useLocationPrivacy');
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

describe('useLocationPermission', () => {
  const mockEnableGhostMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocationPrivacy as jest.Mock).mockReturnValue({
      enableGhostMode: mockEnableGhostMode,
    });
  });

  it('should check permission on mount', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });

    const { result } = renderHook(() => useLocationPermission());

    await waitFor(() => {
      expect(result.current.permissionStatus).toBe(Location.PermissionStatus.GRANTED);
    });

    expect(Location.getForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('should enable ghost mode when permission denied', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
    });

    renderHook(() => useLocationPermission());

    await waitFor(() => {
      expect(mockEnableGhostMode).toHaveBeenCalled();
    });
  });

  it('should not enable ghost mode when permission granted', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });

    renderHook(() => useLocationPermission());

    await waitFor(() => {
      expect(mockEnableGhostMode).not.toHaveBeenCalled();
    });
  });

  it('should request permission', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });

    const { result } = renderHook(() => useLocationPermission());

    let status;
    await act(async () => {
      status = await result.current.requestPermission();
    });

    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(status).toBe(Location.PermissionStatus.GRANTED);
  });

  it('should enable ghost mode when request denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
    });

    const { result } = renderHook(() => useLocationPermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    await waitFor(() => {
      expect(mockEnableGhostMode).toHaveBeenCalled();
    });
  });

  it('should return isPermissionGranted correctly', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });

    const { result } = renderHook(() => useLocationPermission());

    await waitFor(() => {
      expect(result.current.isPermissionGranted).toBe(true);
    });
  });

  it('should return isPermissionGranted false when denied', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
    });

    const { result } = renderHook(() => useLocationPermission());

    await waitFor(() => {
      expect(result.current.isPermissionGranted).toBe(false);
    });
  });

  it('should set isChecking during permission check', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ status: Location.PermissionStatus.GRANTED }),
            100
          )
        )
    );

    const { result } = renderHook(() => useLocationPermission());

    expect(result.current.isChecking).toBe(true);

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });
  });

  it('should handle permission check error', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
      new Error('Permission error')
    );

    const { result } = renderHook(() => useLocationPermission());

    await waitFor(() => {
      expect(result.current.permissionStatus).toBeNull();
    });
  });

  it('should handle request permission error', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
      new Error('Request error')
    );

    const { result } = renderHook(() => useLocationPermission());

    let status;
    await act(async () => {
      status = await result.current.requestPermission();
    });

    expect(status).toBeNull();
  });
});
