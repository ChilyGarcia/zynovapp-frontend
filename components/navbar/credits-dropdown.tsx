'use client';

import { useState, useRef, useEffect } from 'react';
import { RefreshCw, Clock, Zap } from 'lucide-react';

interface CreditsDropdownProps {
  credits: number;
  status?: string;
}

export default function CreditsDropdown({ 
  credits = 330, 
  status = 'Activos' 
}: CreditsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleReload = () => {
    // Add reload credits logic here
    console.log('Recargar créditos');
    setIsOpen(false);
  };

  const handleHistory = () => {
    // Add view history logic here
    console.log('Ver historial de créditos');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="bg-gradient-to-r from-[#6A00F4] via-[#9B5DE5] to-[#F15BB5] hover:opacity-90 text-white rounded-full h-10 px-4 flex items-center gap-2 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">{credits} Créditos</span>
        <span className="text-[10px] uppercase bg-white/20 px-2 py-0.5 rounded-full">
          {status}
        </span>
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
          <button
            onClick={handleReload}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar créditos
          </button>
          <button
            onClick={handleHistory}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Historial de gastos
          </button>
        </div>
      )}
    </div>
  );
}
