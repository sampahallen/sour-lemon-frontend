import { Link } from 'react-router'
import type { JournalPostSummary } from '@/api/journal'

export function JournalCard({ post }: { post: JournalPostSummary }) {
  const cover = post.images.find((image) => image.role === 'cover')

  return (
    <Link
      to={`/journal/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[2rem] border-2 border-cocoa/10 bg-white transition-transform hover:-translate-y-1"
    >
      <div className="aspect-[4/3] overflow-hidden bg-butter/35">
        {cover ? (
          <img
            src={cover.url}
            alt={cover.altText}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl font-bold text-flame/35">
            SL
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="font-display text-xs font-bold uppercase tracking-wide text-flame">
          {post.category.name}
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-cocoa">{post.title}</h2>
        {post.excerpt ? <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-cocoa/65">{post.excerpt}</p> : null}
        <p className="mt-auto pt-5 text-xs font-semibold text-cocoa/45">
          {new Date(post.publishedAt).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </Link>
  )
}
