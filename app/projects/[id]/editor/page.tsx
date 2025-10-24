export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default async function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  // Redirect to the existing editor UI, passing the project id via query
  const { id } = await params;
  redirect(`/editor?project=${id}`);
}