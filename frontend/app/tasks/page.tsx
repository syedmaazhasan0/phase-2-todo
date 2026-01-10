import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export const metadata = {
  title: 'My Tasks | Todo App',
  description: 'Manage your personal task list',
};

export default async function TasksPage() {
  const session = await getSession();
  const user = session?.data?.user;

  // Redirect all users to home page
  // Auth tasks are now on the home page
  redirect('/');
}
