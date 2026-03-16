'use client'

import { KeyIcon, KeyName } from './KeyIcon'

interface KeybindHintProps {
  keys: KeyName | KeyName[]
  label: string
  layout?: 'horizontal' | 'vertical' | 'cluster'
  size?: number
  className?: string
}

/**
 * A combined component showing one or more icons followed by a text label.
 */
export function KeybindHint({ 
  keys, 
  label, 
  layout = 'horizontal', 
  size = 32,
  className = '' 
}: KeybindHintProps) {
  const keyArray = Array.isArray(keys) ? keys : [keys]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {layout === 'cluster' && keyArray.length === 4 ? (
        // Special ZQSD layout
        <div className="flex flex-col items-center gap-0.5" style={{ width: size * 3 }}>
          <div className="flex justify-center w-full">
            <KeyIcon keyName={keyArray[0]} size={size} />
          </div>
          <div className="flex justify-center gap-0.5 w-full">
            <KeyIcon keyName={keyArray[1]} size={size} />
            <KeyIcon keyName={keyArray[2]} size={size} />
            <KeyIcon keyName={keyArray[3]} size={size} />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {keyArray.map((keyName, i) => (
            <KeyIcon key={i} keyName={keyName} size={size} />
          ))}
        </div>
      )}
      <span className="text-white/90 text-sm font-medium drop-shadow-md tracking-wide">
        {label}
      </span>
    </div>
  )
}
