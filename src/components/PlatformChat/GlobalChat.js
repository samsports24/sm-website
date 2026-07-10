import React from 'react'
import ChatThread from './ChatThread'

// Thin wrapper kept for backwards-compatible imports.
export default function GlobalChat(props) {
  return <ChatThread scope="global" title="💬 Platform Chat" {...props} />
}
