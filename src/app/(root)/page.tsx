"use client";

import { useState } from "react";
import ImageUpload from "@/components/image-upload";
import ImageGallery from "@/components/image-gallery";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl" role="img" aria-label="Artist Palette">
                🎨
              </span>
              <h1 className="text-3xl font-bold text-gray-900">
                Proto AI - Image Upload System
              </h1>
            </div>
            <p className="mt-2 text-lg text-gray-600">
              Upload and validate images with advanced processing and security
              features
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Upload New Image
              </h2>
              <ImageUpload onUploadComplete={handleUploadComplete} />
            </div>
          </div>

          {/* Gallery Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <ImageGallery refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
