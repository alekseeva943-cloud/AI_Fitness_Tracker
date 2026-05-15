
import React from 'react';
import { UserProfile } from '../../../types';
import { User, Camera } from 'lucide-react';

interface ProfileAvatarProps {
  profile: UserProfile;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ profile }) => {
  return (
    <div className="relative group">
       <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-linear-to-br from-primary/30 to-primary/10 border-4 border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl">
          <User className="w-16 h-16 md:w-20 md:h-20 text-primary/80" />
          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
       </div>
       <button className="absolute bottom-2 right-2 p-3 bg-primary text-black rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-black">
          <Camera className="w-5 h-5" />
       </button>
       
       {/* Animated rings */}
       <div className="absolute -inset-4 border border-primary/20 rounded-[3rem] animate-pulse-slow -z-10" />
       <div className="absolute -inset-8 border border-primary/10 rounded-[3.5rem] animate-pulse-slow delay-700 -z-20" />
    </div>
  );
};
