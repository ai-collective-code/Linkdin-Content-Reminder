// All enterprise mock data for Cultural Intelligence Engine modules

/* ═══════════════════════════════════════════════════════════
   FESTIVAL DATA
════════════════════════════════════════════════════════════ */
export interface Festival {
  id: string
  name: string
  emoji: string
  date: Date
  endDate?: Date
  region: string[]
  type: 'Religious' | 'Cultural' | 'National' | 'Harvest'
  theme: 'purple' | 'amber' | 'green' | 'teal' | 'red' | 'pink' | 'orange'
  opportunityScore: number
  audienceReach: string
  emotionalTones: string[]
  trendingKeywords: string[]
  campaignAngles: string[]
  contentSuggestions: string[]
  brandFit: string[]
  sentimentBreakdown: { positive: number; neutral: number; aspirational: number }
  peakEngagementWindow: string
  industries: string[]
}

export const FESTIVALS: Festival[] = [
  {
    id: 'eid-ul-adha-2026',
    name: 'Eid ul-Adha',
    emoji: '🌙',
    date: new Date('2026-06-16'),
    region: ['Middle East', 'South Asia', 'Southeast Asia', 'Global'],
    type: 'Religious',
    theme: 'teal',
    opportunityScore: 88,
    audienceReach: '1.8B',
    emotionalTones: ['Devotion', 'Generosity', 'Community', 'Renewal'],
    trendingKeywords: ['EidMubarak', 'BakraEid', 'EidulAdha2026', 'Qurbani', 'EidCelebrations'],
    campaignAngles: [
      'Family bonding & shared celebrations',
      'Charitable giving & social responsibility',
      'New beginnings & prosperity',
      'Gratitude & reflection',
    ],
    contentSuggestions: [
      'Video series: "Stories of Generosity" UGC campaign',
      'Infographic: Eid traditions across 15 countries',
      'Interactive: Family meal planner with local recipes',
      'Countdown: "29 Days of Giving" challenge',
    ],
    brandFit: ['Finance', 'Food & Beverage', 'Fashion', 'Travel', 'Retail'],
    sentimentBreakdown: { positive: 82, neutral: 14, aspirational: 4 },
    peakEngagementWindow: '3 days before → 2 days after',
    industries: ['FMCG', 'Banking', 'E-commerce', 'Fashion'],
  },
  {
    id: 'onam-2026',
    name: 'Onam',
    emoji: '🌺',
    date: new Date('2026-09-05'),
    endDate: new Date('2026-09-15'),
    region: ['Kerala', 'South India', 'Indian Diaspora'],
    type: 'Cultural',
    theme: 'green',
    opportunityScore: 82,
    audienceReach: '38M',
    emotionalTones: ['Joy', 'Heritage', 'Prosperity', 'Unity'],
    trendingKeywords: ['Onam2026', 'OnamSadhya', 'Thiruvonam', 'VallamKali', 'OnamCelebrations'],
    campaignAngles: [
      'Harvest prosperity & abundance',
      'Regional pride & cultural heritage',
      'Family reunion & homecoming',
      'Traditional cuisine & rituals',
    ],
    contentSuggestions: [
      'Recipe series: "Sadya secrets" with local chefs',
      'Behind-the-scenes: Flower carpet (Pookalam) making',
      'Spotlight: Kerala artisans & traditional crafts',
    ],
    brandFit: ['Food', 'Tourism', 'Fashion', 'Home Decor', 'Banking'],
    sentimentBreakdown: { positive: 89, neutral: 8, aspirational: 3 },
    peakEngagementWindow: '5 days before → 3 days after',
    industries: ['FMCG', 'Tourism', 'Retail', 'Finance'],
  },
  {
    id: 'ganesh-chaturthi-2026',
    name: 'Ganesh Chaturthi',
    emoji: '🐘',
    date: new Date('2026-09-20'),
    endDate: new Date('2026-09-30'),
    region: ['Maharashtra', 'West India', 'Karnataka', 'Global'],
    type: 'Religious',
    theme: 'orange',
    opportunityScore: 91,
    audienceReach: '120M',
    emotionalTones: ['Devotion', 'Celebration', 'New Beginnings', 'Prosperity'],
    trendingKeywords: ['GaneshChaturthi2026', 'GanpatiMorya', 'EcoFriendlyGanpati', 'GaneshUtsav'],
    campaignAngles: [
      'Eco-conscious celebrations & sustainability',
      'Community spirit & collective joy',
      'New beginnings & obstacle removal',
      'Artisanal traditions & craftspersons',
    ],
    contentSuggestions: [
      'Campaign: "Green Ganesh" eco-friendly celebration guide',
      'Spotlight: Artisans behind the idols',
      'UGC: Share your Ganpati decoration',
      'Interactive: Virtual visarjan experience',
    ],
    brandFit: ['FMCG', 'Sustainability', 'Finance', 'Food', 'Home Decor'],
    sentimentBreakdown: { positive: 91, neutral: 7, aspirational: 2 },
    peakEngagementWindow: '7 days before → 5 days after',
    industries: ['FMCG', 'Banking', 'Automotive', 'Retail'],
  },
  {
    id: 'navratri-2026',
    name: 'Navratri',
    emoji: '💃',
    date: new Date('2026-10-04'),
    endDate: new Date('2026-10-13'),
    region: ['North India', 'Gujarat', 'India-wide', 'Diaspora'],
    type: 'Religious',
    theme: 'pink',
    opportunityScore: 87,
    audienceReach: '200M',
    emotionalTones: ['Festivity', 'Devotion', 'Energy', 'Fashion'],
    trendingKeywords: ['Navratri2026', 'Garba', 'Dandiya', 'NavratriVibes', 'FestivalFashion'],
    campaignAngles: [
      'Fashion & style for nine nights',
      'Women empowerment & shakti celebration',
      'Music, dance & cultural expression',
      'Food fasting & spiritual cleansing',
    ],
    contentSuggestions: [
      'Style guide: "9 Looks for 9 Nights" fashion series',
      'Playlist: Curated Garba & Dandiya tracks',
      'Recipe collection: Navratri fasting foods',
      'Live event: Virtual Garba competition',
    ],
    brandFit: ['Fashion', 'Beauty', 'Food', 'Entertainment', 'Jewellery'],
    sentimentBreakdown: { positive: 88, neutral: 9, aspirational: 3 },
    peakEngagementWindow: '3 days before → 2 days during',
    industries: ['Fashion', 'Beauty', 'F&B', 'Entertainment'],
  },
  {
    id: 'diwali-2026',
    name: 'Diwali',
    emoji: '✨',
    date: new Date('2026-10-20'),
    endDate: new Date('2026-10-24'),
    region: ['India', 'South Asia', 'Global Diaspora', 'Southeast Asia'],
    type: 'Cultural',
    theme: 'amber',
    opportunityScore: 97,
    audienceReach: '1.1B',
    emotionalTones: ['Joy', 'Prosperity', 'Togetherness', 'Light & Hope'],
    trendingKeywords: ['Diwali2026', 'FestivalOfLights', 'DiwaliVibes', 'DiwaliDecor', 'HappyDiwali'],
    campaignAngles: [
      'Light overcoming darkness — brand metaphors',
      'Gift giving & prosperity',
      'Family reunion & shared traditions',
      'New financial year & investment mindset',
    ],
    contentSuggestions: [
      'Interactive: "Light up your dream" personalized message cards',
      'Gift guide: Curated Diwali hampers',
      'Video: The global diaspora Diwali experience',
      'Countdown series: "5 Days of Light" daily drops',
    ],
    brandFit: ['Finance', 'Jewellery', 'FMCG', 'E-commerce', 'Automotive', 'Real Estate'],
    sentimentBreakdown: { positive: 94, neutral: 5, aspirational: 1 },
    peakEngagementWindow: '10 days before → 3 days after',
    industries: ['E-commerce', 'FMCG', 'Banking', 'Automotive', 'Retail'],
  },
  {
    id: 'christmas-2026',
    name: 'Christmas',
    emoji: '🎄',
    date: new Date('2026-12-25'),
    region: ['Global', 'North America', 'Europe', 'Latin America', 'Australia'],
    type: 'Cultural',
    theme: 'red',
    opportunityScore: 95,
    audienceReach: '2.2B',
    emotionalTones: ['Joy', 'Giving', 'Family', 'Wonder'],
    trendingKeywords: ['Christmas2026', 'HolidaySeason', 'ChristmasVibes', 'XmasGifts', 'MerryChristmas'],
    campaignAngles: [
      'Gift giving & generosity',
      'Family togetherness & traditions',
      'Year-end reflection & gratitude',
      'Winter warmth & cozy aesthetics',
    ],
    contentSuggestions: [
      'Gift guide: Curated by recipient persona',
      'Advent calendar: 25 days of micro-content',
      'UGC: Share your holiday tradition',
      'Emotional film: Year-end brand retrospective',
    ],
    brandFit: ['Retail', 'Food', 'Travel', 'Tech', 'Fashion', 'Finance'],
    sentimentBreakdown: { positive: 91, neutral: 7, aspirational: 2 },
    peakEngagementWindow: '30 days before → 2 days after',
    industries: ['Retail', 'E-commerce', 'FMCG', 'Travel', 'Tech'],
  },
  {
    id: 'pongal-2027',
    name: 'Pongal',
    emoji: '🌾',
    date: new Date('2027-01-14'),
    endDate: new Date('2027-01-17'),
    region: ['Tamil Nadu', 'South India', 'Sri Lanka', 'Tamil Diaspora'],
    type: 'Harvest',
    theme: 'amber',
    opportunityScore: 79,
    audienceReach: '80M',
    emotionalTones: ['Gratitude', 'Harvest Joy', 'Family', 'New Year Hope'],
    trendingKeywords: ['Pongal2027', 'TamilNewYear', 'HarvestFestival', 'PongaloCelebration'],
    campaignAngles: [
      'Agricultural heritage & sustainability',
      'Family harvest celebrations',
      'Tamil cultural pride',
      'New year prosperity & fresh starts',
    ],
    contentSuggestions: [
      'Recipe: Traditional Pongal variants with a modern twist',
      'Documentary: Farmers behind the harvest',
      'Cultural spotlight: Kolam art traditions',
    ],
    brandFit: ['FMCG', 'Agriculture', 'Finance', 'Food'],
    sentimentBreakdown: { positive: 87, neutral: 11, aspirational: 2 },
    peakEngagementWindow: '2 days before → 2 days after',
    industries: ['FMCG', 'Agri-Tech', 'Banking', 'Retail'],
  },
]

/* ═══════════════════════════════════════════════════════════
   CAMPAIGNS (Executive Dashboard)
════════════════════════════════════════════════════════════ */
export interface Campaign {
  id: string
  name: string
  festival: string
  status: 'active' | 'scheduled' | 'completed' | 'draft'
  reach: string
  engagement: string
  impressions: string
  budget: string
  progress: number
  startDate: string
  endDate: string
  channels: string[]
  accentColor: 'purple' | 'cyan' | 'blue' | 'pink'
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-eid-2026',
    name: 'Eid ul-Adha — UAE & KSA',
    festival: 'Eid ul-Adha',
    status: 'active',
    reach: '4.2M',
    engagement: '8.7%',
    impressions: '18.4M',
    budget: '$124K',
    progress: 34,
    startDate: 'Jun 1',
    endDate: 'Jun 20',
    channels: ['LinkedIn', 'Instagram', 'WhatsApp'],
    accentColor: 'cyan',
  },
  {
    id: 'camp-diwali-india',
    name: 'Diwali 2026 — India Launch',
    festival: 'Diwali',
    status: 'scheduled',
    reach: '24M',
    engagement: '12.4%',
    impressions: '91.2M',
    budget: '$480K',
    progress: 12,
    startDate: 'Oct 1',
    endDate: 'Oct 28',
    channels: ['LinkedIn', 'YouTube', 'Email', 'Display'],
    accentColor: 'purple',
  },
  {
    id: 'camp-ganesh-maharashtra',
    name: 'Ganesh Utsav — Maharashtra',
    festival: 'Ganesh Chaturthi',
    status: 'scheduled',
    reach: '8.1M',
    engagement: '9.2%',
    impressions: '32.8M',
    budget: '$210K',
    progress: 5,
    startDate: 'Sep 10',
    endDate: 'Oct 1',
    channels: ['Instagram', 'YouTube', 'OOH'],
    accentColor: 'pink',
  },
  {
    id: 'camp-christmas-global',
    name: 'Christmas — Global Markets',
    festival: 'Christmas',
    status: 'draft',
    reach: '62M',
    engagement: '7.8%',
    impressions: '210M',
    budget: '$1.2M',
    progress: 2,
    startDate: 'Dec 1',
    endDate: 'Jan 2',
    channels: ['All Channels'],
    accentColor: 'blue',
  },
]

/* ═══════════════════════════════════════════════════════════
   PUBLISHING QUEUE
════════════════════════════════════════════════════════════ */
export interface QueuedPost {
  id: string
  title: string
  platform: 'LinkedIn' | 'Instagram' | 'WhatsApp' | 'Email' | 'YouTube'
  scheduledFor: string
  status: 'ready' | 'review' | 'draft'
  engagement?: string
  campaign: string
}

export const PUBLISHING_QUEUE: QueuedPost[] = [
  { id: 'q1', title: 'Eid countdown teaser — Unity message',       platform: 'LinkedIn',   scheduledFor: 'Today, 9:00 AM',   status: 'ready',  engagement: '2.4K est.', campaign: 'Eid ul-Adha' },
  { id: 'q2', title: 'Eid generosity story — animated reel',       platform: 'Instagram',  scheduledFor: 'Today, 12:30 PM',  status: 'ready',  engagement: '8.1K est.', campaign: 'Eid ul-Adha' },
  { id: 'q3', title: 'Eid WhatsApp broadcast — 3-part message',    platform: 'WhatsApp',   scheduledFor: 'Tomorrow, 8:00 AM', status: 'review', engagement: '12K est.', campaign: 'Eid ul-Adha' },
  { id: 'q4', title: 'Onam pre-buzz — heritage story',              platform: 'Instagram',  scheduledFor: 'Jun 28, 10:00 AM', status: 'draft',  campaign: 'Onam 2026'   },
  { id: 'q5', title: 'Ganesh pre-launch — artisan spotlight',       platform: 'LinkedIn',   scheduledFor: 'Aug 22, 2:00 PM',  status: 'draft',  campaign: 'Ganesh Utsav' },
]

/* ═══════════════════════════════════════════════════════════
   AI CHAT MESSAGES (AI Content Generator)
════════════════════════════════════════════════════════════ */
export type MessageRole = 'user' | 'ai'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  outputType?: 'linkedin' | 'whatsapp' | 'email'
  actions?: ('copy' | 'save' | 'schedule' | 'regenerate')[]
}

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Generate a LinkedIn post for Diwali 2026 for a premium fintech brand targeting urban millennials in India. Focus on financial empowerment and new beginnings. Tone: warm but aspirational.',
    timestamp: '10:24 AM',
  },
  {
    id: 'msg-2',
    role: 'ai',
    content: `This Diwali, let your money work as hard as your dreams. ✨

Five years ago, Priya started investing ₹500 a month — not because she had extra money, but because she believed in what light represents: new possibilities.

This Festival of Lights, we're reminded that true prosperity isn't just what you celebrate today — it's what you build for tomorrow.

🪔 Whether it's your first SIP, your emergency fund, or finally clearing that loan — every financial step forward is your Diwali gift to yourself.

What financial decision will you make this festive season?

Share below ↓ and let's build a community that grows together.

#Diwali2026 #FinancialFreedom #InvestSmart #NewBeginnings #FestivalOfLights`,
    timestamp: '10:24 AM',
    outputType: 'linkedin',
    actions: ['copy', 'save', 'schedule', 'regenerate'],
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Great! Now create a WhatsApp version — shorter, more conversational, with an emoji-rich style for broadcast messaging.',
    timestamp: '10:26 AM',
  },
  {
    id: 'msg-4',
    role: 'ai',
    content: `✨ *Happy Diwali from [Brand]!* 🪔

This festive season, we're celebrating something special — *YOUR financial journey.*

💰 Every investment you've made. Every saving you've built. Every dream you're working towards.

This Diwali, let's light up your financial future together.

🎁 *Special Diwali offer:* Zero commission on your first investment this month.

👉 Start today: [link]

*Wishing you prosperity, joy, and abundant returns!* 🙏✨`,
    timestamp: '10:27 AM',
    outputType: 'whatsapp',
    actions: ['copy', 'save', 'schedule', 'regenerate'],
  },
]

/* ═══════════════════════════════════════════════════════════
   PROMPT TEMPLATES (Prompt Engineering Lab)
════════════════════════════════════════════════════════════ */
export interface PromptTemplate {
  id: string
  name: string
  category: 'festival' | 'awareness' | 'product' | 'thought-leadership' | 'engagement'
  description: string
  template: string
  variables: PromptVariable[]
  sampleOutput?: string
  usageCount: number
  rating: number
  accentColor: 'purple' | 'cyan' | 'blue' | 'pink'
}

export interface PromptVariable {
  key: string
  label: string
  type: 'text' | 'select'
  options?: string[]
  defaultValue: string
  color: string
}

export const PROMPT_VARIABLES: PromptVariable[] = [
  {
    key: 'festival',
    label: 'Festival',
    type: 'select',
    options: ['Diwali', 'Eid ul-Adha', 'Navratri', 'Onam', 'Ganesh Chaturthi', 'Christmas', 'Pongal'],
    defaultValue: 'Diwali',
    color: 'bg-purple/20 text-purple border-purple/30',
  },
  {
    key: 'region',
    label: 'Region',
    type: 'select',
    options: ['India', 'UAE', 'South Asia', 'Southeast Asia', 'Global', 'Europe', 'North America'],
    defaultValue: 'India',
    color: 'bg-cyan/20 text-cyan border-cyan/30',
  },
  {
    key: 'emotion',
    label: 'Emotion',
    type: 'select',
    options: ['Warm & Aspirational', 'Celebratory', 'Inspirational', 'Nostalgic', 'Bold & Confident', 'Calm & Reflective'],
    defaultValue: 'Warm & Aspirational',
    color: 'bg-pink/20 text-pink border-pink/30',
  },
  {
    key: 'industry',
    label: 'Industry',
    type: 'select',
    options: ['Fintech', 'FMCG', 'Fashion', 'Healthcare', 'EdTech', 'Real Estate', 'Automotive', 'Travel'],
    defaultValue: 'Fintech',
    color: 'bg-blue-accent/20 text-blue-accent border-blue-accent/30',
  },
  {
    key: 'cta_style',
    label: 'CTA Style',
    type: 'select',
    options: ['Question-based', 'Call to action', 'Storytelling', 'Data-led', 'Community invite', 'Urgency-driven'],
    defaultValue: 'Question-based',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    key: 'content_type',
    label: 'Content Type',
    type: 'select',
    options: ['LinkedIn post', 'Carousel copy', 'Email subject line', 'WhatsApp message', 'Campaign tagline', 'Video script hook'],
    defaultValue: 'LinkedIn post',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
]

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tpl-festival-linkedin',
    name: 'Festival LinkedIn Post',
    category: 'festival',
    description: 'Craft a high-engagement LinkedIn post aligned to a cultural festival moment',
    template: `Create a {{content_type}} for the {{festival}} festival targeting a {{region}} audience in the {{industry}} sector.

Tone: {{emotion}}
CTA Style: {{cta_style}}

The content should:
• Authentically connect the brand to the cultural moment
• Use storytelling to drive emotional resonance
• Include a specific insight or data point if relevant
• End with an engaging community-building {{cta_style}} CTA
• Be optimized for LinkedIn's algorithm (under 1,300 characters for preview)

Avoid: Generic greetings, clichés, or hollow brand speak.`,
    variables: PROMPT_VARIABLES,
    usageCount: 847,
    rating: 4.9,
    accentColor: 'purple',
  },
  {
    id: 'tpl-whatsapp-broadcast',
    name: 'WhatsApp Broadcast',
    category: 'festival',
    description: 'Short, emoji-rich broadcast message for WhatsApp campaigns',
    template: `Write a WhatsApp broadcast message for {{festival}} for a {{industry}} brand in {{region}}.

Tone: {{emotion}}

Requirements:
• Keep under 280 characters for preview
• Use strategic emojis (2-4 max)
• Include a clear, urgent CTA
• Bold key phrases with *asterisks*
• End with a clickable link placeholder`,
    variables: PROMPT_VARIABLES.filter(v => ['festival', 'region', 'emotion', 'industry'].includes(v.key)),
    usageCount: 623,
    rating: 4.7,
    accentColor: 'cyan',
  },
  {
    id: 'tpl-campaign-tagline',
    name: 'Campaign Tagline Generator',
    category: 'festival',
    description: 'Generate 5 campaign tagline options with emotional rationale',
    template: `Generate 5 campaign tagline options for a {{festival}} campaign in the {{industry}} sector for {{region}} audiences.

Emotion to evoke: {{emotion}}

For each tagline provide:
1. The tagline (under 10 words)
2. Emotional rationale (1 sentence)
3. Cultural resonance explanation (1 sentence)

Format as a numbered list. Taglines should be distinct in style — try: poetic, bold, question, metaphor, and data-inspired.`,
    variables: PROMPT_VARIABLES.filter(v => ['festival', 'industry', 'region', 'emotion'].includes(v.key)),
    usageCount: 412,
    rating: 4.8,
    accentColor: 'blue',
  },
  {
    id: 'tpl-thought-leadership',
    name: 'Thought Leadership Post',
    category: 'thought-leadership',
    description: 'Executive perspective on cultural trends and market opportunities',
    template: `Write a thought-leadership {{content_type}} from the perspective of a senior {{industry}} executive about the {{festival}} opportunity in {{region}}.

Tone: {{emotion}}

Structure:
• Hook: A non-obvious observation about this cultural moment
• Insight: What data or trend supports this?
• Implication: What does this mean for brands in {{industry}}?
• Forward-looking CTA: {{cta_style}}

Voice: Authoritative but accessible. No jargon. Use "we" sparingly.`,
    variables: PROMPT_VARIABLES,
    usageCount: 289,
    rating: 4.6,
    accentColor: 'pink',
  },
]

/* ═══════════════════════════════════════════════════════════
   LINKEDIN SCHEDULED POSTS (Calendar)
════════════════════════════════════════════════════════════ */
export type PostType = 'festival' | 'thought-leadership' | 'product' | 'engagement' | 'ai-recommended'

export interface ScheduledPost {
  id: string
  title: string
  preview: string
  date: number   // Day of month
  month: number  // 0-indexed
  year: number
  time: string
  type: PostType
  platform: 'LinkedIn'
  status: 'scheduled' | 'draft' | 'published'
  predictedImpressions: string
  culturalResonance: number
  bestTimeScore: number
  campaign?: string
  tags: string[]
}

export const SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: 'lp-1', title: 'Eid ul-Adha — Generosity in Leadership', date: 14, month: 5, year: 2026,
    time: '9:00 AM', type: 'festival', platform: 'LinkedIn', status: 'scheduled',
    predictedImpressions: '18.4K', culturalResonance: 94, bestTimeScore: 97,
    preview: 'This Eid, the most powerful business lesson isn\'t in a boardroom — it\'s in an act of giving. Here\'s what generosity teaches us about leadership...',
    campaign: 'Eid ul-Adha', tags: ['Eid', 'Leadership', 'Culture'],
  },
  {
    id: 'lp-2', title: 'Eid Campaign — Community Spotlight Reel', date: 16, month: 5, year: 2026,
    time: '10:30 AM', type: 'festival', platform: 'LinkedIn', status: 'scheduled',
    predictedImpressions: '24.2K', culturalResonance: 97, bestTimeScore: 92,
    preview: 'EidMubarak to every professional, entrepreneur, and dreamer in our community. Today we celebrate what unites us...',
    campaign: 'Eid ul-Adha', tags: ['EidMubarak', 'Community'],
  },
  {
    id: 'lp-3', title: 'AI & Cultural Intelligence: Market Insight', date: 18, month: 5, year: 2026,
    time: '8:00 AM', type: 'thought-leadership', platform: 'LinkedIn', status: 'published',
    predictedImpressions: '31.4K', culturalResonance: 71, bestTimeScore: 95,
    preview: 'Brands that understand culture outperform their peers by 3.4x. Here\'s the data behind cultural intelligence in marketing...',
    tags: ['CulturalIntelligence', 'AI', 'Marketing'],
  },
  {
    id: 'lp-4', title: 'Post-Eid Recovery & What We Learned', date: 22, month: 5, year: 2026,
    time: '2:00 PM', type: 'engagement', platform: 'LinkedIn', status: 'draft',
    predictedImpressions: '14.8K', culturalResonance: 78, bestTimeScore: 82,
    preview: 'We ran 6 campaigns across 4 markets this Eid. Here\'s what the data tells us about cultural resonance in 2026...',
    campaign: 'Eid ul-Adha', tags: ['CampaignReport', 'Insights'],
  },
  {
    id: 'lp-5', title: 'AI-Recommended: Q2 Cultural Roundup', date: 25, month: 5, year: 2026,
    time: '9:30 AM', type: 'ai-recommended', platform: 'LinkedIn', status: 'draft',
    predictedImpressions: '21.6K', culturalResonance: 88, bestTimeScore: 91,
    preview: 'Three cultural shifts happening right now that every marketer needs to know about heading into Q3...',
    tags: ['Trends', 'Q2Review', 'CulturalMarketing'],
  },
  {
    id: 'lp-6', title: 'Onam Preview: Southern Markets Deep Dive', date: 28, month: 5, year: 2026,
    time: '11:00 AM', type: 'festival', platform: 'LinkedIn', status: 'draft',
    predictedImpressions: '16.2K', culturalResonance: 86, bestTimeScore: 88,
    preview: 'Onam is 10 weeks away. Here\'s why the most culturally attuned brands are already preparing — and how to get ahead...',
    campaign: 'Onam 2026', tags: ['Onam', 'Preparation', 'Strategy'],
  },
]

/* ═══════════════════════════════════════════════════════════
   EXECUTIVE DASHBOARD ANALYTICS
════════════════════════════════════════════════════════════ */
export const REGIONAL_INSIGHTS = [
  { region: 'South Asia',    score: 94, activeCampaigns: 6, trend: '+14.2%', color: 'bg-purple'     },
  { region: 'Middle East',   score: 88, activeCampaigns: 4, trend: '+8.7%',  color: 'bg-cyan'       },
  { region: 'Southeast Asia', score: 81, activeCampaigns: 3, trend: '+6.1%', color: 'bg-blue-accent' },
  { region: 'Europe',        score: 73, activeCampaigns: 2, trend: '+4.4%',  color: 'bg-pink'       },
  { region: 'North America', score: 68, activeCampaigns: 2, trend: '+3.2%',  color: 'bg-purple'     },
]

export const CONTENT_PERFORMANCE = [
  { type: 'Festival Posts',       reach: '48.2M',  engagement: '9.4%',  posts: 124 },
  { type: 'Thought Leadership',   reach: '21.6M',  engagement: '6.7%',  posts: 47  },
  { type: 'AI-Generated Content', reach: '32.4M',  engagement: '8.1%',  posts: 89  },
  { type: 'Campaign Assets',      reach: '91.2M',  engagement: '11.8%', posts: 312 },
]
