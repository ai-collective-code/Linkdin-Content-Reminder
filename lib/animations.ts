import type { Variants, Transition } from 'framer-motion'

/* ── Easing curves ──────────────────────────────────────────── */
const easeOut      = [0.22, 1, 0.36, 1] as const
const easeInOut    = [0.45, 0, 0.25, 1] as const
const easeOutBack  = [0.34, 1.56, 0.64, 1] as const  // subtle overshoot

/* ── Spring presets ─────────────────────────────────────────── */
export const spring: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
  mass: 0.9,
}

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
  mass: 0.7,
}

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 22,
  mass: 1.1,
}

/* ── Fade ───────────────────────────────────────────────────── */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.32, ease: easeOut } },
  exit:    { opacity: 0, transition: { duration: 0.18, ease: easeInOut } },
}

/* ── Fade + Y lift (most common page-level entrance) ────────── */
export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 18, filter: 'blur(3px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.52, ease: easeOut },
  },
  exit: {
    opacity: 0, y: 8, filter: 'blur(2px)',
    transition: { duration: 0.22, ease: easeInOut },
  },
}

export const fadeInDown: Variants = {
  hidden:  { opacity: 0, y: -18, filter: 'blur(3px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.52, ease: easeOut },
  },
  exit: {
    opacity: 0, y: -8, filter: 'blur(2px)',
    transition: { duration: 0.22, ease: easeInOut },
  },
}

/* ── Scale entrance ─────────────────────────────────────────── */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.93, filter: 'blur(4px)' },
  visible: {
    opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.38, ease: easeOut },
  },
  exit: {
    opacity: 0, scale: 0.96, filter: 'blur(2px)',
    transition: { duration: 0.18, ease: easeInOut },
  },
}

/* ── Scale with back (for modals, popovers) ─────────────────── */
export const scaleInBack: Variants = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.42, ease: easeOutBack },
  },
  exit: {
    opacity: 0, scale: 0.95,
    transition: { duration: 0.18, ease: easeInOut },
  },
}

/* ── Slide in left ──────────────────────────────────────────── */
export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -24, filter: 'blur(2px)' },
  visible: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { duration: 0.42, ease: easeOut },
  },
  exit: {
    opacity: 0, x: -12,
    transition: { duration: 0.2 },
  },
}

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 24, filter: 'blur(2px)' },
  visible: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { duration: 0.42, ease: easeOut },
  },
  exit: {
    opacity: 0, x: 12,
    transition: { duration: 0.2 },
  },
}

/* ── Stagger container ──────────────────────────────────────── */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.06,
    },
  },
}

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 12, filter: 'blur(2px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.44, ease: easeOut },
  },
}

/* ── Card reveal (grid layouts) ─────────────────────────────── */
export const cardReveal: Variants = {
  hidden:  { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.48, ease: easeOut },
  },
}

/* ── Sidebar ────────────────────────────────────────────────── */
export const sidebarVariants: Variants = {
  expanded:  { width: 280, transition: { duration: 0.3, ease: easeInOut } },
  collapsed: { width: 72,  transition: { duration: 0.3, ease: easeInOut } },
}

export const sidebarItemLabelVariants: Variants = {
  expanded: {
    opacity: 1, x: 0, display: 'block',
    transition: { duration: 0.22, ease: easeOut, delay: 0.05 },
  },
  collapsed: {
    opacity: 0, x: -10,
    transition: { duration: 0.15, ease: easeInOut },
    transitionEnd: { display: 'none' },
  },
}

/* ── Page transition ────────────────────────────────────────── */
export const pageTransition = {
  initial:    { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate:    { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:       { opacity: 0, y: -6, filter: 'blur(2px)' },
  transition: { duration: 0.38, ease: easeOut },
}

/* ── Overlay (backdrop) ─────────────────────────────────────── */
export const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
}

/* ── Panel dropdown (command palette, menus) ────────────────── */
export const panelVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.96, y: -10, filter: 'blur(4px)' },
  visible: {
    opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.26, ease: easeOut },
  },
  exit: {
    opacity: 0, scale: 0.97, y: -5, filter: 'blur(2px)',
    transition: { duration: 0.16 },
  },
}

/* ── Drawer (mobile nav) ────────────────────────────────────── */
export const drawerVariants: Variants = {
  hidden:  { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.3, ease: easeInOut } },
  exit:    { x: '-100%', transition: { duration: 0.26, ease: easeInOut } },
}

/* ── Notification badge ─────────────────────────────────────── */
export const notifBadgeVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1, opacity: 1,
    transition: { type: 'spring', stiffness: 440, damping: 22 },
  },
  exit: {
    scale: 0, opacity: 0,
    transition: { duration: 0.14 },
  },
}
