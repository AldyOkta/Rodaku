import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AddPlaceholder() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/records/new');
  }, [router]);

  return null;
}
