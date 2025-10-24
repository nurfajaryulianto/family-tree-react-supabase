import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FamilyMember } from '@/types/family-tree';
import {
  User,
  Calendar,
  MapPin,
  Heart,
  Users
} from 'lucide-react';

interface FamilyTreeNodeProps {
  member: FamilyMember;
  x: number;
  y: number;
  depth: number;
  onClick: (event: React.MouseEvent) => void;
  onRightClick: (event: React.MouseEvent) => void;
  onProfileView: (member: FamilyMember) => void;
  onCircleView: (member: FamilyMember) => void;
  onAddFamilyMember: (member: FamilyMember, relationType: string) => void;
  onViewSpouse: (member: FamilyMember) => void;
  onRelationshipDetails: (member: FamilyMember) => void;
}

export function FamilyTreeNode({
  member,
  x,
  y,
  depth,
  onClick,
  onRightClick,
  onProfileView,
  onCircleView,
  onAddFamilyMember,
  onViewSpouse,
  onRelationshipDetails,
}: FamilyTreeNodeProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Color schemes based on generation depth
  const generationColors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600'
  ];

  const nodeColor = generationColors[depth % generationColors.length];

  const handleNodeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick(event);
  };

  const handleRightClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onRightClick(event);
  };

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: depth * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Main Node Card */}
      <Card
        className={`
          relative w-48 cursor-pointer transition-all duration-300
          ${isHovered ? 'shadow-xl ring-2 ring-blue-400 ring-opacity-50' : 'shadow-lg'}
          hover:shadow-2xl
        `}
        onClick={handleNodeClick}
        onContextMenu={handleRightClick}
      >
        <div className="p-4">
          {/* Avatar Section */}
          <div className="flex items-center justify-center mb-3">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
                <AvatarFallback className={`bg-gradient-to-br ${nodeColor} text-white font-bold text-lg`}>
                  {member.firstName?.[0]}{member.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              {/* Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                member.isLiving ? 'bg-green-500' : 'bg-gray-400'
              }`} />

              {/* Hover Actions */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <User className="h-4 w-4" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Member Information */}
          <div className="text-center space-y-2">
            {/* Name */}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {member.firstName} {member.lastName}
              </h3>
              {member.nickname && (
                <p className="text-xs text-gray-600 italic">"{member.nickname}"</p>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-1">
              <Badge
                variant={member.gender === 'male' ? 'default' : 'secondary'}
                className={`text-xs px-2 py-0.5 ${
                  member.gender === 'male'
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                }`}
              >
                {member.gender === 'male' ? 'Pria' : 'Wanita'}
              </Badge>

              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 ${
                  member.isLiving
                    ? 'border-green-500 text-green-700'
                    : 'border-gray-400 text-gray-600'
                }`}
              >
                {member.isLiving ? 'Hidup' : 'Meninggal'}
              </Badge>
            </div>

            {/* Birth Info */}
            {member.birthDate && (
              <div className="flex items-center justify-center text-xs text-gray-600 space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(member.birthDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}</span>
              </div>
            )}

            {/* Birth Place */}
            {member.birthPlace && (
              <div className="flex items-center justify-center text-xs text-gray-600 space-x-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-32">{member.birthPlace}</span>
              </div>
            )}

            {/* Death Info (if applicable) */}
            {!member.isLiving && member.deathDate && (
              <div className="flex items-center justify-center text-xs text-gray-500 space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Meninggal: {new Date(member.deathDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}</span>
              </div>
            )}
          </div>

          {/* Quick Actions (shown on hover) */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-gray-200"
            >
              <div className="flex justify-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProfileView(member);
                  }}
                  className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Lihat Profil"
                >
                  <User className="h-3 w-3 text-blue-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewSpouse(member);
                  }}
                  className="p-1.5 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
                  title="Lihat Pasangan"
                >
                  <Heart className="h-3 w-3 text-pink-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRelationshipDetails(member);
                  }}
                  className="p-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                  title="Detail Hubungan"
                >
                  <Users className="h-3 w-3 text-orange-600" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Generation Indicator */}
        <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${nodeColor}`}>
          Generasi {depth + 1}
        </div>

        {/* Connection Points for Spouse */}
        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-pink-400 rounded-full" />
        </div>
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-pink-400 rounded-full" />
        </div>

        {/* Connection Point for Parents */}
        <div className="absolute left-1/2 -top-4 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-blue-400 rounded-full" />
        </div>

        {/* Connection Point for Children */}
        <div className="absolute left-1/2 -bottom-4 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
        </div>
      </Card>

      {/* Hover Glow Effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`,
            filter: 'blur(10px)'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.2 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}