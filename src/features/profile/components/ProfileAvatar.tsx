
import React from 'react';
import { UserProfile } from '../../../types';
import { User, Camera } from 'lucide-react';

interface ProfileAvatarProps {
  profile: UserProfile;
  onAvatarChange?: (url: string) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ profile, onAvatarChange }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Файл слишком большой. Пожалуйста, выберите изображение до 2 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onAvatarChange?.(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative group">
       <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
       />
       <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-linear-to-br from-primary/30 to-primary/10 border-4 border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl cursor-pointer"
       >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 md:w-20 md:h-20 text-primary/80" />
          )}
          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Camera className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
       </div>
       <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-2 right-2 p-3 bg-primary text-black rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-black z-10"
       >
          <Camera className="w-5 h-5" />
       </button>
       
       {/* Animated rings */}
       <div className="absolute -inset-4 border border-primary/20 rounded-[3rem] animate-pulse-slow -z-10" />
       <div className="absolute -inset-8 border border-primary/10 rounded-[3.5rem] animate-pulse-slow delay-700 -z-20" />
    </div>
  );
};
