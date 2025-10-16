import { supabase } from './client';

export type ImageSession = {
  id: string;
  user_id: string;
  session_name?: string;
  created_at: string;
  updated_at: string;
  original_image_url: string;
  original_image_name?: string;
  generated_image_url?: string;
  generated_image_name?: string;
  reference_images?: Array<{ url: string; name: string }>;
  prompt?: string;
  aspect_ratio?: string;
  adjustments?: Record<string, number>;
  metadata?: Record<string, any>;
  version: number;
  parent_session_id?: string;
  is_public: boolean;
  share_token?: string;
};

export type ImageVersion = {
  id: string;
  session_id: string;
  version_number: number;
  image_url: string;
  prompt?: string;
  adjustments?: Record<string, number>;
  created_at: string;
};

export async function createImageSession(sessionData: {
  original_image_url: string;
  original_image_name?: string;
  generated_image_url?: string;
  generated_image_name?: string;
  reference_images?: Array<{ url: string; name: string }>;
  prompt?: string;
  aspect_ratio?: string;
  adjustments?: Record<string, number>;
  metadata?: Record<string, any>;
  session_name?: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('image_sessions')
      .insert({
        user_id: user.id,
        ...sessionData,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as ImageSession, error: null };
  } catch (error) {
    console.error('Error creating image session:', error);
    return { data: null, error };
  }
}

export async function updateImageSession(
  sessionId: string,
  updates: Partial<Omit<ImageSession, 'id' | 'user_id' | 'created_at'>>
) {
  try {
    const { data, error } = await supabase
      .from('image_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as ImageSession, error: null };
  } catch (error) {
    console.error('Error updating image session:', error);
    return { data: null, error };
  }
}

export async function getImageSession(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('image_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    return { data: data as ImageSession, error: null };
  } catch (error) {
    console.error('Error fetching image session:', error);
    return { data: null, error };
  }
}

export async function getUserImageSessions(limit = 20, offset = 0) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('image_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data: data as ImageSession[], error: null };
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return { data: null, error };
  }
}

export async function deleteImageSession(sessionId: string) {
  try {
    const { error } = await supabase
      .from('image_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error deleting image session:', error);
    return { error };
  }
}

export async function createImageVersion(versionData: {
  session_id: string;
  version_number: number;
  image_url: string;
  prompt?: string;
  adjustments?: Record<string, number>;
}) {
  try {
    const { data, error } = await supabase
      .from('image_versions')
      .insert(versionData)
      .select()
      .single();

    if (error) throw error;

    return { data: data as ImageVersion, error: null };
  } catch (error) {
    console.error('Error creating image version:', error);
    return { data: null, error };
  }
}

export async function getSessionVersions(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('image_versions')
      .select('*')
      .eq('session_id', sessionId)
      .order('version_number', { ascending: true });

    if (error) throw error;

    return { data: data as ImageVersion[], error: null };
  } catch (error) {
    console.error('Error fetching session versions:', error);
    return { data: null, error };
  }
}

export async function generateShareToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export async function shareImageSession(sessionId: string) {
  try {
    const shareToken = await generateShareToken();
    
    const { data, error } = await supabase
      .from('image_sessions')
      .update({ 
        is_public: true,
        share_token: shareToken 
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    return { 
      data: data as ImageSession, 
      shareUrl: `${window.location.origin}/results/${shareToken}`,
      error: null 
    };
  } catch (error) {
    console.error('Error sharing image session:', error);
    return { data: null, shareUrl: null, error };
  }
}

export async function getSessionByShareToken(shareToken: string) {
  try {
    const { data, error } = await supabase
      .from('image_sessions')
      .select('*')
      .eq('share_token', shareToken)
      .eq('is_public', true)
      .single();

    if (error) throw error;

    return { data: data as ImageSession, error: null };
  } catch (error) {
    console.error('Error fetching session by share token:', error);
    return { data: null, error };
  }
}
