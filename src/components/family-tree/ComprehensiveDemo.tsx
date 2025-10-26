import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadialMenuDemo } from './RadialMenuDemo';
import { FamilyTreeDemo } from './FamilyTreeDemo';
import { AddMemberFormDemo } from './AddMemberFormDemo';
import { RealtimeCollaborationDemo } from './RealtimeCollaborationDemo';
import { FamilyMember } from '@/types/family-tree';
import {
  Users,
  TreePine,
  UserPlus,
  Settings,
  Star,
  CheckCircle,
  Circle,
  Clock,
  Heart,
  Wifi
} from 'lucide-react';

interface FeatureItem {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  icon: React.ReactNode;
  component: React.ReactNode;
}

export function ComprehensiveDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  const features: FeatureItem[] = [
    {
      title: 'Radial Menu Interaktif',
      description: 'Menu radial canggih dengan spouse view, profil anggota, circle view, dan opsi tambah anggota keluarga',
      status: 'completed',
      icon: <Users className="h-5 w-5" />,
      component: <RadialMenuDemo />
    },
    {
      title: 'Visualisasi Pohon Keluarga',
      description: 'Canvas multi-generasi dengan zoom/pan, minimap, dan dukungan 4+ generasi',
      status: 'completed',
      icon: <TreePine className="h-5 w-5" />,
      component: <FamilyTreeDemo />
    },
    {
      title: 'Form Tambah Anggota',
      description: 'Formulir komprehensif dengan validasi, date picker, dan preview foto',
      status: 'completed',
      icon: <UserPlus className="h-5 w-5" />,
      component: <AddMemberFormDemo />
    },
    {
      title: 'Real-time Collaboration',
      description: 'Real-time updates, presence tracking, collaborative cursors, activity feed, and visual notifications',
      status: 'completed',
      icon: <Wifi className="h-5 w-5" />,
      component: <RealtimeCollaborationDemo />
    },
    {
      title: 'Profil Anggota Detail',
      description: 'Halaman profil dengan galeri foto, dokumen, dan biografi lengkap',
      status: 'in-progress',
      icon: <UserPlus className="h-5 w-5" />,
      component: <div className="text-center p-8 text-gray-500">Coming Soon...</div>
    },
    {
      title: 'Privasi & Kolaborasi',
      description: 'Kontrol privasi granular, sistem undangan dengan QR code, dan manajemen kolaborasi',
      status: 'pending',
      icon: <Settings className="h-5 w-5" />,
      component: <div className="text-center p-8 text-gray-500">Coming Soon...</div>
    },
    {
      title: 'Dasbor Pengguna',
      description: 'Dashboard dengan statistik, activity feed, dan pintasan aksi cepat',
      status: 'pending',
      icon: <Settings className="h-5 w-5" />,
      component: <div className="text-center p-8 text-gray-500">Coming Soon...</div>
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'pending':
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case 'in-progress':
        return <Badge className="bg-orange-100 text-orange-800">Dalam Pengembangan</Badge>;
      case 'pending':
        return <Badge variant="outline">Menunggu</Badge>;
      default:
        return null;
    }
  };

  const completedFeatures = features.filter(f => f.status === 'completed').length;
  const totalFeatures = features.length;
  const completionPercentage = Math.round((completedFeatures / totalFeatures) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Aplikasi Silsilah Keluarga Komprehensif
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Star className="h-3 w-3 mr-1" />
                Demo Version
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {completedFeatures}/{totalFeatures} Fitur Selesai
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Proyek Aplikasi Silsilah Keluarga</h2>
                <p className="text-blue-100">
                  Aplikasi modern untuk membangun, mengelola, dan menghidupkan sejarah keluarga Anda
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{completionPercentage}%</div>
                <div className="text-blue-100 text-sm">Selesai</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-blue-700 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="radial-menu">Radial Menu</TabsTrigger>
            <TabsTrigger value="tree-view">Pohon Keluarga</TabsTrigger>
            <TabsTrigger value="add-member">Tambah Anggota</TabsTrigger>
            <TabsTrigger value="member-profile">Profil Anggota</TabsTrigger>
            <TabsTrigger value="privacy">Privasi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fitur-Fitur Utama</CardTitle>
                <CardDescription>
                  Komponen-komponen yang telah dibangun untuk aplikasi silsilah keluarga yang komprehensif
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                              {feature.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                              <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(feature.status)}
                                {getStatusBadge(feature.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Core Technologies */}
            <Card>
              <CardHeader>
                <CardTitle>Teknologi Yang Digunakan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">⚛️</div>
                    <h4 className="font-semibold">React 18</h4>
                    <p className="text-sm text-gray-600">Frontend Framework</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-2">🎨</div>
                    <h4 className="font-semibold">Tailwind CSS</h4>
                    <p className="text-sm text-gray-600">Styling Framework</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-2">🎭</div>
                    <h4 className="font-semibold">Framer Motion</h4>
                    <p className="text-sm text-gray-600">Animation Library</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl mb-2">🔥</div>
                    <h4 className="font-semibold">Supabase</h4>
                    <p className="text-sm text-gray-600">Backend & Database</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="radial-menu">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Radial Menu Interaktif
                </CardTitle>
                <CardDescription>
                  Menu radial canggih dengan berbagai fungsi untuk interaksi pohon keluarga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadialMenuDemo />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tree-view">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-500" />
                  Visualisasi Pohon Keluarga
                </CardTitle>
                <CardDescription>
                  Canvas interaktif dengan zoom, pan, dan dukungan multi-generasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FamilyTreeDemo />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-member">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-purple-500" />
                  Form Tambah Anggota
                </CardTitle>
                <CardDescription>
                  Formulir komprehensif dengan validasi lengkap dan UI yang intuitif
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddMemberFormDemo />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="member-profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Profil Anggota Detail
                </CardTitle>
                <CardDescription>
                  Halaman profil lengkap dengan galeri foto, dokumen, dan biografi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sedang Dalam Pengembangan</h3>
                  <p className="text-gray-600 mb-6">
                    Fitur profil anggota detail sedang dibangun dan akan segera tersedia.
                  </p>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Galeri foto dengan upload/preview/delete</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Manajemen dokumen keluarga</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Biografi dengan rich text editor</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Timeline hubungan keluarga</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-500" />
                  Privasi & Kolaborasi
                </CardTitle>
                <CardDescription>
                  Kontrol privasi granular dan sistem kolaborasi keluarga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔐</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Fitur Privasi & Kolaborasi</h3>
                  <p className="text-gray-600 mb-6">
                    Sistem privasi dan kolaborasi yang akan segera hadir.
                  </p>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Circle className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">Kontrol visibilitas pohon keluarga</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Circle className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">Manajemen peran (owner, editor, viewer)</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Circle className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">Undangan anggota dengan QR code</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Circle className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">Activity feed dan notifikasi</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}