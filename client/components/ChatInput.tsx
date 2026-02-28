"use client";

import { useRef, useEffect, KeyboardEvent, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

interface Props {
    value: string;
    onChange: (val: string) => void;
    onSend: () => void;
    disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useClickOutside(dropdownRef, () => setShowDropdown(false));
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    // Auto-resize the textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, [value, images]);

    // Handle image selection
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remainingCount = 10 - images.length;
        const newFiles = files.slice(0, remainingCount);

        if (newFiles.length > 0) {
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...newFiles]);
            setPreviews(prev => [...prev, ...newPreviews]);
        }

        setShowDropdown(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Remove image
    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim()) onSend();
        }
    };

    return (
        <div className="flex flex-col w-full relative">
            <div className="relative flex flex-col bg-[#2f2f2f]/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl border border-white/10 ring-1 ring-white/5 transition-all focus-within:ring-emerald-500/30 focus-within:border-emerald-500/30">
                {/* Image Preview Area - Integrated Inside */}
                {previews.length > 0 && (
                    <div className="w-full pt-3 pb-2 px-3 md:px-4  rounded-t-2xl md:rounded-t-3xl overflow-hidden border-b border-white/5">
                        <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-thin pb-2 scroll-px-3 md:scroll-px-4">
                            {previews.map((url, i) => (
                                <div key={url} className="relative group shrink-0 snap-start">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-white/10 shadow-md">
                                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                    >
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {/* Extra spacer for end padding in scroll */}
                            {/* <div className="shrink-0 w-1 md:w-2" /> */}
                        </div>
                    </div>
                )}

                <div className="flex items-end gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 relative">
                    {/* Plus Button and Dropdown */}
                    <div className="relative shrink-0 mb-1" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            disabled={disabled || images.length >= 10}
                            className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </button>

                        {showDropdown && (
                            <div className="absolute bottom-full left-0 mb-3 z-50">
                                <div className="relative w-48 bg-[#2f2f2f] border border-white/10 rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-bottom-2 duration-200 ring-1 ring-black/20 overflow-hidden">
                                    <button
                                        onClick={() => {
                                            fileInputRef.current?.click();
                                            setShowDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                        </svg>
                                        Subir imagen
                                    </button>
                                    <div className="px-4 py-1.5 text-[10px] text-gray-500 border-t border-white/5 bg-black/5">
                                        {images.length}/10 imágenes
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                    />

                    <textarea
                        ref={textareaRef}
                        className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm md:text-base leading-relaxed min-h-[40px] max-h-[160px] py-2 px-1 custom-scrollbar"
                        placeholder="Escribe un mensaje..."
                        rows={1}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                    />

                    <button
                        onClick={onSend}
                        disabled={disabled || (!value.trim() && images.length === 0)}
                        className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white text-black flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed transition-all duration-200 active:scale-90 shadow-lg shadow-black/20"
                        aria-label="Enviar mensaje"
                    >
                        {disabled ? (
                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
