import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <AdminContext.Provider value={{ 
      isEditMode, 
      setIsEditMode, 
      isUploading, 
      setIsUploading 
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    // Return default values if not within provider (for non-admin pages)
    return {
      isEditMode: false,
      setIsEditMode: () => {},
      isUploading: false,
      setIsUploading: () => {},
    };
  }
  return context;
};
