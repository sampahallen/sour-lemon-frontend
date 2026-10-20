import { apiBaseUrl } from './baseUrl'

async function post(path: string, body: object) {
  const response = await fetch(`${apiBaseUrl}/api/newsletter/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({})) as { message?: string; error?: string }
  if (!response.ok) throw new Error(data.error ?? 'Please try again later.')
  return data.message ?? ''
}

export const subscribeToNewsletter = (email: string) => post('subscribe', { email, consent: true })
export const confirmNewsletter = (token: string) => post('confirm', { token })
export const unsubscribeNewsletter = (token: string) => post('unsubscribe', { token })
