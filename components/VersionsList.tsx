'use client';

import { Clock, Check } from 'lucide-react';
import { ImageVersion } from '@/lib/supabase/image-sessions';

type VersionsListProps = {
  versions: ImageVersion[];
  currentVersion: number;
  onSelectVersion: (version: ImageVersion) => void;
};

export default function VersionsList({ 
  versions, 
  currentVersion, 
  onSelectVersion 
}: VersionsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
        <Clock className="h-5 w-5 text-banana" />
        Version History
      </h3>
      
      <div className="space-y-2">
        {versions.map((version) => {
          const isActive = version.version_number === currentVersion;
          
          return (
            <button
              key={version.id}
              onClick={() => onSelectVersion(version)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                isActive
                  ? 'bg-banana/20 border-banana shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-black/30">
                  <img 
                    src={version.image_url} 
                    alt={`Version ${version.version_number}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">
                      Version {version.version_number}
                    </span>
                    {isActive && (
                      <Check className="h-4 w-4 text-banana flex-shrink-0" />
                    )}
                  </div>
                  
                  {version.prompt && (
                    <p className="text-sm text-white/60 truncate mb-1">
                      {version.prompt}
                    </p>
                  )}
                  
                  <p className="text-xs text-white/40">
                    {formatDate(version.created_at)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {versions.length === 0 && (
        <div className="text-center py-8 text-white/50">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No version history yet</p>
        </div>
      )}
    </div>
  );
}
