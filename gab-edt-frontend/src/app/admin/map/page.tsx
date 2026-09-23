"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function AdminMapPage() {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const loadTree = async () => {
      try {
        const treeData = await fetchWithAuth('/resources/tree');
        
        const newNodes: any[] = [];
        const newEdges: any[] = [];
        const yOffset = 0;
        const xOffsetCampus = 100;
        
        if (treeData && treeData.campuses) {
          treeData.campuses.forEach((campus: any, cIdx: number) => {
            const campusNodeId = `c-${campus.id}`;
            newNodes.push({
              id: campusNodeId,
              data: { label: `🏢 ${campus.name}` },
              position: { x: xOffsetCampus + (cIdx * 500), y: yOffset },
              style: { background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold', borderRadius: '8px' }
            });
            
            if (campus.departments) {
              campus.departments.forEach((dept: any, dIdx: number) => {
                const deptNodeId = `d-${dept.id}`;
                newNodes.push({
                  id: deptNodeId,
                  data: { label: `📁 ${dept.name}` },
                  position: { x: xOffsetCampus + (cIdx * 500) + (dIdx * 200) - 100, y: yOffset + 150 },
                  style: { background: 'var(--bg-secondary)', border: '2px solid var(--accent-primary)', borderRadius: '8px' }
                });
                
                newEdges.push({
                  id: `e-${campusNodeId}-${deptNodeId}`,
                  source: campusNodeId,
                  target: deptNodeId,
                  animated: true,
                  markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent-primary)' },
                  style: { stroke: 'var(--accent-primary)', strokeWidth: 2 }
                });

                if (dept.programs) {
                  dept.programs.forEach((prog: any, pIdx: number) => {
                    const progNodeId = `p-${prog.id}`;
                    newNodes.push({
                      id: progNodeId,
                      data: { label: `🎓 ${prog.name}` },
                      position: { x: xOffsetCampus + (cIdx * 500) + (dIdx * 200) - 100 + (pIdx * 150) - 75, y: yOffset + 300 },
                      style: { background: 'var(--bg-tertiary)', borderRadius: '8px' }
                    });

                    newEdges.push({
                      id: `e-${deptNodeId}-${progNodeId}`,
                      source: deptNodeId,
                      target: progNodeId,
                      style: { stroke: '#888' }
                    });
                  });
                }
              });
            }
          });
        }
        
        setNodes(newNodes as any);
        setEdges(newEdges as any);
      } catch (error) {
        console.error("Failed to load map data", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTree();
  }, []);

  const onConnect = useCallback((params: any) => setEdges((eds: any) => addEdge(params, eds) as any), [setEdges]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Chargement de la carte...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-[calc(100vh-100px)] pt-8"
    >
      <div className="px-8">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cartographie de l&apos;Organisation</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Visualisation nodale propulsée par ReactFlow</p>
      </div>
      
      <div style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: '16px', margin: '0 2rem 2rem 2rem', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--box-shadow)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-right"
        >
          <Controls />
          <MiniMap nodeStrokeColor={(n) => {
              if (n.style?.background === 'var(--accent-primary)') return '#0070f3';
              return '#eee';
            }} 
            nodeColor={(n) => {
              if (n.style?.background === 'var(--accent-primary)') return '#0070f3';
              return '#fff';
            }} 
          />
          <Background color="#ccc" gap={16} />
        </ReactFlow>
      </div>
    </motion.div>
  );
}
