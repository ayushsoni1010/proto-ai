"use client";

import React, { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const uploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, "Please select a file"),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadedImage {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  width: number;
  height: number;
  status: string;
  downloadUrl: string;
  createdAt: string;
}

interface ImageUploadProps {
  onUploadComplete?: (image: UploadedImage) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export default function ImageUpload({
  onUploadComplete,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ["image/jpeg", "image/png", "image/heic"],
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const selectedFile = watch("file");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setErrors([`Invalid file type. Allowed: ${allowedTypes.join(", ")}`]);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setErrors([
        `File too large. Maximum size: ${Math.round(
          maxFileSize / 1024 / 1024
        )}MB`,
      ]);
      return;
    }

    setErrors([]);
    reset({ file });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3001/api/images/upload", {
        // Use your backend on port 3001
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Return the image data directly from your backend
      return result.image;
    } catch (error) {
      throw error;
    }
  };

  const uploadFileChunked = async (file: File) => {
    // For demo purposes, just use regular upload
    // In a real app, this would implement chunked upload
    return await uploadFile(file);
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!data.file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrors([]);

    try {
      let image: UploadedImage;

      // Use chunked upload for large files (>5MB)
      if (data.file.size > 5 * 1024 * 1024) {
        image = await uploadFileChunked(data.file);
      } else {
        image = await uploadFile(data.file);
      }

      setUploadedImages((prev) => [image, ...prev]);
      onUploadComplete?.(image);
      reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setErrors([errorMessage]);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(",")}
            className="hidden"
            onChange={handleFileInputChange}
          />

          <Upload className="mx-auto h-12 w-12 text-gray-400" />

          <div className="mt-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-lg font-medium text-gray-900">
                {selectedFile
                  ? selectedFile.name
                  : "Click to upload or drag and drop"}
              </span>
              <p className="text-sm text-gray-500 mt-1">
                {allowedTypes.join(", ").toUpperCase()} up to{" "}
                {Math.round(maxFileSize / 1024 / 1024)}MB
              </p>
            </label>
          </div>

          {selectedFile && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => reset()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Upload failed
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!selectedFile || isUploading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Uploading...
              </>
            ) : (
              "Upload Image"
            )}
          </button>
        </div>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Uploaded Images
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={image.downloadUrl}
                      alt={image.originalName}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {image.originalName}
                      </h4>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        {image.width} × {image.height}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(image.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(image.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
