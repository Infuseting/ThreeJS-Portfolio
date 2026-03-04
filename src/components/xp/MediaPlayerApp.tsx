'use client'

export function MediaPlayerApp({ windowId }: { windowId: string }) {
    return (
        <div style={{ height: '100%', backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
            {/* Fake WMP Header */}
            <div style={{ backgroundColor: '#2b2b2b', color: '#fff', fontFamily: 'Tahoma, sans-serif', padding: '4px 8px', fontSize: 12, borderBottom: '1px solid #444', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#00FF00' }}>▶</span> Lofi Girl - lofi hip hop radio
            </div>
            <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1"
                title="Lofi Girl"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ flex: 1, display: 'block', backgroundColor: '#000' }}
            />
        </div>
    )
}
