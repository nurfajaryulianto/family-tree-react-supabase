import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Home,
  Download,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { FamilyMember, TreeNode } from '@/types/family-tree';
import { FamilyTreeNode } from './FamilyTreeNode';
import { RadialMenu } from './RadialMenu';

interface FamilyTreeCanvasProps {
  members: FamilyMember[];
  onNodeClick: (member: FamilyMember, event: React.MouseEvent) => void;
  onProfileView: (member: FamilyMember) => void;
  onCircleView: (member: FamilyMember) => void;
  onAddFamilyMember: (member: FamilyMember, relationType: string) => void;
  onViewSpouse: (member: FamilyMember) => void;
  onRelationshipDetails: (member: FamilyMember) => void;
}

interface ViewState {
  scale: number;
  position: { x: number; y: number };
}

export function FamilyTreeCanvas({
  members,
  onNodeClick,
  onProfileView,
  onCircleView,
  onAddFamilyMember,
  onViewSpouse,
  onRelationshipDetails,
}: FamilyTreeCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    position: { x: 0, y: 0 }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const controls = useAnimation();

  // Calculate tree layout
  const treeData = useMemo(() => {
    if (!members.length) return null;

    // Create a simple tree structure for demo
    // In a real app, this would be based on actual relationships
    const rootNode: TreeNode = {
      member: members[0],
      x: 400,
      y: 100,
      children: [],
      parents: []
    };

    // Add children
    if (members.length > 1) {
      rootNode.children = members.slice(1, 3).map((member, index) => ({
        member,
        x: 250 + index * 300,
        y: 250,
        children: [],
        parents: [rootNode]
      }));

      // Add grandchildren
      if (members.length > 3) {
        rootNode.children.forEach((child, childIndex) => {
          const grandChildStart = 3 + childIndex * 2;
          if (members[grandChildStart]) {
            child.children = members.slice(grandChildStart, grandChildStart + 2).map((member, index) => ({
              member,
              x: 150 + childIndex * 300 + index * 150,
              y: 400,
              children: [],
              parents: [child]
            }));
          }
        });
      }
    }

    return rootNode;
  }, [members]);

  // Get canvas bounds
  const getCanvasBounds = useCallback(() => {
    if (!canvasRef.current) return { width: 800, height: 600 };
    return {
      width: canvasRef.current.scrollWidth,
      height: canvasRef.current.scrollHeight
    };
  }, []);

  // Handle zoom
  const handleZoom = useCallback((direction: 'in' | 'out' | number) => {
    setViewState(prev => {
      let newScale = prev.scale;

      if (direction === 'in') {
        newScale = Math.min(prev.scale * 1.2, 3);
      } else if (direction === 'out') {
        newScale = Math.max(prev.scale / 1.2, 0.3);
      } else {
        newScale = Math.max(0.3, Math.min(3, direction));
      }

      return { ...prev, scale: newScale };
    });
  }, []);

  // Handle pan
  const handlePanStart = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: event.clientX - viewState.position.x, y: event.clientY - viewState.position.y });
      event.preventDefault();
    }
  }, [viewState.position]);

  const handlePan = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;

    setViewState(prev => ({
      ...prev,
      position: {
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      }
    }));
  }, [isDragging, dragStart]);

  const handlePanEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    controls.start({
      scale: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    });
    setViewState({ scale: 1, position: { x: 0, y: 0 } });
  }, [controls]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(viewState.scale + delta);
  }, [viewState.scale, handleZoom]);

  // Add wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Handle node right-click for radial menu
  const handleNodeRightClick = useCallback((member: FamilyMember, event: React.MouseEvent) => {
    event.preventDefault();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    setSelectedMember(member);
    setIsMenuOpen(true);
  }, []);

  // Close menu
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setSelectedMember(null);
  }, []);

  // Render tree connections
  const renderConnections = useCallback(() => {
    if (!treeData) return null;

    const connections = [];

    const renderNodeConnections = (node: TreeNode) => {
      // Parent-child connections
      node.children.forEach(child => {
        connections.push(
          <motion.line
            key={`${node.member.id}-${child.member.id}`}
            x1={node.x}
            y1={node.y + 40}
            x2={child.x}
            y2={child.y - 40}
            stroke="#94a3b8"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        );
      });

      // Recursively render children
      node.children.forEach(renderNodeConnections);
    };

    renderNodeConnections(treeData);

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '2000px', height: '2000px' }}
      >
        <g>
          {connections}
        </g>
      </svg>
    );
  }, [treeData]);

  // Render tree nodes
  const renderTreeNodes = useCallback((node: TreeNode, depth: number = 0): JSX.Element[] => {
    const nodes: JSX.Element[] = [];

    // Current node
    nodes.push(
      <FamilyTreeNode
        key={node.member.id}
        member={node.member}
        x={node.x}
        y={node.y}
        depth={depth}
        onClick={(e) => onNodeClick(node.member, e)}
        onRightClick={(e) => handleNodeRightClick(node.member, e)}
        onProfileView={onProfileView}
        onCircleView={onCircleView}
        onAddFamilyMember={onAddFamilyMember}
        onViewSpouse={onViewSpouse}
        onRelationshipDetails={onRelationshipDetails}
      />
    );

    // Children
    node.children.forEach(child => {
      nodes.push(...renderTreeNodes(child, depth + 1));
    });

    return nodes;
  }, [onNodeClick, handleNodeRightClick, onProfileView, onCircleView, onAddFamilyMember, onViewSpouse, onRelationshipDetails]);

  // Canvas bounds for minimap
  const canvasBounds = getCanvasBounds();

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Header Controls */}
      <Card className="absolute top-4 left-4 z-20 p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleZoom('in')}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleZoom('out')}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={resetView}
              title="Reset View"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant={showMinimap ? "default" : "outline"}
              onClick={() => setShowMinimap(!showMinimap)}
              title="Toggle Minimap"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              title="Export Tree"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Zoom:</span>
            <Badge variant="secondary">{Math.round(viewState.scale * 100)}%</Badge>
          </div>
        </div>

        {/* Zoom Slider */}
        <div className="mt-3">
          <Slider
            value={[viewState.scale]}
            onValueChange={([value]) => handleZoom(value)}
            min={0.3}
            max={3}
            step={0.1}
            className="w-48"
          />
        </div>
      </Card>

      {/* Statistics Panel */}
      <Card className="absolute top-4 right-4 z-20 p-4 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Statistik Pohon Keluarga</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Anggota:</span>
            <span className="font-medium">{members.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Generasi:</span>
            <span className="font-medium">4</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hubungan:</span>
            <span className="font-medium">{members.length - 1}</span>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="absolute bottom-4 left-4 z-20 p-3 shadow-lg max-w-sm">
        <h3 className="font-semibold text-sm mb-2 flex items-center">
          <Move className="h-4 w-4 mr-2" />
          Panduan Navigasi
        </h3>
        <ul className="text-xs space-y-1 text-muted-foreground">
          <li>• Scroll atau klik tombol zoom untuk zoom in/out</li>
          <li>• Klik dan drag untuk menggeser pohon</li>
          <li>• Klik kanan pada anggota untuk menu radial</li>
          <li>• Klik kiri pada anggota untuk detail</li>
        </ul>
      </Card>

      {/* Main Canvas Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-move"
        onMouseDown={handlePanStart}
        onMouseMove={handlePan}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <motion.div
          ref={canvasRef}
          className="relative"
          style={{
            width: '2000px',
            height: '2000px',
            transform: `translate(${viewState.position.x}px, ${viewState.position.y}px) scale(${viewState.scale})`,
            transformOrigin: '0 0',
            cursor: isDragging ? 'grabbing' : 'auto'
          }}
          animate={controls}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />

          {/* Tree Connections */}
          {renderConnections()}

          {/* Tree Nodes */}
          {treeData && renderTreeNodes(treeData)}
        </motion.div>
      </div>

      {/* Minimap */}
      {showMinimap && (
        <Card className="absolute bottom-4 right-4 z-20 p-2 shadow-lg">
          <div className="relative w-48 h-32 bg-gray-100 rounded">
            {/* Minimap content - simplified representation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs text-gray-500">Minimap</div>
            </div>

            {/* Viewport indicator */}
            <div
              className="absolute border-2 border-blue-500 bg-blue-500/20"
              style={{
                left: `${Math.abs(viewState.position.x) / canvasBounds.width * 100}%`,
                top: `${Math.abs(viewState.position.y) / canvasBounds.height * 100}%`,
                width: `${(window.innerWidth / canvasBounds.width) * 100 / viewState.scale}%`,
                height: `${(window.innerHeight / canvasBounds.height) * 100 / viewState.scale}%`
              }}
            />
          </div>
        </Card>
      )}

      {/* Radial Menu */}
      {selectedMember && (
        <RadialMenu
          member={selectedMember}
          position={menuPosition}
          isOpen={isMenuOpen}
          onClose={closeMenu}
          onProfileView={onProfileView}
          onCircleView={onCircleView}
          onAddFamilyMember={onAddFamilyMember}
          onViewSpouse={onViewSpouse}
          onRelationshipDetails={onRelationshipDetails}
        />
      )}
    </div>
  );
}