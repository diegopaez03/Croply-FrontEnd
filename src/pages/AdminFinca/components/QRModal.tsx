import { useEffect, useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Download01Icon } from '@hugeicons/core-free-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import html2canvas from 'html2canvas';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  nombreParcela: string;
}

export function QRModal({ isOpen, onClose, url, nombreParcela }: QRModalProps) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFlipped(false);
      const timer = setTimeout(() => setFlipped(true), 50);
      return () => clearTimeout(timer);
    } else {
      setFlipped(false);
    }
  }, [isOpen]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      // Configuramos options para html2canvas para asegurar la mejor calidad
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: 'bg-card', // Fondo blanco garantizado
        scale: 3, // Alta resolución
        useCORS: true,
        logging: false
      });
      
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${nombreParcela.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error al descargar el QR:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm flex flex-col items-center p-8 bg-card">
        <DialogHeader className="text-center w-full">
          <DialogTitle className="text-2xl font-bold text-center">Código QR de Parcela</DialogTitle>
          <DialogDescription className="text-center mt-2">
            Escanea este código para acceder rápidamente a los detalles de la parcela desde cualquier dispositivo móvil.
          </DialogDescription>
        </DialogHeader>

        <div 
          className="w-full flex justify-center py-4 perspective-1000" 
          style={{ perspective: '1000px' }}
        >
          <div 
            ref={cardRef}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl"
            style={{ 
              transform: flipped ? 'rotateY(0deg)' : 'rotateY(90deg)', 
              opacity: flipped ? 1 : 0, 
              transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out',
              transformStyle: 'preserve-3d',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            <QRCodeCanvas 
              value={url} 
              size={200}
              level={"H"}
              includeMargin={false}
            />
            <p className="mt-6 font-extrabold text-black text-xl tracking-tight text-center break-words">
              {nombreParcela}
            </p>
          </div>
        </div>

        <Button onClick={handleDownload} className="w-full sm:w-auto px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl mt-2">
          <HugeiconsIcon icon={Download01Icon} className="size-4 mr-2" />
          Descargar Tarjeta
        </Button>
      </DialogContent>
    </Dialog>
  );
}
