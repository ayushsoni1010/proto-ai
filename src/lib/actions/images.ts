'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Image, ApiResponse, PaginatedResponse } from '@/types/entities';

export async function getImages(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Image>> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      success: false,
      error: 'Unauthorized',
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 }
    };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: images, error, count } = await supabase
    .from('images')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return {
      success: false,
      error: error.message,
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 }
    };
  }

  const totalPages = Math.ceil((count || 0) / limit);

  return {
    success: true,
    data: images || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages
    }
  };
}

export async function deleteImage(imageId: string): Promise<ApiResponse> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', imageId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/images');
  return { success: true, message: 'Image deleted successfully' };
}

export async function updateImageMetadata(
  imageId: string,
  metadata: Record<string, any>
): Promise<ApiResponse<Image>> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('images')
    .update({ metadata })
    .eq('id', imageId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/images');
  return { success: true, data };
}
