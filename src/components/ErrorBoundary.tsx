import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

/** Last line of defence: a crash shows a friendly message instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Explore Naogaon crashed.', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#0b3b2e' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem' }}>কিছু একটা সমস্যা হয়েছে · Something went wrong</h1>
          <p style={{ margin: '12px 0 20px' }}>পাতাটি আবার লোড করুন। আপনার দেখা স্থানগুলো এই ব্রাউজারে সংরক্ষিত আছে। · Please reload. Your visited places are saved in this browser.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: '10px 22px', border: 0, borderRadius: 999, background: '#0b3b2e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Reload · আবার লোড করুন
          </button>
        </div>
      </div>
    )
  }
}
