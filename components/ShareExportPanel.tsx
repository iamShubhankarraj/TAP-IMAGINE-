'use client';

import { useState } from 'react';
import { Download, Share2, Copy, Check, Link as LinkIcon, Twitter, Facebook } from 'lucide-react';

type ShareExportPanelProps = {
  imageUrl: string;
  imageName: string;
  shareUrl?: string;
  onGenerateShareLink: () => Promise<string>;
};

export default function ShareExportPanel({ 
  imageUrl, 
  imageName,
  shareUrl: initialShareUrl,
  onGenerateShareLink
}: ShareExportPanelProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(initialShareUrl || null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName || 'edited-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  const handleGenerateShareLink = async () => {
    setIsGenerating(true);
    try {
      const url = await onGenerateShareLink();
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy link');
    }
  };

  const handleShareToTwitter = () => {
    if (!shareUrl) return;
    const text = 'Check out my edited image from TAP[IMAGINE]!';
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareToFacebook = () => {
    if (!shareUrl) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
        <Share2 className="h-5 w-5 text-banana" />
        Share & Export
      </h3>

      {/* Download Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/80">Download</h4>
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-banana text-gray-900 font-medium rounded-lg hover:bg-banana-light transition-colors"
        >
          <Download className="h-5 w-5" />
          Download Image
        </button>
        
        <div className="text-xs text-white/50 text-center">
          Downloads as high-quality PNG
        </div>
      </div>

      {/* Share Link Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/80">Share Link</h4>
        
        {!shareUrl ? (
          <button
            onClick={handleGenerateShareLink}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
          >
            <LinkIcon className="h-5 w-5" />
            {isGenerating ? 'Generating...' : 'Generate Share Link'}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-banana"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-white transition-colors"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-400">Link copied to clipboard!</p>
            )}
          </div>
        )}
      </div>

      {/* Social Share */}
      {shareUrl && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/80">Share On Social</h4>
          <div className="flex gap-2">
            <button
              onClick={handleShareToTwitter}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] rounded-lg text-white text-sm font-medium transition-colors"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </button>
            <button
              onClick={handleShareToFacebook}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#4267B2] hover:bg-[#365899] rounded-lg text-white text-sm font-medium transition-colors"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </button>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="space-y-3 pt-3 border-t border-white/10">
        <h4 className="text-sm font-medium text-white/80">Export Options</h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white transition-colors">
            As JPEG
          </button>
          <button className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white transition-colors">
            As WebP
          </button>
          <button className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white transition-colors">
            High Quality
          </button>
          <button className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white transition-colors">
            Compressed
          </button>
        </div>
      </div>
    </div>
  );
}
