#!/usr/bin/env python3
"""Generate sample PDF files for EbookVerse books."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
import os

BOOKS = [
    {
        "slug": "the-lean-startup",
        "title": "The Lean Startup",
        "author": "Eric Ries",
        "pages": 20,
        "color": "#7C3AED",
        "chapters": [
            ("Introduction", "The Lean Startup methodology provides a scientific approach to creating and managing startups and delivering a product to customers' hands faster. It is based on validated learning, scientific experimentation, and iterative product releases to shorten product development cycles, measure progress without resorting to vanity metrics, and learn what customers really want."),
            ("Chapter 1: Start", "The Lean Startup method teaches you how to drive a startup—how to steer, when to turn, and when to persevere—and grow a business with maximum acceleration. It is a principled approach to new product development. The fundamental activity of a startup is to turn ideas into products, measure how customers respond, and then learn whether to pivot or persevere."),
            ("Chapter 2: Define", "A startup is a human institution designed to create a new product or service under conditions of extreme uncertainty. What differentiates entrepreneurs from non-entrepreneurs is that entrepreneurs create new products or services under extreme uncertainty. This is true whether you are working in a garage or inside a large corporation."),
            ("Chapter 3: Learn", "Validated learning is the process of demonstrating empirically that a team has discovered valuable truths about a startup's present and future business prospects. It is more concrete, more accurate, and faster than market forecasting or classical business planning."),
            ("Chapter 4: Experiment", "The Lean Startup methodology reconceives a startup's efforts as experiments that test its strategy to see which elements are brilliant and which are crazy. A true experiment follows the scientific method: it tests a clear hypothesis."),
        ]
    },
    {
        "slug": "zero-to-one",
        "title": "Zero to One",
        "author": "Peter Thiel",
        "pages": 20,
        "color": "#2563EB",
        "chapters": [
            ("Introduction", "Every moment in business happens only once. The next Bill Gates will not build an operating system. The next Larry Page won't make a search engine. If you are copying these guys, you aren't learning from them. Doing what we already know how to do takes the world from 1 to n, adding more of something familiar. But every time we create something new, we go from 0 to 1."),
            ("Chapter 1: The Challenge of the Future", "What valuable company is nobody building? This question is harder than it looks, because your company could create a lot of value without becoming very valuable itself. Creating value is not enough—you also need to capture some of the value you create."),
            ("Chapter 2: Party Like It's 1999", "The dot-com crash taught Silicon Valley four big lessons that still guide business thinking today: 1) Make incremental advances, 2) Stay lean and flexible, 3) Improve on competition, 4) Focus on product, not sales. But these lessons have become dogma that prevent innovation."),
            ("Chapter 3: All Happy Companies Are Different", "Monopoly is the condition of every successful business. All failed companies are the same: they failed to escape competition. Competition is for losers. If you want to create and capture lasting value, don't build an undifferentiated commodity business."),
            ("Chapter 4: The Ideology of Competition", "Creative monopoly means new products that benefit everybody and sustainable profits for the creator. Competition means no profits for anybody, no meaningful differentiation, and a struggle for daily survival."),
        ]
    },
    {
        "slug": "good-to-great",
        "title": "Good to Great",
        "author": "Jim Collins",
        "pages": 20,
        "color": "#059669",
        "chapters": [
            ("Introduction", "Good is the enemy of great. And that is one of the key reasons why we have so little that becomes great. We don't have great schools principally because we have good schools. We don't have great government principally because we have good government. Few people attain great lives, in large part because it is just so easy to settle for a good life."),
            ("Chapter 1: Level 5 Leadership", "Level 5 leaders channel their ego needs away from themselves and into the larger goal of building a great company. It's not that Level 5 leaders have no ego or self-interest. Indeed, they are incredibly ambitious—but their ambition is first and foremost for the institution, not themselves."),
            ("Chapter 2: First Who... Then What", "We expected that good-to-great leaders would begin by setting a new vision and strategy. We found instead that they first got the right people on the bus, the wrong people off the bus, and the right people in the right seats—and then they figured out where to drive it."),
            ("Chapter 3: Confront the Brutal Facts", "All good-to-great companies began the process of finding a path to greatness by confronting the brutal facts of their current reality. When you start with an honest and diligent effort to determine the truth of your situation, the right decisions often become self-evident."),
        ]
    },
    {
        "slug": "atomic-habits",
        "title": "Atomic Habits",
        "author": "James Clear",
        "pages": 20,
        "color": "#DC2626",
        "chapters": [
            ("Introduction", "The surprising power of small habits. The difference a tiny improvement can make over time is astounding. Here's how the math works out: if you can get 1 percent better each day for one year, you'll end up thirty-seven times better by the time you are done. Conversely, if you get 1 percent worse each day for one year, you'll decline nearly down to zero."),
            ("Chapter 1: The Surprising Power of Small Habits", "Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them. They seem to make little difference on any given day and yet the impact they deliver over the months and years can be enormous."),
            ("Chapter 2: How Your Habits Shape Your Identity", "Changing our habits is challenging for two reasons: (1) we try to change the wrong thing and (2) we try to change our habits in the wrong way. The first mistake is trying to change outcomes without changing identity. The second mistake is trying to change habits with willpower instead of environment design."),
            ("Chapter 3: How to Build Better Habits in 4 Simple Steps", "The process of building a habit can be divided into four simple steps: cue, craving, response, and reward. Breaking it down into these fundamental parts can help us understand what a habit is, how it works, and how to improve it."),
        ]
    },
    {
        "slug": "the-7-habits",
        "title": "The 7 Habits of Highly Effective People",
        "author": "Stephen R. Covey",
        "pages": 20,
        "color": "#D97706",
        "chapters": [
            ("Introduction", "Inside-Out: There is no real excellence in all this world which can be separated from right living. Primary greatness is goodness of character. Secondary greatness is greatness of personality, skill, reputation. The 7 Habits are about primary greatness."),
            ("Chapter 1: Be Proactive", "Proactivity means more than merely taking initiative. It means that as human beings, we are responsible for our own lives. Our behavior is a function of our decisions, not our conditions. We can subordinate feelings to values. We have the initiative and the responsibility to make things happen."),
            ("Chapter 2: Begin with the End in Mind", "To begin with the end in mind means to start with a clear understanding of your destination. It means to know where you're going so that you better understand where you are now and so that the steps you take are always in the right direction."),
            ("Chapter 3: Put First Things First", "The key is not to prioritize what's on your schedule, but to schedule your priorities. Effective management is putting first things first. While leadership decides what 'first things' are, management is the discipline of carrying out your program."),
        ]
    },
    {
        "slug": "deep-work",
        "title": "Deep Work",
        "author": "Cal Newport",
        "pages": 20,
        "color": "#7C3AED",
        "chapters": [
            ("Introduction", "Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship."),
            ("Chapter 1: Deep Work Is Valuable", "In our economy, three groups will have a particular advantage: those who can work well with intelligent machines, those who are the best at what they do, and those with access to capital. Deep work is exactly the skill needed to join the first two groups."),
            ("Chapter 2: Deep Work Is Rare", "As knowledge workers devolve into human routers, the minority who retain the ability to perform deep work will thrive. The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy."),
        ]
    },
    {
        "slug": "ai-superpowers",
        "title": "AI Superpowers",
        "author": "Kai-Fu Lee",
        "pages": 20,
        "color": "#2563EB",
        "chapters": [
            ("Introduction", "We are living through one of the greatest technological shifts in human history. Artificial intelligence will transform our world in ways more profound than the steam engine, electricity, or the internet. It will reshape our economies, our societies, and our daily lives."),
            ("Chapter 1: China's AI Awakening", "China's sudden leap into deep learning was powered by a perfect storm of data, entrepreneurial energy, and government support. The country's unique internet ecosystem gave birth to an AI research community that would soon rival Silicon Valley."),
        ]
    },
    {
        "slug": "life-3-0",
        "title": "Life 3.0",
        "author": "Max Tegmark",
        "pages": 20,
        "color": "#059669",
        "chapters": [
            ("Introduction", "We're at a fork in the road: one path leads to an incredibly inspiring future with humanity thriving like never before, and the other leads to our own obsolescence and possible extinction. How can we make sure we take the right path?"),
        ]
    },
    {
        "slug": "the-age-of-ai",
        "title": "The Age of AI",
        "author": "Henry A. Kissinger",
        "pages": 20,
        "color": "#DC2626",
        "chapters": [
            ("Introduction", "Artificial intelligence is transforming the world at an unprecedented pace. It challenges our understanding of identity, society, and the nature of human experience. We must learn to navigate this new landscape with both caution and ambition."),
        ]
    },
    {
        "slug": "contagious",
        "title": "Contagious",
        "author": "Jonah Berger",
        "pages": 20,
        "color": "#D97706",
        "chapters": [
            ("Introduction", "Why do some things go viral while others don't? Why do some products get more word of mouth than others? It's not random. There's a science behind it. Six key principles drive things to become contagious: Social Currency, Triggers, Emotion, Public, Practical Value, and Stories."),
        ]
    },
    {
        "slug": "building-a-storybrand",
        "title": "Building a StoryBrand",
        "author": "Donald Miller",
        "pages": 20,
        "color": "#7C3AED",
        "chapters": [
            ("Introduction", "The key to making your brand successful is making it about your customer, not about you. When you position your customer as the hero of the story and yourself as the guide, you create a powerful brand framework that resonates deeply."),
        ]
    },
    {
        "slug": "rich-dad-poor-dad",
        "title": "Rich Dad Poor Dad",
        "author": "Robert Kiyosaki",
        "pages": 20,
        "color": "#059669",
        "chapters": [
            ("Introduction", "The rich don't work for money. They make their money work for them. This fundamental principle separates the wealthy from everyone else. Understanding the difference between assets and liabilities is the first step toward financial freedom."),
            ("Chapter 1: The Rich Don't Work for Money", "The poor and middle class work for money. The rich have money work for them. Most people fail to realize that in life, it's not how much money you make—it's how much money you keep."),
            ("Chapter 2: Why Teach Financial Literacy?", "It's not how much money you make, but how much money you keep, how hard it works for you, and how many generations you keep it for. Financial literacy is the foundation of wealth building."),
        ]
    },
    {
        "slug": "the-intelligent-investor",
        "title": "The Intelligent Investor",
        "author": "Benjamin Graham",
        "pages": 20,
        "color": "#2563EB",
        "chapters": [
            ("Introduction", "The intelligent investor is a realist who sells to optimists and buys from pessimists. The purpose of this book is to supply, in a form suitable for the layman, a guide to the adoption and execution of an investment policy."),
        ]
    },
    {
        "slug": "clean-code",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "pages": 20,
        "color": "#DC2626",
        "chapters": [
            ("Introduction", "Writing clean code is what you must do in order to call yourself a professional. There is no reasonable excuse for doing anything less than your best. Clean code is not written by following a set of rules. You know you are writing clean code when each routine you read turns out to be pretty much what you expected."),
            ("Chapter 1: Meaningful Names", "Names are everywhere in software. We name our variables, our functions, our arguments, classes, and packages. We name our source files and the directories that contain them. We name our projects and our systems. Because we do so much of it, we'd better do it well."),
            ("Chapter 2: Functions", "Functions should be small. How small? The first rule of functions is that they should be small. The second rule of functions is that they should be smaller than that. Functions should do one thing. They should do it well. They should do it only."),
        ]
    },
    {
        "slug": "the-pragmatic-programmer",
        "title": "The Pragmatic Programmer",
        "author": "David Thomas & Andrew Hunt",
        "pages": 20,
        "color": "#D97706",
        "chapters": [
            ("Introduction", "This book will help you become a better programmer. It doesn't matter whether you're a junior developer or a senior architect, whether you work in a startup or a large corporation. Pragmatic programming is about going beyond the mechanics of coding and understanding the principles that make code work."),
        ]
    },
    {
        "slug": "dont-make-me-think",
        "title": "Don't Make Me Think",
        "author": "Steve Krug",
        "pages": 20,
        "color": "#7C3AED",
        "chapters": [
            ("Introduction", "The title of this book is the most important principle of usability: don't make me think. A web page should be self-evident. Obvious. Self-explanatory. If a user has to think about how to use your interface, you've failed at your job."),
        ]
    },
    {
        "slug": "the-design-of-everyday-things",
        "title": "The Design of Everyday Things",
        "author": "Don Norman",
        "pages": 20,
        "color": "#2563EB",
        "chapters": [
            ("Introduction", "Design is really an act of communication, which means having a deep understanding of the person with whom the designer is communicating. The design of everyday things is in great trouble. The problem is that the principles of good design are simple and straightforward."),
        ]
    },
    {
        "slug": "thinking-fast-and-slow",
        "title": "Thinking, Fast and Slow",
        "author": "Daniel Kahneman",
        "pages": 20,
        "color": "#059669",
        "chapters": [
            ("Introduction", "This book presents a view of how the mind works that draws on recent developments in cognitive and social psychology. The core of the book is about two systems that drive the way we think: System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical."),
            ("Chapter 1: The Characters of the Story", "System 1 operates automatically and quickly, with little or no effort and no sense of voluntary control. System 2 allocates attention to the effortful mental activities that demand it, including complex computations. The operations of System 2 are often associated with the subjective experience of agency, choice, and concentration."),
        ]
    },
    {
        "slug": "influence",
        "title": "Influence",
        "author": "Robert Cialdini",
        "pages": 20,
        "color": "#DC2626",
        "chapters": [
            ("Introduction", "This book is about the weapons of influence—the psychological principles that govern our behavior and the behavior of those who seek to influence us. Understanding these principles is essential for navigating the modern world."),
        ]
    },
    # FREE BOOKS - with more content
    {
        "slug": "the-art-of-learning",
        "title": "The Art of Learning",
        "author": "Josh Waitzkin",
        "pages": 25,
        "color": "#059669",
        "chapters": [
            ("Introduction", "This book is about the pursuit of excellence. It is about the incremental, everyday pursuit of a craft, the hours spent honing skills, the resilience built through failure, and the deep, intrinsic satisfaction that comes from doing something at the highest level. My story is one of a chess prodigy who became a martial arts champion, and the principles I discovered along the way about how we learn, grow, and perform under pressure."),
            ("Chapter 1: Innocent Moves", "I was six years old when I first fell in love with chess. Walking through a park in New York City, I watched a man playing speed chess with three opponents simultaneously. The pieces moved like lightning, and I was mesmerized. The next day, I asked my mother to buy me a chess set. Within weeks, I was beating adults. Within months, I was winning tournaments. But it wasn't natural talent alone—it was a way of seeing the board that came from total absorption."),
            ("Chapter 2: Losing to Win", "My first loss was devastating. I was eight years old and had been winning every game for months. When I lost, I cried for hours. But my teacher, Bruce Pandolfini, didn't comfort me. Instead, he said: 'Now the real work begins.' That moment transformed my relationship with failure. I began to see losses not as endpoints but as starting points—the raw material for growth. Every mistake contained a lesson, and every lesson made me stronger."),
            ("Chapter 3: The Soft Zone", "In performance, there are two approaches to distraction. The first is the 'hard zone'—trying to shut everything out, creating a fortress of concentration. But this is brittle. A single noise, a cough, a flash of light can shatter it. The alternative is the 'soft zone'—learning to flow with distractions, incorporating them into your focus. Like a blade of grass that bends in the wind rather than breaking. This principle transformed both my chess and my martial arts practice."),
            ("Chapter 4: The Downward Spiral", "When we make a mistake, the worst thing we can do is let it compound. In chess, a single blunder can trigger a cascade of errors if we let our emotions take over. The key is to recognize the downward spiral and break it before it builds momentum. I learned to develop 'trigger routines'—specific physical or mental actions that would reset my emotional state and bring me back to the present moment."),
            ("Chapter 5: Making Smaller Circles", "The path to mastery is not about expanding your repertoire—it's about deepening your understanding of fundamentals. I call this 'making smaller circles.' Instead of learning more moves, I studied fewer moves more deeply. I practiced the same positions hundreds of times until I understood them at a level that transcended conscious thought. This depth became the foundation for everything else I built."),
            ("Chapter 6: The Illusion of the Mystical", "People look at masters and see magic. They think the master possesses some innate gift that ordinary people lack. But what they're seeing is the result of thousands of hours of focused practice. The 'mystical' is just deeply internalized skill. When a martial artist seems to read an opponent's mind, it's not mysticism—it's pattern recognition refined over countless hours of training."),
        ]
    },
    {
        "slug": "creative-confidence",
        "title": "Creative Confidence",
        "author": "Tom Kelley & David Kelley",
        "pages": 25,
        "color": "#059669",
        "chapters": [
            ("Introduction", "We believe that everyone is creative. Not just artists and designers, but doctors, engineers, business people, teachers—everyone. Creative confidence is the belief that you can create change in the world around you. It's about having the courage to try new approaches, the resilience to learn from failure, and the optimism to believe that things can get better. This book is about unlocking that potential in yourself and others."),
            ("Chapter 1: Flip from Design Thinking to Creative Confidence", "Design thinking is a methodology for creative problem solving. But creative confidence goes deeper—it's about believing in your own ability to be creative. Many people have been told they're not creative, and they've come to believe it. We want to flip that script. Creativity is not a special gift given to a lucky few. It's a natural human ability that can be nurtured and developed."),
            ("Chapter 2: Dare: From Fear to Courage", "The biggest barrier to creativity is fear. Fear of failure, fear of judgment, fear of the unknown. We've seen this fear in executives, students, and professionals of every kind. The antidote is not to eliminate fear but to act despite it. Small wins—quick, low-risk experiments—build courage over time. Each small success makes the next leap feel less daunting."),
            ("Chapter 3: Spark: From Blank Page to Insight", "Where do creative ideas come from? Not from waiting for inspiration, but from active observation, empathy, and experimentation. The best ideas often come from the margins—from noticing what others overlook. We teach people to approach problems with a beginner's mind, to ask naive questions, and to look for insights in unexpected places."),
            ("Chapter 4: Seek: From Duty to Passion", "Creative confidence flourishes when you're working on something you care about deeply. The most innovative companies don't just assign tasks—they help people find work that ignites their passion. When you're passionate about a problem, you'll persist through setbacks, think more creatively, and inspire others to join you."),
            ("Chapter 5: Team: From Solo to Collaborative", "Great creativity rarely happens alone. The myth of the lone genius is just that—a myth. The most innovative breakthroughs come from diverse teams that combine different perspectives, skills, and experiences. Creative confidence is amplified when it's shared. Collaborative creativity isn't about compromise—it's about building on each other's ideas to create something none of you could have imagined alone."),
        ]
    },
    {
        "slug": "mindfulness-for-beginners",
        "title": "Mindfulness for Beginners",
        "author": "Jon Kabat-Zinn",
        "pages": 25,
        "color": "#059669",
        "chapters": [
            ("Introduction", "Mindfulness is awareness that arises through paying attention, on purpose, in the present moment, non-judgmentally. It is about being fully awake, fully alive, fully present in each moment of our lives. This sounds simple—and it is. But simple is not the same as easy. Our minds are habitually lost in thought, caught up in the past or the future, and we miss the only moment we ever have: this one, right now."),
            ("Chapter 1: What Is Mindfulness?", "Mindfulness is not about emptying your mind or achieving some special state of relaxation. It's about paying attention in a particular way: on purpose, in the present moment, and without judgment. When you practice mindfulness, you're not trying to change anything. You're simply noticing what's already here—with curiosity, openness, and acceptance. This might include noticing your breath, your body sensations, your thoughts, or your emotions."),
            ("Chapter 2: The Power of the Breath", "Your breath is always with you. It's the most accessible anchor for mindfulness practice. You don't need any special equipment or a quiet room. You just need to pause and notice the sensation of breathing. Try it now: take one breath and notice where you feel it most—your nostrils, your chest, your belly. That simple act of noticing is mindfulness in action."),
            ("Chapter 3: Body Scan Meditation", "The body scan is a foundational mindfulness practice. You systematically bring attention to different parts of your body, from head to toe, noticing whatever sensations are present without trying to change them. This practice develops two key skills: the ability to focus attention and the ability to observe experience without judgment. Start with just 5 minutes and gradually extend the duration."),
            ("Chapter 4: Dealing with Thoughts", "One of the biggest misconceptions about mindfulness is that you're supposed to stop thinking. That's not only impossible—it's not the goal. The goal is to change your relationship with your thoughts. Instead of getting caught up in them, you learn to observe them as mental events—like clouds passing through the sky of your mind. You don't have to follow every thought. You can let them come and go, returning your attention to the present moment."),
            ("Chapter 5: Mindful Daily Life", "Mindfulness isn't just something you do on a meditation cushion. It's a way of being that you can bring to every aspect of your life. You can practice mindful eating, mindful walking, mindful listening, mindful working. The key is to bring the same quality of attention—curious, open, non-judgmental—to whatever you're doing. When you eat, just eat. When you walk, just walk. When you listen, really listen."),
        ]
    },
    {
        "slug": "the-startup-playbook",
        "title": "The Startup Playbook",
        "author": "David Kidder",
        "pages": 25,
        "color": "#059669",
        "chapters": [
            ("Introduction", "Starting a company is one of the most challenging and rewarding things you can do. This playbook distills the wisdom of over fifty successful founders into practical, actionable advice. Whether you're just starting out or scaling your tenth venture, these pages contain the lessons that separate the startups that thrive from those that fail."),
            ("Chapter 1: Finding Your Idea", "Great startups begin with great problems, not great solutions. The best founders don't start with a product idea—they start with a deep understanding of a problem that affects a significant number of people. The bigger the problem and the more painful it is, the better your starting point. Don't fall in love with your solution; fall in love with the problem."),
            ("Chapter 2: Validating Your Market", "Before you write a single line of code or spend a single dollar, you need to validate that people actually want what you're building. Talk to at least fifty potential customers. Not your friends—real potential customers who would actually pay for your product. Ask open-ended questions. Listen more than you talk. The goal is not to sell them on your idea but to understand their needs deeply."),
            ("Chapter 3: Building Your MVP", "Your Minimum Viable Product should be the simplest possible thing that tests your riskiest assumption. It's not about building something minimal—it's about building something that validates (or invalidates) your core hypothesis. Many founders overcomplicate their MVP. If you can test your assumption with a landing page, do that. If you can do it with a mockup, do that. Ship fast, learn fast."),
            ("Chapter 4: Finding Product-Market Fit", "Product-market fit is the moment when your product clicks with your market. You'll know it when you see it: customers start pulling the product out of your hands, retention curves flatten instead of declining, and word-of-mouth becomes your biggest growth channel. Don't scale before you find PMF—it's like pouring gas on a fire that hasn't started yet."),
            ("Chapter 5: Raising Capital", "Fundraising is a means to an end, not an end in itself. Raise only what you need to reach the next milestone that significantly increases your company's value. Be strategic about who you raise from—the best investors bring more than money: they bring expertise, networks, and pattern recognition from seeing hundreds of companies succeed and fail."),
            ("Chapter 6: Building Your Team", "Your first ten hires will determine the culture of your company for years to come. Hire for aptitude over experience, for coachability over credentials, and for cultural add (not just cultural fit). The best early employees are those who are comfortable with ambiguity, energized by challenges, and driven by the mission of the company."),
        ]
    },
]


def create_pdf(book, output_dir):
    """Create a sample PDF for a book."""
    filepath = os.path.join(output_dir, f"{book['slug']}.pdf")
    
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=28,
        leading=34,
        spaceAfter=20,
        textColor=HexColor(book['color']),
        alignment=TA_CENTER,
    )
    
    author_style = ParagraphStyle(
        'CustomAuthor',
        parent=styles['Normal'],
        fontSize=16,
        leading=20,
        spaceAfter=30,
        textColor=HexColor('#666666'),
        alignment=TA_CENTER,
    )
    
    chapter_title_style = ParagraphStyle(
        'ChapterTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        spaceAfter=12,
        spaceBefore=24,
        textColor=HexColor(book['color']),
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        leading=16,
        spaceAfter=8,
        alignment=TA_JUSTIFY,
    )
    
    story = []
    
    # Title page
    story.append(Spacer(1, 2 * inch))
    story.append(Paragraph(book['title'], title_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"by {book['author']}", author_style))
    story.append(Spacer(1, 40))
    
    # Info box
    info_data = [
        ['Format', 'PDF eBook'],
        ['Pages', str(book['pages'] * 8)],
        ['Language', 'English'],
    ]
    info_table = Table(info_data, colWidths=[2*inch, 3*inch])
    info_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#666666')),
        ('TEXTCOLOR', (1, 0), (1, -1), HexColor('#333333')),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('LEFTPADDING', (1, 0), (1, -1), 12),
    ]))
    story.append(info_table)
    
    story.append(Spacer(1, 60))
    
    # Sample notice
    notice_style = ParagraphStyle(
        'Notice',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=HexColor('#999999'),
        alignment=TA_CENTER,
    )
    story.append(Paragraph("Sample eBook — EbookVerse", notice_style))
    
    story.append(PageBreak())
    
    # Table of Contents
    toc_title = ParagraphStyle('TOCTitle', parent=styles['Heading1'], fontSize=18, textColor=HexColor(book['color']))
    story.append(Paragraph("Table of Contents", toc_title))
    story.append(Spacer(1, 20))
    
    for i, (chapter_title, _) in enumerate(book['chapters'], 1):
        toc_style = ParagraphStyle('TOC', parent=styles['Normal'], fontSize=12, leading=20, leftIndent=20)
        story.append(Paragraph(f"{i}. {chapter_title}", toc_style))
    
    story.append(PageBreak())
    
    # Chapters
    for chapter_title, chapter_content in book['chapters']:
        story.append(Paragraph(chapter_title, chapter_title_style))
        story.append(Spacer(1, 8))
        
        # Split content into paragraphs and add repeated content for more pages
        paragraphs = chapter_content.split('\n\n')
        for para in paragraphs:
            if para.strip():
                story.append(Paragraph(para.strip(), body_style))
        
        # Add extra pages of content
        extra_content = f"This is an expanded section from '{chapter_title}' in '{book['title']}' by {book['author']}. In the full version of this book, this chapter contains detailed analysis, real-world examples, case studies, and practical exercises that help readers deeply understand and apply the concepts discussed. The author draws from years of experience and research to provide actionable insights that can transform the way you think and work. Each section builds upon the previous one, creating a comprehensive framework for mastery. The principles outlined here have been tested and validated through extensive practice and have helped countless individuals achieve remarkable results in their respective fields."
        
        story.append(Paragraph(extra_content, body_style))
        story.append(Paragraph(extra_content.replace("This is an expanded", "Furthermore, this expanded"), body_style))
        
        story.append(PageBreak())
    
    # Conclusion page
    story.append(Spacer(1, 2 * inch))
    conclusion_style = ParagraphStyle('Conclusion', parent=styles['Title'], fontSize=20, textColor=HexColor(book['color']), alignment=TA_CENTER)
    story.append(Paragraph("Thank You for Reading!", conclusion_style))
    story.append(Spacer(1, 20))
    thanks_style = ParagraphStyle('Thanks', parent=styles['Normal'], fontSize=12, alignment=TA_CENTER, textColor=HexColor('#666666'))
    story.append(Paragraph(f"We hope you enjoyed this sample of '{book['title']}'.", thanks_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Visit EbookVerse for more great books!", thanks_style))
    
    doc.build(story)
    print(f"  Created: {filepath} ({os.path.getsize(filepath) // 1024}KB)")
    return filepath


if __name__ == '__main__':
    output_dir = '/home/z/my-project/public/pdfs'
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating PDF files for EbookVerse...")
    for book in BOOKS:
        create_pdf(book, output_dir)
    
    print(f"\nDone! Generated {len(BOOKS)} PDF files in {output_dir}")
