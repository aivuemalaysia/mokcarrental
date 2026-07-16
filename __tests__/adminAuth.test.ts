import { isValidAdminCredentials, getAdminAuthDebugInfo } from '@/lib/adminAuth';
import { createAdminSessionToken, verifyAdminSessionToken } from '@/lib/adminSession';

describe('Admin Authentication', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.ADMIN_PASSWORD_SALT;
    delete process.env.ADMIN_PASSWORD_ITERATIONS;
  });

  describe('isValidAdminCredentials', () => {
    it('should reject incorrect email', async () => {
      const result = await isValidAdminCredentials('wrong@email.com', 'password');
      expect(result).toBe(false);
    });

    it('should reject empty password', async () => {
      const result = await isValidAdminCredentials('admin@mokcarrental.com', '');
      expect(result).toBe(false);
    });

    it('should use PBKDF2 when hash is configured', async () => {
      process.env.ADMIN_PASSWORD_HASH = 'test_hash';
      process.env.ADMIN_PASSWORD_SALT = 'test_salt';
      process.env.ADMIN_PASSWORD_ITERATIONS = '1000';
      
      // This should not fall back to plain text comparison
      const result = await isValidAdminCredentials('admin@mokcarrental.com', 'any_password');
      expect(result).toBe(false);
    });
  });

  describe('getAdminAuthDebugInfo', () => {
    it('should return missing mode when no auth configured', () => {
      const info = getAdminAuthDebugInfo();
      expect(info.mode).toBe('missing');
    });

    it('should return pbkdf2 mode when hash and salt are set', () => {
      process.env.ADMIN_PASSWORD_HASH = 'test_hash';
      process.env.ADMIN_PASSWORD_SALT = 'test_salt';
      const info = getAdminAuthDebugInfo();
      expect(info.mode).toBe('pbkdf2');
    });
  });

  describe('Session Token', () => {
    it('should create and verify a session token', async () => {
      const token = await createAdminSessionToken('admin@mokcarrental.com');
      const result = await verifyAdminSessionToken(token);
      expect(result.ok).toBe(true);
      expect(result.email).toBe('admin@mokcarrental.com');
    });

    it('should reject tampered tokens', async () => {
      const token = await createAdminSessionToken('admin@mokcarrental.com');
      const tampered = token + 'tampered';
      const result = await verifyAdminSessionToken(tampered);
      expect(result.ok).toBe(false);
    });
  });
});
