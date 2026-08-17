// Direct port of index.html's catIcon(name) — matches a category name to a
// line-icon SVG path by keyword, same regex patterns and same fallback
// (empty string -> caller shows the initial-letter placeholder instead).
// Returns just the <path>/<circle> inner markup; the component wraps it in <svg>.
export function catIconPath(name: string): string {
  const n = (name || '').toLowerCase();

  if (/cloth|fashion|apparel|dress|shirt|wear|garment/.test(n))
    return '<path d="M9 4 6 6l-3 4 3 2v8h12v-8l3-2-3-4-3-2a3 3 0 0 1-6 0Z"/>';
  if (/shoe|sneaker|footwear|sandal/.test(n))
    return '<path d="M3 16c6 0 8-4 9-6l2 2c4 1 7 2 7 4v2H3v-2Z"/><path d="M3 18h18"/>';
  if (/beauty|cosmetic|makeup|skin|perfume/.test(n))
    return '<rect x="9" y="9" width="6" height="12" rx="2"/><path d="M10 9V5h4v4"/>';
  if (/grocer|food|snack|fresh|fruit|vegetable/.test(n))
    return '<path d="M5 8h14l-1.4 11a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>';
  if (/book|stationer|paper|pen/.test(n))
    return '<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z"/><path d="M5 17h13"/>';
  if (/toy|kid|baby|children/.test(n))
    return '<circle cx="12" cy="9" r="5"/><path d="M8 13l-2 7M16 13l2 7M12 14v6"/>';
  if (/sport|fitness|gym|exercise/.test(n))
    return '<path d="M7 7h2v10H7zM15 7h2v10h-2z"/><path d="M9 12h6M4 9v6M20 9v6"/>';
  if (/furnitur|home|decor|interior/.test(n))
    return '<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M4 11h16v5H4z"/><path d="M6 16v3M18 16v3"/>';
  if (/jewel|watch|ornament|gold/.test(n))
    return '<circle cx="12" cy="13" r="6"/><path d="M9 7l1-3h4l1 3"/>';
  if (/bag|luggage|backpack|wallet/.test(n))
    return '<rect x="5" y="8" width="14" height="12" rx="2"/><path d="M9 8a3 3 0 0 1 6 0"/>';
  if (/pet|animal|dog|cat\b/.test(n))
    return '<circle cx="8" cy="9" r="1.6"/><circle cx="16" cy="9" r="1.6"/><circle cx="5.5" cy="13" r="1.5"/><circle cx="18.5" cy="13" r="1.5"/><path d="M12 12c-3 0-5 2.4-5 4.5 0 1.4 1 2.5 2.4 2.5 1 0 1.7-.5 2.6-.5s1.6.5 2.6.5c1.4 0 2.4-1.1 2.4-2.5 0-2.1-2-4.5-5-4.5Z"/>';
  if (/pharma|medicin|health|drug/.test(n))
    return '<rect x="4" y="9" width="16" height="10" rx="3"/><path d="M12 9V5M10 5h4M12 12v4M10 14h4"/>';
  if (/laptop|notebook|computer|pc\b|desktop/.test(n))
    return '<rect x="4" y="5" width="16" height="10.5" rx="1.4"/><path d="M2.5 18.5h19l-1.4-2.4H3.9Z"/>';
  if (/component|ram|ssd|processor|cpu|gpu|motherboard|part|hardware/.test(n))
    return '<rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="10" y="10" width="4" height="4"/><path d="M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M7 9H4M7 12H4M7 15H4M20 9h-3M20 12h-3M20 15h-3"/>';
  if (/network|router|switch|wifi|internet|lan/.test(n))
    return '<path d="M4.5 10.5a11 11 0 0 1 15 0M7.3 13.6a7 7 0 0 1 9.4 0M10.1 16.6a3 3 0 0 1 3.8 0"/><circle cx="12" cy="19.3" r="1" fill="currentColor"/>';
  if (/peripheral|mouse|keyboard|monitor|display|accessor|headphone|webcam/.test(n))
    return '<rect x="8.5" y="3.5" width="7" height="13" rx="3.5"/><path d="M12 7v3"/>';
  if (/power|ups|battery|charger|adapter|surge/.test(n))
    return '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6Z"/>';
  if (/phone|mobile|tablet/.test(n))
    return '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 17.5h2"/>';
  if (/storage|drive|disk|hdd|nas/.test(n))
    return '<rect x="4" y="8" width="16" height="8" rx="2"/><circle cx="16.5" cy="12" r="1" fill="currentColor"/><path d="M7 12h4"/>';
  if (/printer|scanner/.test(n))
    return '<path d="M7 8V4h10v4"/><rect x="4" y="8" width="16" height="8" rx="1.6"/><rect x="7" y="14" width="10" height="6"/>';
  if (/camera|cctv|security/.test(n))
    return '<rect x="3" y="7" width="18" height="12" rx="2"/><circle cx="12" cy="13" r="3.6"/><path d="M8 7l1.2-2h5.6L16 7"/>';
  if (/server|rack/.test(n))
    return '<rect x="4" y="4" width="16" height="7" rx="1.4"/><rect x="4" y="13" width="16" height="7" rx="1.4"/><path d="M8 7.5h.01M8 16.5h.01"/>';

  return '';
}
