import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Wand2, Loader2, Download, Sparkles } from 'lucide-react';
import { editImage } from './services/gemini';

const LINKEDIN_PROMPT = `Use this photo as a faithful base for my face, maintaining my real characteristics (face shape, beard, hair, skin tone, and natural expressions).

Generate a professional LinkedIn photo with the following characteristics:
- Modern corporate style
- Appearance of a Data Engineer / Senior Tech Professional
- Confident expression, slight natural smile
- Upright posture, chest-up framing
- Soft and professional lighting (corporate studio style)
- Elegant neutral background (light gray, soft dark blue, or sophisticated blurred office)
- Clothing: well-fitted dress shirt (white, blue, or black) or modern minimalist blazer
- Clean appearance, skin slightly smoothed but maintaining natural texture (no exaggeration or artificial effect)
- High definition, realistic photographic quality (must not look like AI or caricature)
- Slight depth of field with blurred background
- Style similar to executive corporate profile photos in large tech companies

The image should convey: technical competence, intelligence, leadership, reliability, and strategic vision.

Avoid: artificial appearance, excessive sharpness, overly flashy background, AI-generated look, exaggerated skin editing.`;

export default function App() {
  const [originalImage, setOriginalImage] = useState<{ url: string; mimeType: string } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage({
        url: event.target?.result as string,
        mimeType: file.type,
      });
      setGeneratedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (prompt: string) => {
    if (!originalImage) return;
    
    const baseImage = generatedImage ? { url: generatedImage, mimeType: 'image/jpeg' } : originalImage;

    setIsGenerating(true);
    setError(null);
    try {
      const result = await editImage(baseImage.url, baseImage.mimeType, prompt);
      setGeneratedImage(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = 'linkedin-profile-pro.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-200">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">ProfilePro AI</h1>
          </div>
          <div className="text-sm text-neutral-500 font-medium hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 lg:mt-8">
        {/* Left Column: Upload & Original */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              1. Upload Base Photo
            </h2>
            
            {!originalImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center cursor-pointer hover:bg-neutral-50 hover:border-blue-400 transition-colors"
              >
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600 font-medium">Click to upload your photo</p>
                <p className="text-neutral-400 text-sm mt-1">JPG, PNG up to 5MB</p>
              </div>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 aspect-square flex items-center justify-center">
                <img 
                  src={originalImage.url} 
                  alt="Original" 
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-neutral-900 px-4 py-2 rounded-full font-medium text-sm hover:bg-neutral-100 transition-colors shadow-lg"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {originalImage && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-600" />
                2. Generate Profile
              </h2>
              <p className="text-neutral-600 text-sm mb-4">
                Transform your photo into a professional LinkedIn headshot using our optimized corporate prompt.
              </p>
              <button
                onClick={() => handleGenerate(LINKEDIN_PROMPT)}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isGenerating && !customPrompt ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Generate Professional Photo
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Result & Edits */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 min-h-[400px] lg:min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Result
              </h2>
              {generatedImage && (
                <button 
                  onClick={handleDownload}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>

            <div className="flex-1 relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-center min-h-[300px]">
              {isGenerating ? (
                <div className="flex flex-col items-center text-neutral-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
                  <p className="font-medium animate-pulse">Applying AI magic...</p>
                </div>
              ) : generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="Generated Profile" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-neutral-400 text-center p-6">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Your generated photo will appear here</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
          </div>

          {/* Custom Edit Section */}
          <div className={`bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 transition-opacity duration-300 ${(originalImage || generatedImage) ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">Custom Edits</h3>
            <p className="text-xs text-neutral-500 mb-3">
              Want to tweak the result? Try prompts like "Add a retro filter", "Make the background a busy cafe", or "Change shirt to black".
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter..."
                className="flex-1 border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customPrompt.trim()) {
                    handleGenerate(customPrompt);
                  }
                }}
              />
              <button
                onClick={() => handleGenerate(customPrompt)}
                disabled={isGenerating || !customPrompt.trim()}
                className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating && customPrompt ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
