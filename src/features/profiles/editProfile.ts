import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

/** Fields an admin can change on a team profile. */
export type ProfileEdits = {
  first_names: string;
  last_name: string;
  pin: string;
  founders: boolean;
  qualifying: boolean;
  bio: string;
  photo_url: string | null;
};

export type PhotoResult = { status: 'uploaded'; url: string } | { status: 'cancelled' } | { status: 'error'; message: string };

const PHOTO_WIDTH = 900;

/**
 * Pick a photo from the library (or a file on a computer), shrink it to a sensible
 * size, upload it to the public "team-photos" bucket and return its address.
 * The profile itself only changes when the admin taps Save.
 */
export async function pickAndUploadPhoto(profileSlug: string): Promise<PhotoResult> {
  if (!supabase) return { status: 'error', message: 'Not connected to the server.' };

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (picked.canceled || !picked.assets?.[0]) return { status: 'cancelled' };

  try {
    const rendered = await ImageManipulator.manipulate(picked.assets[0].uri).resize({ width: PHOTO_WIDTH }).renderAsync();
    const saved = await rendered.saveAsync({ compress: 0.82, format: SaveFormat.JPEG, base64: true });
    if (!saved.base64) throw new Error('no image data');

    // A new name per upload, so phones never show a cached older photo.
    const path = `${profileSlug}/${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('team-photos')
      .upload(path, base64ToBytes(saved.base64), { contentType: 'image/jpeg', upsert: false });
    if (error) return { status: 'error', message: error.message };

    const { data } = supabase.storage.from('team-photos').getPublicUrl(path);
    return { status: 'uploaded', url: data.publicUrl };
  } catch {
    return { status: 'error', message: 'Couldn’t prepare that photo. Try a different one.' };
  }
}

/** Save an admin's changes to a team profile. Everyone sees them the next time they open the app. */
export async function saveProfile(profileSlug: string, edits: ProfileEdits): Promise<string | null> {
  if (!supabase) return 'Not connected to the server.';
  const { data, error } = await supabase.from('team_profiles').update(edits).eq('slug', profileSlug).select('slug');
  if (error) return error.message;
  if (!data?.length) return 'Only admins can edit profiles.';
  return null;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
