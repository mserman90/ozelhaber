'use client'

import ErrorHandler from '@/newsmap/Components/ErrorHandler.jsx'
import App from '@/newsmap/Components/App'
import { getEnv } from '@/newsmap/env.js'

export default function NewsMapRoot() {
  const env = getEnv()

  return (
    <div id="root">
      <ErrorHandler>
        <App refreshTime={Number(env['UPDATE_FREQUENCY']) || undefined} donationLink={env['DONATION_LINK']} />
      </ErrorHandler>
    </div>
  )
}
