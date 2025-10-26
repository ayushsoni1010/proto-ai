import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Mock validation - in a real app, this would use the backend
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, and HEIC images are allowed.",
        },
        { status: 400 }
      );
    }

    // Mock file size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File too large. Maximum size is 10MB.",
        },
        { status: 400 }
      );
    }

    // Mock image processing and validation
    const mockImage = {
      id: `img_${Date.now()}`,
      filename: `${Date.now()}-${file.name}`,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      width: 1920, // Mock dimensions
      height: 1080,
      status: "VALIDATED",
      blurScore: 150.5,
      faceCount: 1,
      faceSize: 0.15,
      downloadUrl: URL.createObjectURL(file), // Mock download URL
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      image: mockImage,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
