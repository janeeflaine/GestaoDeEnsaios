import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import getCroppedImg from '../utils/image';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
}

const ImageCropperModal: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleDone = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[600px]">
                <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">Cortar Imagem</h3>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Ajuste sua foto de perfil</p>
                    </div>
                    <button onClick={onCancel} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="relative flex-grow bg-slate-100">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                        cropShape="rect"
                        showGrid={true}
                    />
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomOut size={18} className="text-slate-400" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-grow h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <ZoomIn size={18} className="text-slate-400" />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={handleDone}
                            className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-indigo-700"
                        >
                            <Check size={20} /> CONFIRMAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;
