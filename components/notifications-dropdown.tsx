"use client";

import { Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notificaciones de ejemplo
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Nuevo mensaje',
      message: 'Tienes un nuevo mensaje de Juan Pérez',
      time: 'Hace 5 minutos',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Recordatorio',
      message: 'Tienes una cita en 1 hora',
      time: 'Hace 1 hora',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Actualización del sistema',
      message: 'Nueva actualización disponible',
      time: 'Ayer',
      read: true
    }
  ];

  // Cerrar el dropdown al hacer clic fuera
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 relative"
      >
        <Bell className="h-5 w-5 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Notificaciones</h3>
              <button className="text-sm text-purple-600 hover:text-purple-700">
                Marcar todo como leído
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {notification.type === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {notification.type === 'warning' && (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      {notification.type === 'info' && (
                        <Info className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 h-2 w-2 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No hay notificaciones nuevas
              </div>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 text-center border-t border-gray-200">
            <a
              href="#"
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Ver todas las notificaciones
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
