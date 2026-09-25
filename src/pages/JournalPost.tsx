import { Fragment, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  getJournalPost,
  getJournalPosts,
  type JournalBlock,
  type JournalPost as JournalPostType,
  type JournalPostSummary,
} from '@/api/journal'
import { Sparkle, Squiggle } from '@/assets/doodles/doodleIcons'
import { JournalCard } from '@/components/journal/JournalCard'
import { Button } from '@/components/ui/Button'

const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function JournalContent({ post }: { post: JournalPostType }) {
  const images = new Map(post.images.map((image) => [image.id, image]))

  const renderBlock = (block: JournalBlock) => {
    switch (block.type) {
      case 'paragraph':
        return <p className="whitespace-pre-line text-lg leading-8 text-cocoa/80 sm:text-xl sm:leading-9">{block.text}</p>
      case 'heading':
        return block.level === 2 ? (
          <h2 className="pt-6 font-display text-3xl font-extrabold leading-tight tracking-[-0.025em] text-cocoa sm:text-5xl">{block.text}</h2>
        ) : (
          <h3 className="pt-5 font-display text-2xl font-extrabold text-cocoa sm:text-3xl">{block.text}</h3>
        )
      case 'list': {
        const List = block.style === 'ordered' ? 'ol' : 'ul'
        return (
          <List className={`space-y-3 pl-7 text-lg leading-8 text-cocoa/80 sm:text-xl ${block.style === 'ordered' ? 'list-decimal' : 'list-disc marker:text-flame'}`}>
            {block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
          </List>
        )
      }
      case 'quote':
        return (
          <blockquote className="relative overflow-hidden rounded-[2rem] border-2 border-cocoa bg-butter px-7 py-8 shadow-chunky sm:px-10 sm:py-10">
            <Sparkle className="absolute right-6 top-5 h-8 w-8 text-flame/45" />
            <p className="pr-8 font-display text-2xl font-extrabold leading-relaxed text-cocoa sm:text-4xl">“{block.text}”</p>
            {block.attribution ? <cite className="mt-5 block text-sm font-bold not-italic text-cocoa/55">— {block.attribution}</cite> : null}
          </blockquote>
        )
      case 'image': {
        const image = images.get(block.imageId)
        if (!image) return null
        return (
          <figure className="py-3">
            <img src={image.url} alt={image.altText} className="max-h-[44rem] w-full rounded-[2rem] border-2 border-cocoa object-cover" />
            {block.caption || image.caption ? (
              <figcaption className="mt-3 text-center text-sm font-medium text-cocoa/55">{block.caption || image.caption}</figcaption>
            ) : null}
          </figure>
        )
      }
    }
  }

  return <div className="space-y-8">{post.body.blocks.map((block, index) => <Fragment key={index}>{renderBlock(block)}</Fragment>)}</div>
}

export function JournalPost() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<JournalPostType | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<JournalPostSummary[]>([])
  const [loadedSlug, setLoadedSlug] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getJournalPost(slug, controller.signal)
      .then(({ post }) => {
        setError(null)
        setPost(post)
        setRelatedPosts([])
        setLoadedSlug(slug)
        void getJournalPosts({ category: post.category.slug, limit: 4 }, controller.signal)
          .then(({ posts }) => {
            setRelatedPosts(posts.filter((candidate) => candidate.id !== post.id).slice(0, 3))
          })
          .catch(() => {
            if (!controller.signal.aborted) setRelatedPosts([])
          })
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setPost(null)
          setRelatedPosts([])
          setError(caught instanceof Error ? caught.message : 'Could not load this story.')
          setLoadedSlug(slug)
        }
      })
    return () => controller.abort()
  }, [slug])

  const isLoading = loadedSlug !== slug

  if (isLoading) {
    return (
      <div className="min-h-screen animate-pulse bg-cream px-6 pb-24 pt-36">
        <div className="mx-auto h-6 w-32 rounded-full bg-flame/20" />
        <div className="mx-auto mt-7 h-20 max-w-3xl rounded-[2rem] bg-cocoa/10" />
        <div className="mx-auto mt-10 h-[28rem] max-w-6xl rounded-[2.5rem] bg-butter/50" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-cream px-6 pb-24 pt-40 text-center">
        <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame">Journal</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-cocoa sm:text-6xl">This story could not be found.</h1>
        {error ? <p className="mt-4 text-cocoa/60">{error}</p> : null}
        <Button to="/journal" className="mt-7">Back to the Journal</Button>
      </div>
    )
  }

  const cover = post.images.find((image) => image.role === 'cover')

  return (
    <article className="min-h-screen bg-cream pb-24">
      <header data-navbar-theme="dark" className="relative -mt-20 overflow-hidden bg-cocoa px-6 pb-16 pt-40 text-cream lg:-mt-24 lg:px-10 lg:pb-20 lg:pt-44">
        <Sparkle className="absolute right-[8%] top-[30%] h-10 w-10 text-flame/60" />
        <div className="mx-auto max-w-5xl">
          <Link to={`/journal?category=${post.category.slug}`} className="font-display text-xs font-bold uppercase tracking-[0.2em] text-butter hover:text-flame">
            {post.category.name}
          </Link>
          <h1 className="mt-6 max-w-5xl font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-7xl">{post.title}</h1>
          {post.excerpt ? <p className="mt-7 max-w-2xl text-lg leading-relaxed text-cream/70 sm:text-xl">{post.excerpt}</p> : null}
          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-cream/55">
            {post.author ? <span>By {post.author.name}</span> : null}
            {post.author ? <span aria-hidden="true">·</span> : null}
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </div>
        </div>
      </header>

      {cover ? (
        <figure className="mx-auto -mt-1 max-w-7xl px-4 pt-10 sm:px-6 lg:px-10">
          <img src={cover.url} alt={cover.altText} className="max-h-[46rem] w-full rounded-[2rem] border-2 border-cocoa object-cover shadow-chunky sm:rounded-[3rem]" />
          {cover.caption ? <figcaption className="mt-4 text-center text-sm font-medium text-cocoa/55">{cover.caption}</figcaption> : null}
        </figure>
      ) : null}

      <div className="mx-auto mt-14 max-w-3xl px-6 lg:px-10">
        <JournalContent post={post} />
        <div className="mt-16 flex flex-wrap items-center justify-between gap-5 border-t-2 border-cocoa/15 pt-8">
          <Button to="/journal" variant="outline" accent="cocoa">Back to the Journal</Button>
          <Squiggle className="h-5 w-24 text-flame" />
        </div>
      </div>

      {relatedPosts.length ? (
        <section className="mx-auto mt-20 max-w-7xl px-6 lg:px-10" aria-labelledby="related-stories-heading">
          <h2 id="related-stories-heading" className="font-display text-3xl font-extrabold tracking-[-0.03em] text-cocoa sm:text-5xl">Keep reading</h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => <JournalCard key={relatedPost.id} post={relatedPost} />)}
          </div>
        </section>
      ) : null}
    </article>
  )
}
