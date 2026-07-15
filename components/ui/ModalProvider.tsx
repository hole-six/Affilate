"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, AlertCircle, Info, HelpCircle } from "lucide-react";
import { Button } from "./Button";

type ModalType = "alert" | "confirm";

interface ModalOptions {
  title: string;
  message: ReactNode;
  type?: ModalType;
  iconType?: "danger" | "info" | "warning" | "success";
  confirmText?: string;
  cancelText?: string;
}

interface ModalContextType {
  alert: (options: Omit<ModalOptions, "type">) => Promise<void>;
  confirm: (options: Omit<ModalOptions, "type">) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [resolver, setResolver] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const alert = useCallback((opts: Omit<ModalOptions, "type">) => {
    return new Promise<void>((resolve) => {
      setOptions({ ...opts, type: "alert" });
      setResolver({ resolve: () => resolve() });
      setIsOpen(true);
    });
  }, []);

  const confirm = useCallback((opts: Omit<ModalOptions, "type">) => {
    return new Promise<boolean>((resolve) => {
      setOptions({ ...opts, type: "confirm" });
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(value);
      setResolver(null);
    }
  };

  const getIcon = () => {
    switch (options?.iconType) {
      case "danger":
        return <AlertCircle className="text-red-500" size={32} strokeWidth={1.5} />;
      case "warning":
        return <HelpCircle className="text-amber-500" size={32} strokeWidth={1.5} />;
      case "success":
        return <img src="/heochaomung.png" alt="" className="h-14 w-14 object-contain" />;
      default:
        return <Info className="text-sky-500" size={32} strokeWidth={1.5} />;
    }
  };

  return (
    <ModalContext.Provider value={{ alert, confirm }}>
      {children}
      
      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => handleClose(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => handleClose(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="flex flex-col items-center text-center gap-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                {getIcon()}
              </div>
              <div>
                <h3 className="text-[18px] font-black text-gray-900 leading-tight mb-xs">
                  {options.title}
                </h3>
                <div className="text-[14px] text-gray-500 leading-relaxed">
                  {options.message}
                </div>
              </div>
            </div>

            <div className="mt-xl flex items-center gap-sm">
              {options.type === "confirm" && (
                <Button 
                  variant="tertiary" 
                  className="flex-1"
                  onClick={() => handleClose(false)}
                >
                  {options.cancelText || "Hủy bỏ"}
                </Button>
              )}
              <Button 
                variant={options.iconType === "danger" ? "danger" : "primary"}
                className="flex-1"
                onClick={() => handleClose(true)}
              >
                {options.confirmText || "Đồng ý"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
