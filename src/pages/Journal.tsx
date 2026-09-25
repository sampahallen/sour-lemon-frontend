import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  getJournalCategories,
  getJournalPosts,
  type JournalCategory,
  type JournalPagination,
  type JournalPostSummary,
} from '@/api/journal'
import { Sparkle, Squiggle, Star } from '@/assets/doodles/doodleIcons'
import { JournalIllustration } from '@/assets/illustrations/JournalIllustration'
import { JournalCard } from '@/components/journal/JournalCard'
import { Button } from '@/components/ui/Button'
import { LemonPrintBackdrop } from '@/components/ui/LemonPrintBackdrop'
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
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [postsError, setPostsError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getJournalCategories(controller.signal)
      .then(({ categories }) => setCategories(categories))
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setCategoryError(caught instanceof Error ? caught.message : 'Could not load categories.')
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
          setPostsError(caught instanceof Error ? caught.message : 'Could not load stories.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [page, selectedCategory])

  const selectCategory = (category: string) => {
    setIsLoading(true)
    setPostsError(null)
    const next = new URLSearchParams()
    if (category) next.set('category', category)
    setSearchParams(next)
  }

  const selectPage = (nextPage: number) => {
    setIsLoading(true)
    setPostsError(null)
    const next = new URLSearchParams(searchParams)
    if (nextPage > 1) next.set('page', String(nextPage))
    else next.delete('page')
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [featuredPost, ...remainingPosts] = posts

  return (
    <div className="min-h-screen bg-cream pb-24">
      <header
        data-navbar-theme="dark"
        className="relative isolate -mt-20 overflow-hidden rounded-b-[2.5rem] bg-cocoa pt-20 text-cream lg:-mt-24 lg:rounded-b-[4rem] lg:pt-24"
      >
        <LemonPrintBackdrop className="opacity-[0.08] mix-blend-screen" />
        <Star className="absolute left-[6%] top-[28%] h-9 w-9 rotate-12 text-butter/60" />
        <Sparkle className="absolute right-[8%] top-[22%] h-11 w-11 text-flame/70" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-20">
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-butter sm:text-sm">
              Notes from our corner
            </span>
            <h1 className="mt-4 font-display text-[clamp(4.5rem,11vw,9rem)] font-extrabold leading-[0.78] tracking-[-0.07em]">
              The<br />Journal<span className="text-flame">.</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg">
              Recipes, drop notes, collaborations and stories from behind the counter.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[26rem]">
            <div className="absolute inset-5 rotate-6 rounded-[45%] bg-flame" />
            <div className="absolute inset-9 -rotate-6 rounded-[42%] bg-butter" />
            <JournalIllustration className="relative w-full drop-shadow-[7px_9px_0_rgba(0,0,0,0.16)]" />
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-7xl px-6 lg:px-10">
        {categories.length ? (
          <nav
            className="mb-10 flex gap-2 overflow-x-auto rounded-[1.5rem] border-2 border-cocoa/10 bg-white p-2"
            aria-label="Filter Journal by category"
          >
            <button
              type="button"
              className={cn(
                'shrink-0 rounded-full border-2 px-5 py-2.5 font-display text-sm font-bold transition-colors',
                !selectedCategory
                  ? 'border-cocoa bg-cocoa text-cream'
                  : 'border-transparent bg-butter/35 text-cocoa hover:border-cocoa/25',
              )}
              onClick={() => selectCategory('')}
            >
              All stories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={cn(
                  'shrink-0 rounded-full border-2 px-5 py-2.5 font-display text-sm font-bold transition-colors',
                  selectedCategory === category.slug
                    ? 'border-cocoa bg-cocoa text-cream'
                    : 'border-transparent bg-butter/35 text-cocoa hover:border-cocoa/25',
                )}
                onClick={() => selectCategory(category.slug)}
              >
                {category.name}
              </button>
            ))}
          </nav>
        ) : categoryError ? (
          <p className="mb-8 text-sm font-semibold text-cocoa/55">Categories are unavailable, but every story is still here.</p>
        ) : null}

        {isLoading ? (
          <div className="grid animate-pulse gap-6 lg:grid-cols-[1.2fr_0.8fr]" aria-label="Loading stories">
            <div className="min-h-[28rem] rounded-[2.25rem] bg-butter/45" />
            <div className="min-h-[28rem] rounded-[2.25rem] bg-cocoa/10" />
          </div>
        ) : postsError ? (
          <div className="rounded-[2rem] border-2 border-flame/25 bg-white p-10 text-center">
            <p className="font-semibold text-flame">{postsError}</p>
            <Button className="mt-5" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        ) : !featuredPost ? (
          <section className="relative overflow-hidden rounded-[2.5rem] border-2 border-cocoa bg-butter px-6 py-14 text-center shadow-chunky sm:px-10">
            <Sparkle className="absolute left-[10%] top-10 h-8 w-8 text-flame/50" />
            <Star className="absolute bottom-10 right-[10%] h-8 w-8 rotate-12 text-olive/55" />
            <JournalIllustration className="mx-auto w-full max-w-[18rem]" />
            <h2 className="mt-3 font-display text-3xl font-extrabold text-cocoa sm:text-5xl">Fresh stories are on the way.</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-cocoa/65">
              The notebooks are open and the kettle is on. Check back soon for notes from the Sour Lemon kitchen.
            </p>
          </section>
        ) : (
          <>
            <JournalCard post={featuredPost} variant="featured" />
            {remainingPosts.length ? (
              <section className="mt-14" aria-labelledby="more-stories-heading">
                <div className="mb-7 flex items-center gap-4">
                  <h2 id="more-stories-heading" className="font-display text-3xl font-extrabold tracking-[-0.03em] text-cocoa sm:text-4xl">
                    More from the table
                  </h2>
                  <Squiggle className="hidden h-5 w-24 text-flame sm:block" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {remainingPosts.map((post) => <JournalCard key={post.id} post={post} />)}
                </div>
              </section>
            ) : null}
          </>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <nav className="mt-12 flex flex-wrap items-center justify-center gap-5" aria-label="Journal pages">
            <Button variant="outline" accent="cocoa" disabled={page <= 1} onClick={() => selectPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm font-bold text-cocoa/60">Page {page} of {pagination.totalPages}</span>
            <Button variant="outline" accent="cocoa" disabled={page >= pagination.totalPages} onClick={() => selectPage(page + 1)}>
              Next
            </Button>
          </nav>
        ) : null}
      </main>
    </div>
  )
}
