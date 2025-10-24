import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FamilyTreeCanvas } from './FamilyTreeCanvas';
import { FamilyMember } from '@/types/family-tree';

// Sample data for demonstration
const sampleMembers: FamilyMember[] = [
  // Generation 1 (Great Grandparents)
  {
    id: '1',
    firstName: 'Haji',
    lastName: 'Ahmad',
    nickname: 'Buyut Ahmad',
    birthDate: '1920-03-15',
    birthPlace: 'Surabaya, Jawa Timur',
    deathDate: '1995-12-20',
    isLiving: false,
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    biography: 'Pendiri keluarga besar yang dihormati di komunitasnya',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    firstName: 'Siti',
    lastName: 'Aminah',
    nickname: 'Buyut Siti',
    birthDate: '1925-07-22',
    birthPlace: 'Malang, Jawa Timur',
    deathDate: '2000-05-15',
    isLiving: false,
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },

  // Generation 2 (Grandparents)
  {
    id: '3',
    firstName: 'Budi',
    lastName: 'Santoso',
    nickname: 'Pak Budi',
    birthDate: '1950-11-10',
    birthPlace: 'Jakarta',
    isLiving: true,
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    biography: 'Pengusaha sukses dan filantropis',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    firstName: 'Dewi',
    lastName: 'Kusuma',
    nickname: 'Bu Dewi',
    birthDate: '1952-09-18',
    birthPlace: 'Bandung',
    isLiving: true,
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    firstName: 'Rudi',
    lastName: 'Wijaya',
    nickname: 'Pak Rudi',
    birthDate: '1955-02-28',
    birthPlace: 'Semarang',
    isLiving: true,
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },

  // Generation 3 (Parents)
  {
    id: '6',
    firstName: 'Andi',
    lastName: 'Pratama',
    nickname: 'Andi',
    birthDate: '1978-06-15',
    birthPlace: 'Jakarta',
    isLiving: true,
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    biography: 'Dokter spesialis jantung di RSUD Jakarta',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    firstName: 'Sarah',
    lastName: 'Putri',
    nickname: 'Sarah',
    birthDate: '1980-12-03',
    birthPlace: 'Surabaya',
    isLiving: true,
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    biography: 'Guru sekolah dasar yang berdedikasi',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '8',
    firstName: 'Rina',
    lastName: 'Maharani',
    nickname: 'Rina',
    birthDate: '1982-04-20',
    birthPlace: 'Bandung',
    isLiving: true,
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },

  // Generation 4 (Children)
  {
    id: '9',
    firstName: 'Fahri',
    lastName: 'Pratama',
    nickname: 'Fahri',
    birthDate: '2005-08-12',
    birthPlace: 'Jakarta',
    isLiving: true,
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
    biography: 'Mahasiswa kedokteran semester 6',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '10',
    firstName: 'Aisha',
    lastName: 'Pratama',
    nickname: 'Aisha',
    birthDate: '2008-03-25',
    birthPlace: 'Jakarta',
    isLiving: true,
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '11',
    firstName: 'Rizky',
    lastName: 'Maharani',
    nickname: 'Rizky',
    birthDate: '2010-07-18',
    birthPlace: 'Bandung',
    isLiving: true,
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '12',
    firstName: 'Nadia',
    lastName: 'Maharani',
    nickname: 'Nadia',
    birthDate: '2012-11-30',
    birthPlace: 'Bandung',
    isLiving: true,
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1531746020798-d6ff0c84045b?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export function FamilyTreeDemo() {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const handleNodeClick = (member: FamilyMember, event: React.MouseEvent) => {
    console.log('Node clicked:', member);
    setSelectedMember(member);
    // Could open a detail panel or navigate to profile
  };

  const handleProfileView = (member: FamilyMember) => {
    console.log('Viewing profile:', member);
    alert(`Navigasi ke profil lengkap: ${member.firstName} ${member.lastName}\n\nBiografi: ${member.biography || 'Tidak ada biografi'}`);
  };

  const handleCircleView = (member: FamilyMember) => {
    console.log('Opening circle view:', member);
    alert(`Circle View untuk: ${member.firstName} ${member.lastName}\n\nMenampilkan hubungan keluarga dalam format melingkar`);
  };

  const handleAddFamilyMember = (member: FamilyMember, relationType: string) => {
    console.log('Adding family member:', member, 'Relation:', relationType);
    alert(`Tambah ${relationType} untuk: ${member.firstName} ${member.lastName}\n\nMembuka form tambah anggota keluarga dengan relasi yang dipilih`);
  };

  const handleViewSpouse = (member: FamilyMember) => {
    console.log('Viewing spouse:', member);
    alert(`Lihat informasi pasangan untuk: ${member.firstName} ${member.lastName}\n\nMenampilkan detail pasangan dan riwayat pernikahan`);
  };

  const handleRelationshipDetails = (member: FamilyMember) => {
    console.log('Viewing relationship details:', member);
    alert(`Detail hubungan untuk: ${member.firstName} ${member.lastName}\n\nMenampilkan semua hubungan keluarga yang terkait`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Pohon Keluarga Pratama
              </h1>
              <div className="ml-4 flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  4 Generasi
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {sampleMembers.length} Anggota
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Export GEDCOM
              </Button>
              <Button variant="outline" size="sm">
                Bagikan
              </Button>
              <Button size="sm">
                Tambah Anggota
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Member Info */}
      {selectedMember && (
        <Card className="m-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                  {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {selectedMember.birthDate && `Lahir: ${new Date(selectedMember.birthDate).toLocaleDateString('id-ID')}`}
                    {selectedMember.birthPlace && ` di ${selectedMember.birthPlace}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMember(null)}
              >
                Tutup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Tree Canvas */}
      <FamilyTreeCanvas
        members={sampleMembers}
        onNodeClick={handleNodeClick}
        onProfileView={handleProfileView}
        onCircleView={handleCircleView}
        onAddFamilyMember={handleAddFamilyMember}
        onViewSpouse={handleViewSpouse}
        onRelationshipDetails={handleRelationshipDetails}
      />

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div>
            © 2024 Family Tree App. Dibuat dengan ❤️ untuk keluarga Indonesia.
          </div>
          <div className="flex items-center space-x-4">
            <span>Zoom: Gunakan scroll atau tombol zoom</span>
            <span>•</span>
            <span>Pan: Klik dan drag</span>
            <span>•</span>
            <span>Menu: Klik kanan pada anggota</span>
          </div>
        </div>
      </div>
    </div>
  );
}