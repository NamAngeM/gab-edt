import { loginSchema } from './page';

describe('Login Form Validation Schema', () => {
  it('should validate valid data correctly', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    };
    
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty email', () => {
    const invalidData = {
      email: '',
      password: 'password123'
    };
    
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Veuillez saisir votre identifiant.");
    }
  });

  it('should reject missing email', () => {
    const invalidData = {
      password: 'password123'
    };
    
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: ''
    };
    
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Veuillez saisir votre mot de passe.");
    }
  });

  it('should provide default value for rememberMe', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rememberMe).toBe(false);
    }
  });
});
