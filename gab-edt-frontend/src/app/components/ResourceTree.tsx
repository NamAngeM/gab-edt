import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface ResourceItem {
  id: string;
  name: string;
  resourceType: string;
}

interface OrgUnitNode {
  id: string;
  name: string;
  type: string;
  children?: OrgUnitNode[];
  resources?: ResourceItem[];
}

export const RecursiveTree = ({ node, level = 0 }: { node: OrgUnitNode, level?: number }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'CAMPUS': return '🏢';
      case 'FACULTY': return '🏛️';
      case 'DEPARTMENT': return '📁';
      case 'PROGRAM': return '🎓';
      case 'CYCLE': return '🔄';
      case 'YEAR': return '📅';
      case 'LEVEL': return '📘';
      case 'SERIES': return '🔠';
      case 'CLASS': return '🏫';
      case 'GROUP': return '👥';
      case 'OPTION': return '⚙️';
      case 'SPECIALTY': return '🔬';
      default: return '📍';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'TEACHER': return '👨‍🏫';
      case 'ROOM': return '🚪';
      default: return '📌';
    }
  };

  return (
    <div style={{ marginLeft: `${level > 0 ? 1.5 : 0}rem`, marginTop: '0.2rem' }}>
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0',
        fontWeight: level === 0 ? 600 : 500, color: 'var(--text-primary)', fontSize: `${1 - level * 0.05}rem` 
      }}>
        {getIcon(node.type)} {node.name}
      </div>

      {node.resources && node.resources.length > 0 && (
        <div style={{ marginLeft: '1.5rem', marginTop: '0.2rem' }}>
          <AnimatePresence>
            {node.resources.map((res: ResourceItem, i: number) => (
              <motion.div 
                key={res.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0', marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
              >
                {getResourceIcon(res.resourceType)} {res.name}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {node.children?.map(child => (
        <RecursiveTree key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );
};
