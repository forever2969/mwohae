import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/ui/BottomNav'
import { NavigationLoader } from '@/components/ui/NavigationLoader'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBFC]">
      <NavigationLoader />
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
