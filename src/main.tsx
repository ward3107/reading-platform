import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Open all external links in new browser tab
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const anchor = target.closest('a');
  if (anchor && anchor.href && (anchor.href.startsWith('http://') || anchor.href.startsWith('https://'))) {
    e.preventDefault();
    window.open(anchor.href, '_blank', 'noopener,noreferrer');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
