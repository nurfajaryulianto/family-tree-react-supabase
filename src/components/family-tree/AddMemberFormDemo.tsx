import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddMemberForm } from './AddMemberForm';
import { FamilyMemberForm } from '@/schemas/family-member';
import { FamilyMember } from '@/types/family-tree';

// Sample member for relation demonstration
const sampleMember: FamilyMember = {
  id: '1',
  firstName: 'Ahmad',
  lastName: 'Fajar',
  nickname: 'Pak Ahmad',
  birthDate: '1980-03-15',
  birthPlace: 'Jakarta',
  isLiving: true,
  gender: 'male',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  biography: 'Ayah dari 3 anak yang baik hati',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export function AddMemberFormDemo() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRelation, setSelectedRelation] = useState<{ member: FamilyMember; type: string } | null>(null);
  const [submittedMembers, setSubmittedMembers] = useState<FamilyMemberForm[]>([]);

  const handleAddMember = (relationType?: string) => {
    if (relationType) {
      setSelectedRelation({ member: sampleMember, type: relationType });
    } else {
      setSelectedRelation(null);
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: FamilyMemberForm) => {
    // Simulate API call
    console.log('Submitting member data:', data);

    // Add to submitted members list
    setSubmittedMembers(prev => [...prev, data]);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('Anggota keluarga berhasil ditambahkan!');
  };

  const relationTypes = [
    { type: 'parent', label: 'Tambah Orang Tua', description: 'Menambahkan orang tua dari anggota yang ada', color: 'bg-blue-500' },
    { type: 'child', label: 'Tambah Anak', description: 'Menambahkan anak dari anggota yang ada', color: 'bg-green-500' },
    { type: 'sibling', label: 'Tambah Saudara', description: 'Menambahkan saudara dari anggota yang ada', color: 'bg-purple-500' },
    { type: 'spouse', label: 'Tambah Pasangan', description: 'Menambahkan pasangan dari anggota yang ada', color: 'bg-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Form Tambah Anggota Keluarga
            </CardTitle>
            <CardDescription className="text-lg">
              Formulir komprehensif untuk menambahkan anggota keluarga dengan validasi lengkap
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Instructions */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">Cara Penggunaan:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Fitur Form:</h4>
                <ul className="space-y-1">
                  <li>• Validasi real-time untuk semua input</li>
                  <li>• Date picker dengan format Indonesia</li>
                  <li>• Status kehidupan (hidup/meninggal) dinamis</li>
                  <li>• Preview foto profil dari URL</li>
                  <li>• Support untuk data hubungan keluarga</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Cara Mencoba:</h4>
                <ul className="space-y-1">
                  <li>• Klik "Tambah Anggota Baru" untuk form kosong</li>
                  <li>• Klik relasi spesifik untuk form terisi otomatis</li>
                  <li>• Coba validasi dengan input yang tidak valid</li>
                  <li>• Test fitur status hidup/meninggal</li>
                  <li>• Upload foto melalui URL</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Tambah Anggota Baru</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Tambah anggota keluarga tanpa hubungan spesifik
                  </p>
                  <Button onClick={() => handleAddMember()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Anggota
                  </Button>
                </div>
                <div className="text-4xl">👨‍👩‍👧‍👦</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Tambah dengan Relasi</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Tambah anggota dengan hubungan ke anggota yang ada
                  </p>
                  <div className="text-sm text-gray-500">
                    Referensi: {sampleMember.firstName} {sampleMember.lastName}
                  </div>
                </div>
                <div className="text-4xl">🔗</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Relation Type Cards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tambah Anggota dengan Relasi Spesifik</CardTitle>
            <CardDescription>
              Pilih jenis hubungan dengan {sampleMember.firstName} {sampleMember.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {relationTypes.map((relation) => (
                <Card
                  key={relation.type}
                  className="hover:shadow-md transition-all duration-300 cursor-pointer border-2 hover:border-blue-300"
                  onClick={() => handleAddMember(relation.type)}
                >
                  <CardContent className="pt-4">
                    <div className={`w-12 h-12 rounded-lg ${relation.color} flex items-center justify-center text-white mb-3`}>
                      {relation.type === 'parent' && '👨‍👩‍👧‍👦'}
                      {relation.type === 'child' && '👶'}
                      {relation.type === 'sibling' && '👫'}
                      {relation.type === 'spouse' && '💑'}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{relation.label}</h4>
                    <p className="text-xs text-gray-600">{relation.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Validation Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Fitur Validasi & Pengalaman Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Validasi Real-time</h4>
                  <p className="text-xs text-gray-600">Error tampil langsung saat input</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  📅
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Date Picker</h4>
                  <p className="text-xs text-gray-600">Kalender interaktif dengan format Indonesia</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                  🔄
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Form Dinamis</h4>
                  <p className="text-xs text-gray-600">Field meninggal muncul otomatis</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                  🖼️
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Preview Foto</h4>
                  <p className="text-xs text-gray-600">Lihat foto langsung dari URL</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white">
                  💾
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Auto-save</h4>
                  <p className="text-xs text-gray-600">Data tidak hilang saat navigasi</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                  📱
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Responsive</h4>
                  <p className="text-xs text-gray-600">Optimal di desktop dan mobile</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submitted Members */}
        {submittedMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Data yang Telah Ditambahkan</CardTitle>
              <CardDescription>
                Anggota keluarga yang berhasil ditambahkan dalam sesi ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {submittedMembers.map((member, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {member.firstName} {member.lastName}
                        </h4>
                        {member.nickname && (
                          <p className="text-sm text-gray-600">"{member.nickname}"</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.gender === 'male'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}>
                            {member.gender === 'male' ? 'Pria' : 'Wanita'}
                          </span>
                          {member.birthDate && (
                            <span className="text-xs text-gray-600">
                              Lahir: {new Date(member.birthDate).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-green-600">
                        ✓ Berhasil
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Member Form Modal */}
      <AddMemberForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedRelation(null);
        }}
        onSubmit={handleFormSubmit}
        relationToMember={selectedRelation?.member}
        relationType={selectedRelation?.type}
      />
    </div>
  );
}