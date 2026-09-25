import { Link } from 'react-router'
import type { JournalPostSummary } from '@/api/journal'
import { Arrow } from '@/assets/doodles/doodleIcons'
import { cn } from '@/utils/cn'

const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function JournalCard({
  post,
  variant = 'standard',
}: {
  post: JournalPostSummary
  variant?: 'featured' | 'standard'
}) {
  const cover = post.images.find((image) => image.role === 'cover')

  return (
    <Link
      to={`/journal/${post.slug}`}
      className={cn(
        'group overflow-hidden border-2 border-cocoa bg-white transition-transform duration-300 motion-safe:hover:-translate-y-1',
        variant === 'featured'
          ? 'grid rounded-[2.25rem] shadow-chunky lg:grid-cols-[1.2fr_0.8fr]'
          : 'flex h-full flex-col rounded-[1.75rem]',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-butter/45',
          variant === 'featured' ? 'min-h-72 lg:min-h-[30rem]' : 'aspect-[4/3]',
        )}
      >
        {cover ? (
          <img
            src={cover.url}
            alt={cover.altText}
            className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full min-h-64 items-center justify-center bg-butter font-display text-7xl font-extrabold text-flame/45">
            SL
          </div>
        )}
        {variant === 'featured' ? (
          <span className="absolute left-5 top-5 rounded-full border-2 border-cocoa bg-cream px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-cocoa">
            Featured story
          </span>
        ) : null}
      </div>

      <div className={cn('flex flex-1 flex-col', variant === 'featured' ? 'p-7 sm:p-9 lg:p-10' : 'p-6')}>
        <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-flame">
          {post.category.name}
        </span>
        <h2
          className={cn(
            'mt-3 font-display font-extrabold leading-[1.02] tracking-[-0.035em] text-cocoa',
            variant === 'featured' ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-2xl',
          )}
        >
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className={cn('mt-4 leading-relaxed text-cocoa/65', variant === 'featured' ? 'text-base sm:text-lg' : 'line-clamp-3 text-sm')}>
            {post.excerpt}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-4 pt-7">
          <p className="text-xs font-semibold leading-relaxed text-cocoa/50">
            {post.author ? `By ${post.author.name} · ` : ''}
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </p>
          <Arrow className="h-7 w-12 shrink-0 text-flame transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
