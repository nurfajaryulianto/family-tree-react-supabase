import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Users,
  Plus,
  Heart,
  Eye,
  Edit3,
  Camera,
  FileText,
  Circle,
  MoreHorizontal,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FamilyMember, RadialMenuAction, RadialMenuPosition } from '@/types/family-tree';

interface RadialMenuProps {
  member: FamilyMember;
  position: RadialMenuPosition;
  isOpen: boolean;
  onClose: () => void;
  onProfileView: (member: FamilyMember) => void;
  onCircleView: (member: FamilyMember) => void;
  onAddFamilyMember: (member: FamilyMember, relationType: string) => void;
  onViewSpouse: (member: FamilyMember) => void;
  onRelationshipDetails: (member: FamilyMember) => void;
}

const menuItems = [
  { id: 'profile', label: 'Lihat Profil', icon: User, color: 'bg-blue-500' },
  { id: 'circle', label: 'Circle View', icon: Circle, color: 'bg-purple-500' },
  { id: 'add-member', label: 'Tambah Anggota', icon: Plus, color: 'bg-green-500' },
  { id: 'spouse', label: 'Pasangan', icon: Heart, color: 'bg-pink-500' },
  { id: 'relationships', label: 'Hubungan', icon: Users, color: 'bg-orange-500' },
];

const addMemberOptions = [
  { type: 'parent', label: 'Orang Tua', icon: '👨‍👩‍👧‍👦' },
  { type: 'child', label: 'Anak', icon: '👶' },
  { type: 'sibling', label: 'Saudara', icon: '👫' },
  { type: 'spouse', label: 'Pasangan', icon: '💑' },
];

export function RadialMenu({
  member,
  position,
  isOpen,
  onClose,
  onProfileView,
  onCircleView,
  onAddFamilyMember,
  onViewSpouse,
  onRelationshipDetails,
}: RadialMenuProps) {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate angle for each menu item to arrange them in a circle
  const angleStep = (2 * Math.PI) / menuItems.length;
  const radius = 80;

  const getItemPosition = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMenuAction = (actionId: string) => {
    switch (actionId) {
      case 'profile':
        onProfileView(member);
        break;
      case 'circle':
        onCircleView(member);
        break;
      case 'add-member':
        setShowAddOptions(!showAddOptions);
        break;
      case 'spouse':
        onViewSpouse(member);
        break;
      case 'relationships':
        onRelationshipDetails(member);
        break;
    }
    onClose();
  };

  const handleAddMember = (relationType: string) => {
    onAddFamilyMember(member, relationType);
    setShowAddOptions(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50" ref={menuRef}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Menu Container */}
        <div
          className="absolute"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Central Member Avatar */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-20"
          >
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarImage src={member.avatar} alt={member.firstName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white font-semibold text-lg">
                  {member.firstName?.[0]}{member.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              {/* Close Button */}
              <Button
                size="icon"
                variant="outline"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-md hover:bg-red-50 hover:border-red-200"
                onClick={onClose}
              >
                <X className="h-3 w-3" />
              </Button>

              {/* Status Indicator */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                <Badge
                  variant={member.isLiving ? "default" : "secondary"}
                  className="text-xs px-2 py-0.5"
                >
                  {member.isLiving ? 'Hidup' : 'Meninggal'}
                </Badge>
              </div>
            </div>

            {/* Member Name */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center min-w-max"
            >
              <p className="font-semibold text-sm text-gray-800 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                {member.firstName} {member.lastName}
              </p>
              {member.nickname && (
                <p className="text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm mt-1">
                  "{member.nickname}"
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Radial Menu Items */}
          {menuItems.map((item, index) => {
            const position = getItemPosition(index);
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: position.x,
                  y: position.y
                }}
                exit={{
                  scale: 0,
                  opacity: 0,
                  x: 0,
                  y: 0
                }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: index * 0.05
                }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <Button
                    size="icon"
                    variant="outline"
                    className={`h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 ${item.color.replace('bg-', 'border-')}`}
                    onClick={() => handleMenuAction(item.id)}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>

                  {/* Tooltip */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none"
                  >
                    {item.label}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* Add Member Options Submenu */}
          <AnimatePresence>
            {showAddOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-max z-30"
              >
                <div className="mb-3">
                  <h4 className="font-semibold text-sm text-gray-900">Tambah Anggota Keluarga</h4>
                  <p className="text-xs text-gray-600">Pilih jenis hubungan</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {addMemberOptions.map((option) => (
                    <motion.button
                      key={option.type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddMember(option.type)}
                      className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <span className="text-xl">{option.icon}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{option.label}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <Separator className="my-3" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddOptions(false)}
                  className="w-full"
                >
                  Batal
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatePresence>
  );
}