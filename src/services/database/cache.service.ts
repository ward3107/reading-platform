import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTION_NAMES } from './collection-names';
import { getDatabase, handleDatabaseError } from './base.service';
import type { Story } from '../../types';

const CONTENT_CACHE_COLLECTION = COLLECTION_NAMES.CONTENT_CACHE;
const STORIES_CACHE_DOCUMENT_ID = 'stories';

const CACHE_VERSION = '1.0';

interface CachedStories {
  content: Story[];
  cachedAt: Date;
  version: string;
}

export async function cacheStories(stories: Story[]): Promise<void> {
  try {
    const database = getDatabase();

    const cacheReference = doc(
      database,
      CONTENT_CACHE_COLLECTION,
      STORIES_CACHE_DOCUMENT_ID
    );

    await setDoc(cacheReference, {
      content: stories,
      cachedAt: serverTimestamp(),
      version: CACHE_VERSION
    });
  } catch (error) {
    handleDatabaseError('cache stories', error);
  }
}

export async function retrieveCachedStories(): Promise<CachedStories | null> {
  try {
    const database = getDatabase();

    const cacheReference = doc(
      database,
      CONTENT_CACHE_COLLECTION,
      STORIES_CACHE_DOCUMENT_ID
    );
    const cacheSnapshot = await getDoc(cacheReference);

    if (!cacheSnapshot.exists()) {
      return null;
    }

    return cacheSnapshot.data() as CachedStories;
  } catch (error) {
    handleDatabaseError('retrieve cached stories', error);
  }
}
