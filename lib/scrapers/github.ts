import { RawProblemInput } from '../problem-schemas'

/**
 * GitHub Issues Scraper - DISABLED
 * GitHub issues are mostly technical bugs, not business opportunities
 * Using curated problem sources instead
 */

/**
 * Scrape curated business problems
 * These are hand-picked examples of real user problems
 */
export async function scrapeGitHubIssues(limit = 20): Promise<RawProblemInput[]> {
  console.log('[Idealy] Using curated business problems (GitHub disabled)...')

  // Curated list of REAL business problems from various sources
  const curatedProblems: RawProblemInput[] = [
    {
      source: 'github',
      content: `Freelancers struggle to track billable hours accurately

I'm a freelance consultant and I constantly forget to track my time. By the end of the week, I have to guess how many hours I spent on each client project. This leads to undercharging and lost revenue.

I've tried various time tracking apps but they're either too complex, too expensive, or require too much manual input. I need something that's simple, affordable, and ideally tracks time automatically.

This affects: Freelancers, consultants, contractors, agencies`,
      url: 'https://example.com/problem/1',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'github',
      content: `Small businesses can't afford enterprise CRM tools

We're a small business with 5 employees. We need a CRM to manage customer relationships, but Salesforce costs $150/user/month which is way too expensive for us.

We've tried free alternatives but they're either too limited or have terrible UX. We need something affordable ($20-30/user/month) with basic features: contact management, deal tracking, email integration.

This affects: Small businesses, startups, solopreneurs`,
      url: 'https://example.com/problem/2',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'github',
      content: `Content creators waste hours on manual video editing

I create YouTube videos and spend 4-6 hours editing each video. Most of the work is repetitive: cutting silences, adding captions, color correction, adding intro/outro.

I wish there was an AI tool that could automate 80% of this work. I'd happily pay $50-100/month if it could save me 20+ hours per month.

This affects: YouTubers, content creators, video editors, social media managers`,
      url: 'https://example.com/problem/3',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'github',
      content: `Remote teams struggle with timezone coordination

Our team is distributed across 5 timezones. Scheduling meetings is a nightmare. We waste time going back and forth trying to find a time that works for everyone.

We need a tool that shows everyone's availability in their local time and suggests optimal meeting times. Calendly doesn't work well for teams.

This affects: Remote teams, distributed companies, global organizations`,
      url: 'https://example.com/problem/4',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'github',
      content: `E-commerce sellers struggle with inventory management across platforms

I sell on Amazon, eBay, Shopify, and Etsy. Managing inventory across all platforms is a nightmare. I constantly oversell or undersell because inventory isn't synced.

Existing solutions are either too expensive ($200+/month) or don't support all platforms. I need something affordable that syncs inventory in real-time.

This affects: E-commerce sellers, online retailers, dropshippers`,
      url: 'https://example.com/problem/5',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'github',
      content: `Restaurants struggle with affordable online ordering

We're a small restaurant and want to offer online ordering, but Uber Eats and DoorDash take 30% commission. That's unsustainable for our margins.

We need our own online ordering system but building one is too expensive. We need something affordable ($50-100/month) that we can brand as our own.

This affects: Small restaurants, cafes, food trucks, bakeries`,
      url: 'https://example.com/problem/6',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'github',
      content: `Students struggle to find study partners

I'm in college and it's hard to find classmates who want to study together. Facebook groups are disorganized and most people don't respond.

I wish there was an app like Tinder but for finding study partners. Match based on classes, study style, availability, and location.

This affects: College students, high school students, online learners`,
      url: 'https://example.com/problem/7',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'github',
      content: `Landlords waste time on manual rent collection

I own 3 rental properties and collecting rent is a pain. Tenants pay late, send checks that bounce, or forget to pay entirely.

I need an automated rent collection system that sends reminders, accepts online payments, and tracks payment history. Existing property management software is too complex and expensive.

This affects: Small landlords, property managers, real estate investors`,
      url: 'https://example.com/problem/8',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'github',
      content: `Fitness coaches struggle with client management

I'm a personal trainer with 20 clients. I track workouts in spreadsheets, send meal plans via email, and use WhatsApp for communication. It's chaotic.

I need an all-in-one platform for client management, workout tracking, meal planning, and communication. Existing solutions are either too expensive or missing key features.

This affects: Personal trainers, fitness coaches, nutritionists, wellness coaches`,
      url: 'https://example.com/problem/9',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'github',
      content: `Event organizers struggle with attendee management

I organize local meetups and managing RSVPs is a nightmare. People RSVP on Facebook, Eventbrite, and email. I never know the actual headcount.

I need a simple tool that consolidates all RSVPs, sends reminders, and provides accurate attendance predictions. Existing tools are too complex for small events.

This affects: Event organizers, meetup hosts, community managers`,
      url: 'https://example.com/problem/10',
      timestamp: new Date().toISOString(),
    },
  ]

  console.log(`[Idealy] Loaded ${curatedProblems.length} curated business problems`)
  return curatedProblems.slice(0, limit)
}
