import { useCallback, useEffect, useRef, useState } from 'react'
import { PublicApiError, readPublicCache, removePublicCache, writePublicCache } from '@/api/publicContent'

const REVALIDATE_AFTER_MS = 5 * 60 * 1000

type ResourceState<T> = {
  data: T | null
  isLoading: boolean
  error: string | null
}

export function usePublicResource<T>(options: {
  cacheKey: string
  maxAgeMs: number
  fetcher: (signal: AbortSignal) => Promise<T>
}) {
  const { cacheKey, maxAgeMs, fetcher } = options
  const lastAttemptRef = useRef(0)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<ResourceState<T>>(() => {
    const data = readPublicCache<T>(cacheKey)
    return { data, isLoading: data === null, error: null }
  })

  const refresh = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    const cached = readPublicCache<T>(cacheKey)
    const controller = new AbortController()
    queueMicrotask(() => {
      if (!controller.signal.aborted) setState({ data: cached, isLoading: cached === null, error: null })
    })
    lastAttemptRef.current = Date.now()
    void fetcher(controller.signal)
      .then((data) => {
        writePublicCache(cacheKey, data, maxAgeMs)
        setState({ data, isLoading: false, error: null })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        const isClientError = error instanceof PublicApiError &&
          error.status >= 400 && error.status < 500 && error.status !== 429
        if (isClientError) {
          removePublicCache(cacheKey)
          setState({ data: null, isLoading: false, error: error.message })
          return
        }
        setState((current) => ({
          data: current.data,
          isLoading: false,
          error: current.data === null
            ? error instanceof Error ? error.message : 'We could not load this content.'
            : null,
        }))
      })

    return () => controller.abort()
  }, [attempt, cacheKey, fetcher, maxAgeMs])

  useEffect(() => {
    const revalidate = () => {
      if (Date.now() - lastAttemptRef.current >= REVALIDATE_AFTER_MS) refresh()
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') revalidate()
    }
    window.addEventListener('online', revalidate)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('online', revalidate)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refresh])

  return { ...state, refresh }
}
