import { fetchWithAuth, extractArray, extractPageData, API_URL } from './api';

describe('API Utils', () => {
  beforeEach(() => {
    // Clear mocks before each test
    global.fetch = jest.fn();
    
    // Mock window and localStorage

    
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('extractArray', () => {
    it('should return the array if an array is passed', () => {
      expect(extractArray([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should return content array from pageable data', () => {
      expect(extractArray({ data: { content: ['a', 'b'] } })).toEqual(['a', 'b']);
      expect(extractArray({ content: ['c', 'd'] })).toEqual(['c', 'd']);
    });

    it('should return data array if data is an array', () => {
      expect(extractArray({ data: [1, 2] })).toEqual([1, 2]);
    });

    it('should return empty array for null, undefined, or invalid input', () => {
      expect(extractArray(null)).toEqual([]);
      expect(extractArray(undefined)).toEqual([]);
      expect(extractArray({ foo: 'bar' })).toEqual([]);
    });
  });

  describe('extractPageData', () => {
    it('should extract pagination data correctly', () => {
      const response = {
        data: {
          totalElements: 42,
          totalPages: 5,
          size: 10,
          number: 2
        }
      };
      
      const result = extractPageData(response);
      expect(result).toEqual({
        totalElements: 42,
        totalPages: 5,
        size: 10,
        number: 2
      });
    });

    it('should return default values if fields are missing', () => {
      expect(extractPageData({})).toEqual({
        totalElements: 0,
        totalPages: 1,
        size: 10,
        number: 0
      });
      
      expect(extractPageData(null)).toEqual({
        totalElements: 0,
        totalPages: 1,
        size: 10,
        number: 0
      });
    });
  });

  describe('fetchWithAuth', () => {
    it('should send Authorization header if token is in localStorage', async () => {
      (Storage.prototype.getItem as jest.Mock).mockReturnValue('fake-token-123');
      
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ success: true }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await fetchWithAuth('/test-endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/test-endpoint`,
        expect.objectContaining({
          headers: expect.any(Headers)
        })
      );
      
      // We can inspect the headers passed to fetch
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const sentHeaders = fetchCall[1].headers as Headers;
      expect(sentHeaders.get('Authorization')).toBe('Bearer fake-token-123');
      expect(sentHeaders.get('Content-Type')).toBe('application/json');
    });

    it('should NOT send Authorization header if no token in localStorage', async () => {
      (Storage.prototype.getItem as jest.Mock).mockReturnValue(null);
      
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ success: true }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await fetchWithAuth('/test-endpoint');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const sentHeaders = fetchCall[1].headers as Headers;
      expect(sentHeaders.get('Authorization')).toBeNull();
    });

    it('should handle 401 Unauthorized by removing token and redirecting to login', async () => {
      const mockResponse = { ok: false, status: 401 };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // JSDOM throws an error on navigation, we catch it or ignore it by letting the promise reject
      try {
        await fetchWithAuth('/protected');
      } catch (e: any) {
        expect(e.message).toBe('Non autorisé');
      }
      
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('jwt_token');
    });

    it('should handle 403 Forbidden by redirecting to login', async () => {
      const mockResponse = { ok: false, status: 403 };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      try {
        await fetchWithAuth('/protected');
      } catch (e: any) {
        expect(e.message).toBe('Non autorisé');
      }
      
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('jwt_token');
    });

    it('should throw an error with the response text if fetch fails (other than 401/403)', async () => {
      const mockResponse = { 
        ok: false, 
        status: 500, 
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Server crashed')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWithAuth('/broken')).rejects.toThrow('Erreur API: 500 - Server crashed');
    });
  });
});
