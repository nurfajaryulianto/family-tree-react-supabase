import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  FileText,
  Camera,
  Save,
  X,
  Plus,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { familyMemberSchema, FamilyMemberForm } from '@/schemas/family-member';
import { FamilyMember } from '@/types/family-tree';

interface AddMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: FamilyMemberForm) => Promise<void>;
  initialData?: Partial<FamilyMember>;
  relationToMember?: FamilyMember;
  relationType?: string;
}

export function AddMemberForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  relationToMember,
  relationType,
}: AddMemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<FamilyMemberForm>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      nickname: initialData?.nickname || '',
      gender: initialData?.gender || undefined,
      birthDate: initialData?.birthDate || '',
      birthPlace: initialData?.birthPlace || '',
      isLiving: initialData?.isLiving ?? true,
      deathDate: initialData?.deathDate || '',
      deathPlace: initialData?.deathPlace || '',
      biography: initialData?.biography || '',
      avatar: initialData?.avatar || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      occupation: initialData?.occupation || '',
      education: initialData?.education || '',
    },
  });

  const isLiving = watch('isLiving');
  const avatarUrl = watch('avatar');

  useEffect(() => {
    if (avatarUrl) {
      setAvatarPreview(avatarUrl);
    }
  }, [avatarUrl]);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: FamilyMemberForm) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      setAvatarPreview('');
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUrlChange = (url: string) => {
    setValue('avatar', url);
    setAvatarPreview(url);
  };

  const getRelationText = () => {
    if (!relationToMember || !relationType) return null;

    const relationMap: Record<string, string> = {
      'parent': `Orang Tua dari ${relationToMember.firstName} ${relationToMember.lastName}`,
      'child': `Anak dari ${relationToMember.firstName} ${relationToMember.lastName}`,
      'sibling': `Saudara dari ${relationToMember.firstName} ${relationToMember.lastName}`,
      'spouse': `Pasangan dari ${relationToMember.firstName} ${relationToMember.lastName}`,
    };

    return relationMap[relationType];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Form Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {initialData ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga'}
                </h2>
                {getRelationText() && (
                  <p className="text-blue-100 mt-1">{getRelationText()}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Informasi Dasar
                  </CardTitle>
                  <CardDescription>
                    Informasi identitas utama anggota keluarga
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nama Depan *</Label>
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        placeholder="Masukkan nama depan"
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nama Belakang *</Label>
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        placeholder="Masukkan nama belakang"
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nama Panggilan</Label>
                    <Input
                      id="nickname"
                      {...register('nickname')}
                      placeholder="Nama panggilan (opsional)"
                    />
                    {errors.nickname && (
                      <p className="text-sm text-red-500">{errors.nickname.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Jenis Kelamin *</Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Laki-laki</SelectItem>
                            <SelectItem value="female">Perempuan</SelectItem>
                            <SelectItem value="other">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gender && (
                      <p className="text-sm text-red-500">{errors.gender.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Birth Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Informasi Kelahiran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Tanggal Lahir *</Label>
                    <Controller
                      name="birthDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Pilih tanggal lahir"
                          allowPartial={false}
                        />
                      )}
                    />
                    {errors.birthDate && (
                      <p className="text-sm text-red-500">{errors.birthDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthPlace" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Tempat Lahir
                    </Label>
                    <Input
                      id="birthPlace"
                      {...register('birthPlace')}
                      placeholder="Kota, Provinsi"
                    />
                    {errors.birthPlace && (
                      <p className="text-sm text-red-500">{errors.birthPlace.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Life Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Status Kehidupan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Controller
                      name="isLiving"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label className="text-base">
                      {isLiving ? 'Masih Hidup' : 'Sudah Meninggal'}
                    </Label>
                  </div>

                  <AnimatePresence>
                    {!isLiving && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="deathDate">Tanggal Meninggal *</Label>
                          <Controller
                            name="deathDate"
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Pilih tanggal meninggal"
                                allowPartial={false}
                              />
                            )}
                          />
                          {errors.deathDate && (
                            <p className="text-sm text-red-500">{errors.deathDate.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deathPlace" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Tempat Meninggal
                          </Label>
                          <Input
                            id="deathPlace"
                            {...register('deathPlace')}
                            placeholder="Kota, Provinsi"
                          />
                          {errors.deathPlace && (
                            <p className="text-sm text-red-500">{errors.deathPlace.message}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-orange-500" />
                    Informasi Kontak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="email@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telepon
                      </Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="+62 812-3456-7890"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-500" />
                    Informasi Tambahan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="occupation" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Pekerjaan
                      </Label>
                      <Input
                        id="occupation"
                        {...register('occupation')}
                        placeholder="Pekerjaan saat ini"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Pendidikan
                      </Label>
                      <Input
                        id="education"
                        {...register('education')}
                        placeholder="Pendidikan terakhir"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biography" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Biografi
                    </Label>
                    <Textarea
                      id="biography"
                      {...register('biography')}
                      placeholder="Cerita singkat tentang anggota keluarga ini..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      {watch('biography')?.length || 0}/1000 karakter
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-indigo-500" />
                    Foto Profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="avatar">URL Foto Profil</Label>
                      <Input
                        id="avatar"
                        {...register('avatar')}
                        placeholder="https://example.com/photo.jpg"
                        onChange={(e) => handleAvatarUrlChange(e.target.value)}
                      />
                      {errors.avatar && (
                        <p className="text-sm text-red-500">{errors.avatar.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Simpan
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}