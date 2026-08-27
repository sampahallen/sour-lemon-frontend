import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getJournalPosts, type JournalPostSummary } from '@/api/journal'
import { JournalCard } from '@/components/journal/JournalCard'
import { Button } from '@/components/ui/Button'
import { fadeInUp, staggerContainer } from '@/utils/motion'

export function LatestStories() {
  const [stories, setStories] = useState<JournalPostSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    void getJournalPosts({ limit: 3 }, controller.signal)
      .then(({ posts }) => setStories(posts))
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  return (
    <section id="journal" className="relative bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <motion.div
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeInUp}
        >
          <div>
            <span className="font-display text-sm font-bold uppercase tracking-wide text-flame">
              Behind The Counter
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-cocoa sm:text-4xl">Latest Stories</h2>
          </div>
          <Button to="/journal" variant="outline" accent="cocoa">
            Read the Journal
          </Button>
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {isLoading ? (
            <p className="col-span-full py-16 text-center font-semibold text-cocoa/50">Loading stories…</p>
          ) : stories.length ? (
            stories.map((story) => (
              <motion.div key={story.id} variants={fadeInUp}>
                <JournalCard post={story} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full rounded-[2rem] border-2 border-cocoa/10 bg-white p-10 text-center">
              <p className="font-display text-2xl font-bold text-cocoa">Fresh stories are on the way.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
