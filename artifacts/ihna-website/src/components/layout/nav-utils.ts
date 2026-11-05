// Plain helpers shared by the server Header and the client MainNav / MobileNav (no React, no 'use client').
export const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`

// A menu item whose href is '#' is a heading only: it gets no "View all" link.
export const hasLandingPage = (href: string) => Boolean(href) && href !== '#'

type Groups = { links: unknown[] }[]
export const linkCount = (groups: Groups) => groups.reduce((n, g) => n + g.links.length, 0)

// More than one group or more than 6 links: a wide panel under the whole header bar; otherwise a compact dropdown under its trigger.
export const isWidePanel = (groups: Groups) => groups.length > 1 || linkCount(groups) > 6
