import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Mic } from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/new', icon: Mic, label: 'New Recording' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: '#0b0e18' }}>

        {/* Logo area */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <img
            src="/logo.png"
            alt="D-Scope Systems VIA"
            className="w-full object-contain"
            style={{ maxHeight: '48px', objectPosition: 'left' }}
            onError={(e) => {
              // Fallback to text logo if image not found
              const el = e.currentTarget
              el.style.display = 'none'
              const fallback = el.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          {/* Text fallback — hidden when image loads */}
          <div className="items-center gap-2.5" style={{ display: 'none' }}>
            <div
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-white text-base relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1a4080 0%, #2060b0 100%)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '8px 8px',
              }} />
              <span className="relative z-10">D</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-white text-sm" style={{ letterSpacing: '0.04em' }}>D-SCOPE</span>
                <span className="font-bold text-xs" style={{ color: '#d4a020' }}>VIA</span>
              </div>
              <div style={{ color: '#8ca0b0', letterSpacing: '0.08em', fontSize: '9px' }}>SYSTEMS</div>
            </div>
          </div>

          {/* Brand underline rule */}
          <div className="mt-2 h-px" style={{
            background: 'linear-gradient(90deg, #2060b0 0%, #d4a020 50%, transparent 100%)',
            opacity: 0.5,
          }} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={active ? {
                  background: 'rgba(212, 160, 32, 0.12)',
                  color: '#d4a020',
                  borderLeft: '2px solid #d4a020',
                  paddingLeft: '10px',
                } : {
                  color: '#8ca0b0',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#8ca0b0' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#3d5068', fontSize: '11px' }}>
          Dscope Systems v1.0
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
