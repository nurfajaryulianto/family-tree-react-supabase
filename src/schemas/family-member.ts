import { z } from 'zod';

export const familyMemberSchema = z.object({
  firstName: z.string()
    .min(1, 'Nama depan harus diisi')
    .max(50, 'Nama depan maksimal 50 karakter')
    .regex(/^[a-zA-Z\s'-]+$/, 'Nama depan hanya boleh mengandung huruf, spasi, tanda hubung, dan apostrof'),

  lastName: z.string()
    .min(1, 'Nama belakang harus diisi')
    .max(50, 'Nama belakang maksimal 50 karakter')
    .regex(/^[a-zA-Z\s'-]+$/, 'Nama belakang hanya boleh mengandung huruf, spasi, tanda hubung, dan apostrof'),

  nickname: z.string()
    .max(30, 'Nama panggilan maksimal 30 karakter')
    .optional()
    .or(z.literal('')),

  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Jenis kelamin harus dipilih',
    invalid_type_error: 'Jenis kelamin tidak valid'
  }),

  birthDate: z.string({
    required_error: 'Tanggal lahir harus diisi'
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid').optional(),

  birthPlace: z.string()
    .max(100, 'Tempat lahir maksimal 100 karakter')
    .optional()
    .or(z.literal('')),

  isLiving: z.boolean(),

  deathDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid')
    .optional()
    .or(z.literal('')),

  deathPlace: z.string()
    .max(100, 'Tempat meninggal maksimal 100 karakter')
    .optional()
    .or(z.literal('')),

  biography: z.string()
    .max(1000, 'Biografi maksimal 1000 karakter')
    .optional()
    .or(z.literal('')),

  avatar: z.string().url().optional().or(z.literal('')),

  email: z.string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),

  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Format nomor telepon tidak valid')
    .max(20, 'Nomor telepon maksimal 20 digit')
    .optional()
    .or(z.literal('')),

  occupation: z.string()
    .max(100, 'Pekerjaan maksimal 100 karakter')
    .optional()
    .or(z.literal('')),

  education: z.string()
    .max(100, 'Pendidikan maksimal 100 karakter')
    .optional()
    .or(z.literal(''))
}).refine((data) => {
  // If isLiving is false, deathDate is required
  if (!data.isLiving && !data.deathDate) {
    return false;
  }
  return true;
}, {
  message: 'Tanggal meninggal harus diisi jika status meninggal',
  path: ['deathDate']
}).refine((data) => {
  // Death date should be after birth date
  if (data.birthDate && data.deathDate) {
    const birth = new Date(data.birthDate);
    const death = new Date(data.deathDate);
    return death > birth;
  }
  return true;
}, {
  message: 'Tanggal meninggal harus setelah tanggal lahir',
  path: ['deathDate']
}).refine((data) => {
  // Birth date should not be in the future
  if (data.birthDate) {
    const birth = new Date(data.birthDate);
    const today = new Date();
    return birth <= today;
  }
  return true;
}, {
  message: 'Tanggal lahir tidak boleh di masa depan',
  path: ['birthDate']
});

export type FamilyMemberForm = z.infer<typeof familyMemberSchema>;