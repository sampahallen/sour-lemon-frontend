import { Fragment, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getJournalPost, type JournalBlock, type JournalPost as JournalPostType } from '@/api/journal'
import { Button } from '@/components/ui/Button'

function JournalContent({ post }: { post: JournalPostType }) {
  const images = new Map(post.images.map((image) => [image.id, image]))

  const renderBlock = (block: JournalBlock) => {
    switch (block.type) {
      case 'paragraph':
        return <p className="whitespace-pre-line text-lg leading-8 text-cocoa/80">{block.text}</p>
      case 'heading':
        return block.level === 2 ? (
          <h2 className="pt-5 font-display text-3xl font-bold text-cocoa sm:text-4xl">{block.text}</h2>
        ) : (
          <h3 className="pt-4 font-display text-2xl font-bold text-cocoa sm:text-3xl">{block.text}</h3>
        )
      case 'list': {
        const List = block.style === 'ordered' ? 'ol' : 'ul'
        return (
          <List className={`space-y-2 pl-7 text-lg leading-8 text-cocoa/80 ${block.style === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
            {block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
          </List>
        )
      }
      case 'quote':
        return (
          <blockquote className="rounded-r-2xl border-l-4 border-flame bg-butter/25 px-7 py-6">
            <p className="font-display text-2xl font-semibold leading-relaxed text-cocoa">“{block.text}”</p>
            {block.attribution ? <cite className="mt-3 block text-sm font-semibold not-italic text-cocoa/55">— {block.attribution}</cite> : null}
          </blockquote>
        )
      case 'image': {
        const image = images.get(block.imageId)
        if (!image) return null
        return (
          <figure>
            <img src={image.url} alt={image.altText} className="max-h-[44rem] w-full rounded-[2rem] object-cover" />
            {block.caption || image.caption ? (
              <figcaption className="mt-3 text-center text-sm text-cocoa/55">{block.caption || image.caption}</figcaption>
            ) : null}
          </figure>
        )
      }
    }
  }

  return (
    <div className="space-y-7">
      {post.body.blocks.map((block, index) => <Fragment key={index}>{renderBlock(block)}</Fragment>)}
    </div>
  )
}

export function JournalPost() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<JournalPostType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getJournalPost(slug, controller.signal)
      .then(({ post }) => setPost(post))
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'Could not load this story.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [slug])

  if (isLoading) {
    return <p className="min-h-screen bg-cream px-6 pb-24 pt-40 text-center font-semibold text-cocoa/55">Loading story…</p>
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-cream px-6 pb-24 pt-40 text-center">
        <h1 className="font-display text-4xl font-bold text-cocoa">This story could not be found.</h1>
        <p className="mt-4 text-cocoa/60">{error}</p>
        <Button to="/journal" className="mt-7">Back to the Journal</Button>
      </div>
    )
  }

  const cover = post.images.find((image) => image.role === 'cover')

  return (
    <article className="min-h-screen bg-cream pb-24 pt-32">
      <header className="mx-auto max-w-4xl px-6 text-center lg:px-10">
        <Link to={`/journal?category=${post.category.slug}`} className="font-display text-sm font-bold uppercase tracking-[0.16em] text-flame">
          {post.category.name}
        </Link>
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-cocoa sm:text-6xl">{post.title}</h1>
        {post.excerpt ? <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cocoa/65">{post.excerpt}</p> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 text-sm font-semibold text-cocoa/50">
          {post.author ? <span>By {post.author.name}</span> : null}
          {post.author ? <span aria-hidden="true">·</span> : null}
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
          </time>
        </div>
      </header>

      {cover ? (
        <figure className="mx-auto mt-12 max-w-6xl px-6 lg:px-10">
          <img src={cover.url} alt={cover.altText} className="max-h-[42rem] w-full rounded-[2.5rem] object-cover" />
          {cover.caption ? <figcaption className="mt-3 text-center text-sm text-cocoa/55">{cover.caption}</figcaption> : null}
        </figure>
      ) : null}

      <div className="mx-auto mt-12 max-w-3xl px-6 lg:px-10">
        <JournalContent post={post} />
        <div className="mt-16 border-t-2 border-cocoa/10 pt-8">
          <Button to="/journal" variant="outline" accent="cocoa">Back to the Journal</Button>
        </div>
      </div>
    </article>
  )
}
