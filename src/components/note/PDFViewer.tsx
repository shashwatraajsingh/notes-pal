"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon, FileIcon, EyeIcon } from "@phosphor-icons/react";
import { useState } from "react";

interface PDFViewerProps {
    pdfUrl: string;
    fileName?: string;
    title?: string;
}

export default function PDFViewer({ pdfUrl, fileName, title }: PDFViewerProps) {
    const [showEmbed, setShowEmbed] = useState(false);
    const displayName = fileName || title || "Document";

    return (
        <div className="my-8 rounded-lg border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
            {/* PDF Header */}
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                        <FileIcon className="h-6 w-6 text-red-600 dark:text-red-400" weight="duotone" />
                    </div>
                    <div>
                        <h3 className="font-bold text-black dark:text-white">{displayName}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">PDF Document</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEmbed(!showEmbed)}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:shadow-[2px_2px_0px_0px_#757373]"
                    >
                        <EyeIcon className="mr-2 h-4 w-4" />
                        {showEmbed ? "Hide Preview" : "View PDF"}
                    </Button>
                    <Button
                        asChild
                        size="sm"
                        className="border-2 border-black bg-black text-white shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:bg-zinc-800 hover:shadow-[3px_3px_0px_0px_#000] dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373]"
                    >
                        <a href={pdfUrl} download={displayName} target="_blank" rel="noopener noreferrer">
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download
                        </a>
                    </Button>
                </div>
            </div>

            {/* PDF Embed Preview */}
            {showEmbed && (
                <div className="mt-4 overflow-hidden rounded-lg border-2 border-black dark:border-white/20">
                    <iframe
                        src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                        className="h-[70vh] w-full min-h-[500px]"
                        title={displayName}
                    />
                </div>
            )}

            {/* Mobile-friendly message */}
            {showEmbed && (
                <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400 sm:hidden">
                    For best experience on mobile, use the Download button to open in your PDF viewer.
                </p>
            )}
        </div>
    );
}
