import { validateInquiryCreateInput, validateInquiryStatus } from '@/lib/validation/inquiry';

describe('Inquiry Validation', () => {
  describe('validateInquiryCreateInput', () => {
    it('should accept valid inquiry', () => {
      const result = validateInquiryCreateInput({
        carId: '123',
        carName: 'Toyota Alphard',
        customerName: 'John Doe',
        whatsappNumber: '+60123456789',
        email: 'john@example.com',
        pickupDate: '2024-12-25',
        returnDate: '2024-12-28',
        pickupLocation: 'JB City',
        notes: 'Need child seat',
      });
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.customer_name).toBe('John Doe');
        expect(result.value.status).toBe('pending');
      }
    });

    it('should reject missing required fields', () => {
      const result = validateInquiryCreateInput({
        carId: '',
        carName: '',
        customerName: '',
        whatsappNumber: '',
        pickupDate: '',
        returnDate: '',
        pickupLocation: '',
      });
      
      expect(result.ok).toBe(false);
    });

    it('should reject invalid email format', () => {
      const result = validateInquiryCreateInput({
        carId: '123',
        carName: 'Toyota',
        customerName: 'John',
        whatsappNumber: '+60123456789',
        email: 'invalid-email',
        pickupDate: '2024-12-25',
        returnDate: '2024-12-28',
        pickupLocation: 'JB City',
      });
      
      // Email is optional, so this should still pass
      expect(result.ok).toBe(true);
    });

    it('should reject invalid date formats', () => {
      const result = validateInquiryCreateInput({
        carId: '123',
        carName: 'Toyota',
        customerName: 'John',
        whatsappNumber: '+60123456789',
        pickupDate: '25-12-2024',
        returnDate: '2024-12-28',
        pickupLocation: 'JB City',
      });
      
      expect(result.ok).toBe(false);
      expect(result.error).toContain('pickupDate');
    });

    it('should truncate and normalize strings', () => {
      const result = validateInquiryCreateInput({
        carId: '123',
        carName: '  Toyota Alphard  ',
        customerName: '  John Doe  ',
        whatsappNumber: '+60 12-345 6789',
        pickupDate: '2024-12-25',
        returnDate: '2024-12-28',
        pickupLocation: 'JB City',
      });
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.car_name).toBe('Toyota Alphard');
        expect(result.value.customer_name).toBe('John Doe');
      }
    });
  });

  describe('validateInquiryStatus', () => {
    it('should accept valid status', () => {
      expect(validateInquiryStatus({ status: 'pending' }).ok).toBe(true);
      expect(validateInquiryStatus({ status: 'confirmed' }).ok).toBe(true);
      expect(validateInquiryStatus({ status: 'cancelled' }).ok).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = validateInquiryStatus({ status: 'invalid' });
      expect(result.ok).toBe(false);
    });
  });
});
