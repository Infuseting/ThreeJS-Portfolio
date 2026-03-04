/** Shared XP-style constants used across multiple components. */

/** Standard button style used in XP dialogs and toolbars. */
export const xpButtonStyle: React.CSSProperties = {
  minWidth: 70,
  padding: '4px 12px',
  fontFamily: 'Tahoma, sans-serif',
  fontSize: 11,
  cursor: 'pointer',
  backgroundColor: '#ECE9D8',
  border: '1px solid #003399',
  borderRadius: 3,
}

/** Compact button style (no min-width, smaller padding). */
export const xpButtonCompactStyle: React.CSSProperties = {
  padding: '2px 12px',
  fontFamily: 'Tahoma, sans-serif',
  fontSize: 11,
  cursor: 'pointer',
}
