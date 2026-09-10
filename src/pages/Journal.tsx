import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  getJournalCategories,
  getJournalPosts,
  type JournalCategory,
  type JournalPagination,
  type JournalPostSummary,
} from '@/api/journal'
import { JournalCard } from '@/components/journal/JournalCard'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 9

export function Journal() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [categories, setCategories] = useState<JournalCategory[]>([])
  const [posts, setPosts] = useState<JournalPostSummary[]>([])
  const [pagination, setPagination] = useState<JournalPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getJournalCategories(controller.signal)
      .then(({ categories }) => setCategories(categories))
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'Could not load categories.')
        }
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void getJournalPosts(
      { page, limit: PAGE_SIZE, category: selectedCategory || undefined },
      controller.signal,
    )
      .then(({ posts, pagination }) => {
        setPosts(posts)
        setPagination(pagination)
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'Could not load stories.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [page, selectedCategory])

  const selectCategory = (category: string) => {
    setIsLoading(true)
    setError(null)
    const next = new URLSearchParams()
    if (category) next.set('category', category)
    setSearchParams(next)
  }

  const selectPage = (nextPage: number) => {
    setIsLoading(true)
    setError(null)
    const next = new URLSearchParams(searchParams)
    if (nextPage > 1) next.set('page', String(nextPage))
    else next.delete('page')
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-cream pb-24 pt-4 sm:pt-6 lg:pt-8">
      <header className="mx-auto max-w-6xl px-6 text-center lg:px-10">
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-flame">
          From the kitchen table
        </span>
        <h1 className="mt-4 font-display text-5xl font-bold text-cocoa sm:text-7xl">The Journal</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cocoa/65 sm:text-lg">
          Recipes, drop notes, collaborations and stories from behind the counter.
        </p>
      </header>

      <main className="mx-auto mt-12 max-w-6xl px-6 lg:px-10">
        {categories.length ? (
          <div className="mb-10 flex flex-wrap justify-center gap-2" aria-label="Filter Journal by category">
            <button
              className={cn(
                'rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors',
                !selectedCategory
                  ? 'border-flame bg-flame text-cream'
                  : 'border-cocoa/15 text-cocoa hover:border-flame',
              )}
              onClick={() => selectCategory('')}
            >
              All stories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={cn(
                  'rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors',
                  selectedCategory === category.slug
                    ? 'border-flame bg-flame text-cream'
                    : 'border-cocoa/15 text-cocoa hover:border-flame',
                )}
                onClick={() => selectCategory(category.slug)}
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : null}

        {isLoading ? (
          <p className="py-20 text-center font-semibold text-cocoa/55">Loading stories…</p>
        ) : error ? (
          <div className="rounded-[2rem] border-2 border-flame/20 bg-white p-10 text-center">
            <p className="font-semibold text-flame">{error}</p>
            <Button className="mt-5" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-cocoa/10 bg-white p-12 text-center">
            <h2 className="font-display text-3xl font-bold text-cocoa">Fresh stories are on the way.</h2>
            <p className="mt-3 text-cocoa/60">Check back soon for notes from the Sour Lemon kitchen.</p>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => <JournalCard key={post.id} post={post} />)}
          </div>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <nav className="mt-12 flex items-center justify-center gap-6" aria-label="Journal pages">
            <Button
              variant="outline"
              accent="cocoa"
              disabled={page <= 1}
              onClick={() => selectPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm font-bold text-cocoa/60">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              accent="cocoa"
              disabled={page >= pagination.totalPages}
              onClick={() => selectPage(page + 1)}
            >
              Next
            </Button>
          </nav>
        ) : null}
      </main>
    </div>
  )
}
