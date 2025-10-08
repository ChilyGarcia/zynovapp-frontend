"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";

type AIVIAPPModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AIVIAPPModal({ isOpen, onClose }: AIVIAPPModalProps) {
  const router = useRouter();

  const handleConfirm = () => {
    onClose();
    router.push("/aiviapp");
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center px-8 py-6">
          {/* Logo */}
          <div className="w-48 h-32 relative mb-4">
            <Image
              src="/icons/Icon-Aliviapp.png"
              alt="AIVIAPP"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-center text-[#0C0CAA] mb-4 w-full">
            ¿Estás seguro de que quieres abrir AIVIAPP?
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-6 text-center max-w-[300px]">
            Aliviapp es un software para poder agendar citas con especialistas,
            poder ver tus historiales medicoss y tener otro tipode beneficios y
            servicios.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 w-full justify-center">
            <Button
              onClick={onClose}
              className="flex-1 max-w-[120px] border border-[#0C0CAA] bg-white text-blue-600 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg text-base"
            >
              No
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 max-w-[120px] bg-[#0C0CAA] hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-base"
            >
              Sí
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
