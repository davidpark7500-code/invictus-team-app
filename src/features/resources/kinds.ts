import type { IconName } from '@/components/ui/Icon';
import type { ResourceKind } from '@/data/types';

export const KIND_ICON: Record<ResourceKind, IconName> = { pdf: 'pdf', audio: 'audio', video: 'video', link: 'globe' };
export const KIND_LABEL: Record<ResourceKind, string> = { pdf: 'PDF', audio: 'Audio', video: 'Video', link: 'Web link' };
