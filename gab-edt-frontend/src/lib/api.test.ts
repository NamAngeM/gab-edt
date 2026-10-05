import { fetchWithAuth, extractArray, extractPageData, API_URL, ApiError } from './api';

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
    const okResponse = (body: unknown) => ({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    });

    it('calls the same-origin proxy and never sends a token from the browser', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(okResponse({ success: true }));

      const result = await fetchWithAuth('/test-endpoint', { method: 'POST', body: '{}' });

      expect(result).toEqual({ success: true });
      const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe(`${API_URL}/test-endpoint`);
      expect(API_URL).toBe('/api/backend');
      expect(init.credentials).toBe('same-origin');
      const sentHeaders = init.headers as Headers;
      expect(sentHeaders.get('Authorization')).toBeNull();
      expect(sentHeaders.get('Content-Type')).toBe('application/json');
      expect(Storage.prototype.getItem).not.toHaveBeenCalledWith('jwt_token');
    });

    it('returns null for an empty 204 response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 204, text: jest.fn() });

      await expect(fetchWithAuth('/rooms/1', { method: 'DELETE' })).resolves.toBeNull();
    });

    it('treats 401 as an expired session and clears the local profile', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 401 });

      await expect(fetchWithAuth('/protected')).rejects.toMatchObject({ status: 401 });
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('user_data');
    });

    it('treats 403 as access denied without logging the user out', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 403 });

      await expect(fetchWithAuth('/protected')).rejects.toBeInstanceOf(ApiError);
      expect(Storage.prototype.removeItem).not.toHaveBeenCalled();
    });

    it('surfaces the API error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 409,
        text: jest.fn().mockResolvedValue(JSON.stringify({ message: 'Conflit de salle' })),
      });

      await expect(fetchWithAuth('/schedule-events', { method: 'POST', body: '{}' })).rejects.toThrow('Conflit de salle');
    });
  });
});
