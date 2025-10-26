import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadialMenu } from './RadialMenu';
import { FamilyMember, RadialMenuPosition } from '@/types/family-tree';

// Sample data for demonstration
const sampleMembers: FamilyMember[] = [
  {
    id: '1',
    firstName: 'Ahmad',
    lastName: 'Fajar',
    nickname: 'Bang Ahmad',
    birthDate: '1980-03-15',
    birthPlace: 'Jakarta',
    isLiving: true,
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    biography: 'Anak pertama dari keluarga Fajar',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    firstName: 'Siti',
    lastName: 'Aminah',
    nickname: 'Ibu Siti',
    birthDate: '1982-07-22',
    birthPlace: 'Bandung',
    isLiving: true,
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    firstName: 'Budi',
    lastName: 'Santoso',
    birthDate: '1950-12-01',
    deathDate: '2020-05-15',
    isLiving: false,
    gender: 'male',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export function RadialMenuDemo() {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [menuPosition, setMenuPosition] = useState<RadialMenuPosition>({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNodeClick = (member: FamilyMember, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    setSelectedMember(member);
    setMenuPosition(position);
    setIsMenuOpen(true);
  };

  const handleProfileView = (member: FamilyMember) => {
    console.log('Viewing profile:', member);
    // Navigate to profile page
    alert(`Navigasi ke profil: ${member.firstName} ${member.lastName}`);
  };

  const handleCircleView = (member: FamilyMember) => {
    console.log('Opening circle view:', member);
    // Open circle view modal/page
    alert(`Circle View untuk: ${member.firstName} ${member.lastName}`);
  };

  const handleAddFamilyMember = (member: FamilyMember, relationType: string) => {
    console.log('Adding family member:', member, 'Relation:', relationType);
    // Open add member form with pre-filled relationship
    alert(`Tambah ${relationType} untuk: ${member.firstName} ${member.lastName}`);
  };

  const handleViewSpouse = (member: FamilyMember) => {
    console.log('Viewing spouse:', member);
    // Show spouse details or spouse selection
    alert(`Lihat pasangan untuk: ${member.firstName} ${member.lastName}`);
  };

  const handleRelationshipDetails = (member: FamilyMember) => {
    console.log('Viewing relationship details:', member);
    // Show relationship details modal
    alert(`Detail hubungan untuk: ${member.firstName} ${member.lastName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Family Tree Radial Menu Demo
            </CardTitle>
            <CardDescription className="text-lg">
              Klik pada kartu anggota keluarga di bawah untuk membuka menu radial dengan berbagai aksi
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Instructions */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Cara Penggunaan:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Klik pada kartu anggota keluarga untuk membuka menu radial</li>
              <li>• Menu radial menampilkan: Profil, Circle View, Tambah Anggota, Pasangan, dan Hubungan</li>
              <li>• Klik "Tambah Anggota" untuk melihat opsi tambah anggota keluarga</li>
              <li>• Klik di luar menu untuk menutup</li>
            </ul>
          </CardContent>
        </Card>

        {/* Family Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sampleMembers.map((member) => (
            <Card
              key={member.id}
              className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
              onClick={(e) => handleNodeClick(member, e)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.firstName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        `${member.firstName[0]}${member.lastName[0]}`
                      )}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                      member.isLiving ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {member.firstName} {member.lastName}
                    </h3>
                    {member.nickname && (
                      <p className="text-sm text-gray-600 italic">"{member.nickname}"</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {member.isLiving ? 'Hidup' : `Meninggal (${member.deathDate})`}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 text-sm">
                  {member.birthDate && (
                    <p className="text-gray-600">
                      <span className="font-medium">Lahir:</span> {new Date(member.birthDate).toLocaleDateString('id-ID')}
                      {member.birthPlace && ` di ${member.birthPlace}`}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.gender === 'male'
                        ? 'bg-blue-100 text-blue-800'
                        : member.gender === 'female'
                        ? 'bg-pink-100 text-pink-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.gender === 'male' ? 'Pria' : member.gender === 'female' ? 'Wanita' : 'Lainnya'}
                    </span>
                    <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                      Klik untuk menu →
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>Fitur Radial Menu</CardTitle>
            <CardDescription>
              Menu radial yang komprehensif dengan berbagai fungsi untuk manajemen pohon keluarga
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  👤
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Lihat Profil</h4>
                  <p className="text-xs text-gray-600">Akses halaman detail anggota</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                  ⭕
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Circle View</h4>
                  <p className="text-xs text-gray-600">Visualisasi hubungan melingkar</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                  ➕
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Tambah Anggota</h4>
                  <p className="text-xs text-gray-600">Tambah orang tua, anak, saudara, pasangan</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white">
                  💑
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Pasangan</h4>
                  <p className="text-xs text-gray-600">Lihat detail pasangan</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                  👨‍👩‍👧‍👦
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Hubungan</h4>
                  <p className="text-xs text-gray-600">Detail hubungan keluarga</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center text-white">
                  📍
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Posisi Adaptif</h4>
                  <p className="text-xs text-gray-600">Menu menyesuaikan dengan posisi klik</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Radial Menu Component */}
      {selectedMember && (
        <RadialMenu
          member={selectedMember}
          position={menuPosition}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onProfileView={handleProfileView}
          onCircleView={handleCircleView}
          onAddFamilyMember={handleAddFamilyMember}
          onViewSpouse={handleViewSpouse}
          onRelationshipDetails={handleRelationshipDetails}
        />
      )}
    </div>
  );
}