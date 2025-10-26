'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Download, Eye, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

interface Image {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  status: string;
  blurScore?: number;
  faceCount?: number;
  faceSize?: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface ImageGalleryProps {
  refreshTrigger?: number;
}

export default function ImageGallery({ refreshTrigger }: ImageGalleryProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchImages = async (pageNum: number = 1, status: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        ...(status && { status }),
      });

      const response = await fetch(`/api/images?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch images');
      }

      setImages(data.images);
      setTotalPages(data.pagination.pages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(page, statusFilter);
  }, [page, statusFilter, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/images?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete image');
      }

      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleDownload = (image: Image) => {
    const link = document.createElement('a');
    link.href = image.downloadUrl;
    link.download = image.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Image Gallery</h2>
          
          {/* Status Filter */}
          <div className="mt-4 sm:mt-0">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="VALIDATED">Validated</option>
              <option value="REJECTED">Rejected</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Images Grid */}
        {images.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No images found</div>
            <p className="text-gray-400 mt-2">Upload some images to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img
                    src={image.downloadUrl}
                    alt={image.originalName}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(image.status)}`}>
                      {getStatusIcon(image.status)}
                      <span className="ml-1">{image.status}</span>
                    </span>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate" title={image.originalName}>
                    {image.originalName}
                  </h3>
                  
                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    <div>{image.width} × {image.height}</div>
                    <div>{(image.size / 1024 / 1024).toFixed(2)} MB</div>
                    <div>{new Date(image.createdAt).toLocaleDateString()}</div>
                    
                    {image.blurScore && (
                      <div>Blur Score: {image.blurScore.toFixed(2)}</div>
                    )}
                    {image.faceCount !== undefined && (
                      <div>Faces: {image.faceCount}</div>
                    )}
                    {image.faceSize && (
                      <div>Face Size: {(image.faceSize * 100).toFixed(1)}%</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(image)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">{selectedImage.originalName}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.downloadUrl}
                alt={selectedImage.originalName}
                className="max-w-full max-h-96 object-contain mx-auto"
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Size:</span> {selectedImage.width} × {selectedImage.height}
                </div>
                <div>
                  <span className="font-medium">File Size:</span> {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div>
                  <span className="font-medium">Format:</span> {selectedImage.mimeType}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedImage.status}
                </div>
                {selectedImage.blurScore && (
                  <div>
                    <span className="font-medium">Blur Score:</span> {selectedImage.blurScore.toFixed(2)}
                  </div>
                )}
                {selectedImage.faceCount !== undefined && (
                  <div>
                    <span className="font-medium">Faces:</span> {selectedImage.faceCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
