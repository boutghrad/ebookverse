import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Business', slug: 'business', icon: 'Briefcase', image: '/categories/business.jpg' },
  { name: 'Self Development', slug: 'self-development', icon: 'Heart', image: '/categories/self-dev.jpg' },
  { name: 'AI & Technology', slug: 'ai-technology', icon: 'Cpu', image: '/categories/ai-tech.jpg' },
  { name: 'Marketing', slug: 'marketing', icon: 'Megaphone', image: '/categories/marketing.jpg' },
  { name: 'Finance', slug: 'finance', icon: 'DollarSign', image: '/categories/finance.jpg' },
  { name: 'Programming', slug: 'programming', icon: 'Code', image: '/categories/programming.jpg' },
  { name: 'Design', slug: 'design', icon: 'Palette', image: '/categories/design.jpg' },
  { name: 'Psychology', slug: 'psychology', icon: 'Brain', image: '/categories/psychology.jpg' },
];

const books = [
  // Business
  { title: 'The Lean Startup', slug: 'the-lean-startup', description: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses. This book provides a scientific approach to creating and managing startups and getting a desired product to customers\' hands faster.', author: 'Eric Ries', price: 14.99, discountPrice: 9.99, rating: 4.8, totalReviews: 342, totalSales: 1520, featured: true, trending: true, pages: 336, categoryId: '', tags: 'startup,innovation,business,entrepreneurship' },
  { title: 'Zero to One', slug: 'zero-to-one', description: 'Notes on Startups, or How to Build the Future. Peter Thiel\'s contrarian thinking on how to build startups that create new things, pushing the boundaries of what\'s possible.', author: 'Peter Thiel', price: 12.99, discountPrice: 8.99, rating: 4.7, totalReviews: 289, totalSales: 1230, featured: true, trending: false, pages: 224, categoryId: '', tags: 'startup,innovation,future,technology' },
  { title: 'Good to Great', slug: 'good-to-great', description: 'Why Some Companies Make the Leap and Others Don\'t. A landmark study that identifies the key factors that allow companies to transition from being good to being truly great organizations.', author: 'Jim Collins', price: 16.99, rating: 4.6, totalReviews: 198, totalSales: 890, featured: false, trending: false, pages: 320, categoryId: '', tags: 'leadership,management,companies,growth' },

  // Self Development
  { title: 'Atomic Habits', slug: 'atomic-habits', description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. This breakthrough book reveals practical strategies that teach you how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.', author: 'James Clear', price: 13.99, discountPrice: 7.99, rating: 4.9, totalReviews: 567, totalSales: 2340, featured: true, trending: true, pages: 320, categoryId: '', tags: 'habits,self-improvement,productivity,mindset' },
  { title: 'The 7 Habits of Highly Effective People', slug: '7-habits', description: 'A comprehensive framework for personal effectiveness that has helped millions transform their lives through principled-centered living and deep character ethics.', author: 'Stephen R. Covey', price: 15.99, rating: 4.7, totalReviews: 412, totalSales: 1890, featured: false, trending: true, pages: 384, categoryId: '', tags: 'habits,effectiveness,leadership,personal-growth' },
  { title: 'Deep Work', slug: 'deep-work', description: 'Rules for Focused Success in a Distracted World. Master the art of deep, focused work to achieve extraordinary results in an increasingly distracted world.', author: 'Cal Newport', price: 11.99, discountPrice: 6.99, rating: 4.5, totalReviews: 234, totalSales: 780, featured: false, trending: false, pages: 296, categoryId: '', tags: 'focus,productivity,work,concentration' },

  // AI & Technology
  { title: 'AI Superpowers', slug: 'ai-superpowers', description: 'China, Silicon Valley, and the New World Order. An illuminating guide to the future of AI and how it will reshape our world, economies, and daily lives.', author: 'Kai-Fu Lee', price: 18.99, discountPrice: 12.99, rating: 4.6, totalReviews: 178, totalSales: 670, featured: true, trending: true, pages: 272, categoryId: '', tags: 'AI,technology,future,China,Silicon-Valley' },
  { title: 'Life 3.0', slug: 'life-3', description: 'Being Human in the Age of Artificial Intelligence. An exploration of how AI will impact crime, war, justice, jobs, society, and our very sense of being human.', author: 'Max Tegmark', price: 17.99, rating: 4.5, totalReviews: 156, totalSales: 560, featured: false, trending: false, pages: 380, categoryId: '', tags: 'AI,future,humanity,society,technology' },
  { title: 'The Age of AI', slug: 'age-of-ai', description: 'And Our Human Future. Three thinkers explore how AI will transform our relationship with knowledge, politics, and the societies in which we live.', author: 'Henry Kissinger', price: 19.99, discountPrice: 14.99, rating: 4.3, totalReviews: 98, totalSales: 340, featured: false, trending: true, pages: 256, categoryId: '', tags: 'AI,society,politics,future,knowledge' },

  // Marketing
  { title: 'Contagious', slug: 'contagious', description: 'Why Things Catch On. Discover the science behind why some products, ideas, and behaviors become popular while others fade into obscurity.', author: 'Jonah Berger', price: 14.99, discountPrice: 9.99, rating: 4.4, totalReviews: 201, totalSales: 890, featured: false, trending: true, pages: 256, categoryId: '', tags: 'marketing,viral,social-media,psychology' },
  { title: 'Building a StoryBrand', slug: 'storybrand', description: 'Clarify Your Message So Customers Will Listen. Transform your marketing by using the seven universal story points all humans respond to.', author: 'Donald Miller', price: 13.99, rating: 4.6, totalReviews: 189, totalSales: 720, featured: true, trending: false, pages: 240, categoryId: '', tags: 'branding,storytelling,marketing,message' },

  // Finance
  { title: 'Rich Dad Poor Dad', slug: 'rich-dad-poor-dad', description: 'What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not! A personal finance classic that challenges conventional wisdom about money and investing.', author: 'Robert Kiyosaki', price: 11.99, discountPrice: 5.99, rating: 4.7, totalReviews: 523, totalSales: 3120, featured: true, trending: true, pages: 336, categoryId: '', tags: 'finance,money,investing,wealth,personal-finance' },
  { title: 'The Intelligent Investor', slug: 'intelligent-investor', description: 'The Definitive Book on Value Investing. A book of practical counsel that provides the principles and strategies for successful long-term investing.', author: 'Benjamin Graham', price: 22.99, discountPrice: 16.99, rating: 4.8, totalReviews: 389, totalSales: 1560, featured: false, trending: false, pages: 640, categoryId: '', tags: 'investing,finance,value-investing,stocks' },

  // Programming
  { title: 'Clean Code', slug: 'clean-code', description: 'A Handbook of Agile Software Craftsmanship. Learn the principles, patterns, and practices of writing clean, maintainable, and elegant code.', author: 'Robert C. Martin', price: 24.99, discountPrice: 18.99, rating: 4.7, totalReviews: 456, totalSales: 2100, featured: true, trending: true, pages: 464, categoryId: '', tags: 'programming,software,clean-code,agile,craftsmanship' },
  { title: 'The Pragmatic Programmer', slug: 'pragmatic-programmer', description: 'Your Journey to Mastery. A guide to software development that covers topics from personal responsibility and career development to architectural techniques.', author: 'David Thomas', price: 29.99, discountPrice: 22.99, rating: 4.8, totalReviews: 312, totalSales: 1340, featured: false, trending: false, pages: 352, categoryId: '', tags: 'programming,software-engineering,mastery,pragmatic' },

  // Design
  { title: 'Don\'t Make Me Think', slug: 'dont-make-me-think', description: 'A Common Sense Approach to Web Usability. The most widely read book on web usability that has become the standard guide for designers and developers worldwide.', author: 'Steve Krug', price: 16.99, rating: 4.5, totalReviews: 267, totalSales: 980, featured: false, trending: false, pages: 216, categoryId: '', tags: 'design,usability,UX,web-design' },
  { title: 'The Design of Everyday Things', slug: 'design-of-everyday-things', description: 'Revised and Expanded Edition. A powerful primer on how design serves as the communication between object and user, and how to optimize that communication.', author: 'Don Norman', price: 15.99, discountPrice: 11.99, rating: 4.6, totalReviews: 198, totalSales: 870, featured: true, trending: false, pages: 368, categoryId: '', tags: 'design,UX,interaction,human-centered-design' },

  // Psychology
  { title: 'Thinking, Fast and Slow', slug: 'thinking-fast-and-slow', description: 'A groundbreaking tour of the mind that explains the two systems that drive the way we think—System 1 fast, intuitive, and System 2 slow, deliberate.', author: 'Daniel Kahneman', price: 14.99, discountPrice: 9.99, rating: 4.7, totalReviews: 478, totalSales: 1890, featured: true, trending: true, pages: 499, categoryId: '', tags: 'psychology,thinking,decision-making,cognitive-bias' },
  { title: 'Influence', slug: 'influence', description: 'The Psychology of Persuasion. Understand the six universal principles of influence and how to use them to become a skilled persuader—and defend yourself against them.', author: 'Robert Cialdini', price: 13.99, rating: 4.5, totalReviews: 234, totalSales: 980, featured: false, trending: false, pages: 320, categoryId: '', tags: 'psychology,persuasion,influence,behavior' },

  // 🎁 FREE Books
  { title: 'The Art of Learning', slug: 'the-art-of-learning', description: 'A journey in the pursuit of excellence. World chess champion and martial arts champion Josh Waitzkin shares his unique approach to mastering any skill, combining deep focus, resilience, and the ability to perform under pressure.', author: 'Josh Waitzkin', price: 0, discountPrice: 0, rating: 4.6, totalReviews: 312, totalSales: 5420, featured: true, trending: true, pages: 288, categoryId: '', tags: 'learning,mastery,performance,self-improvement,free' },
  { title: 'Creative Confidence', slug: 'creative-confidence', description: 'Unleashing the Creative Potential Within Us All. Tom and David Kelley reveal how anyone can tap into their creative potential through practical strategies, real-world examples, and proven methods for unlocking innovation.', author: 'Tom Kelley', price: 0, discountPrice: 0, rating: 4.4, totalReviews: 189, totalSales: 3280, featured: true, trending: false, pages: 288, categoryId: '', tags: 'creativity,innovation,design-thinking,free' },
  { title: 'Mindfulness for Beginners', slug: 'mindfulness-for-beginners', description: 'A practical guide to mindfulness meditation and living in the present moment. This book offers simple techniques to reduce stress, improve focus, and find inner peace in your daily life.', author: 'Jon Kabat-Zinn', price: 0, discountPrice: 0, rating: 4.5, totalReviews: 267, totalSales: 4100, featured: false, trending: true, pages: 192, categoryId: '', tags: 'mindfulness,meditation,stress-relief,wellness,free' },
  { title: 'The Startup Playbook', slug: 'the-startup-playbook', description: 'The essential guide to launching and growing your startup from idea to scale. Packed with advice from over 50 successful founders, covering everything from finding product-market fit to raising capital and building a world-class team.', author: 'David Kidder', price: 0, discountPrice: 0, rating: 4.3, totalReviews: 156, totalSales: 2890, featured: false, trending: false, pages: 256, categoryId: '', tags: 'startup,entrepreneurship,growth,free' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Software Engineer', text: 'EbookVerse has completely transformed my reading habits. The AI recommendations are spot-on, and the instant downloads mean I never have to wait to start a new book.', avatar: 'SC', rating: 5 },
  { name: 'Marcus Johnson', role: 'Marketing Director', text: 'The collection here is incredible. I found books on marketing strategy that I couldn\'t find anywhere else. The reading experience across devices is seamless.', avatar: 'MJ', rating: 5 },
  { name: 'Elena Rodriguez', role: 'Startup Founder', text: 'As an entrepreneur, I need quick access to the latest business thinking. EbookVerse delivers exactly that with their constantly updated library and fair pricing.', avatar: 'ER', rating: 5 },
  { name: 'David Park', role: 'Data Scientist', role: 'Data Scientist', text: 'The AI & Technology section is a goldmine. I\'ve discovered books that have directly contributed to my professional growth. Highly recommend for tech professionals.', avatar: 'DP', rating: 4 },
  { name: 'Aisha Patel', role: 'UX Designer', text: 'The interface is beautiful and intuitive. Finding and downloading books is a breeze. The wishlist feature helps me keep track of books I want to read next.', avatar: 'AP', rating: 5 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ebookverse.com' },
    update: {},
    create: {
      email: 'admin@ebookverse.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      image: '/avatars/admin.jpg',
    },
  });

  // Create demo user
  const demoPassword = await hash('demo123', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@ebookverse.com' },
    update: {},
    create: {
      email: 'demo@ebookverse.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'USER',
      image: '/avatars/demo.jpg',
    },
  });

  // Create categories
  const categoryRecords = [];
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryRecords.push(record);
  }
  console.log(`✅ Created ${categoryRecords.length} categories`);

  // Create books
  const bookRecords = [];
  for (const book of books) {
    const catIndex = categories.findIndex(c => {
      const bookTags = book.tags.split(',');
      return bookTags.some(t => c.slug.includes(t)) || 
        (book.slug.includes('lean') || book.slug.includes('zero') || book.slug.includes('great')) && c.slug === 'business' ||
        (book.slug.includes('habit') || book.slug.includes('deep')) && c.slug === 'self-development' ||
        (book.slug.includes('ai') || book.slug.includes('life-3') || book.slug.includes('age')) && c.slug === 'ai-technology' ||
        (book.slug.includes('contagious') || book.slug.includes('storybrand')) && c.slug === 'marketing' ||
        (book.slug.includes('rich') || book.slug.includes('intelligent')) && c.slug === 'finance' ||
        (book.slug.includes('clean') || book.slug.includes('pragmatic')) && c.slug === 'programming' ||
        (book.slug.includes('think-design') || book.slug.includes('dont')) && c.slug === 'design' ||
        (book.slug.includes('thinking-fast') || book.slug.includes('influence')) && c.slug === 'psychology' ||
        (book.slug.includes('art-of-learning') || book.slug.includes('mindfulness')) && c.slug === 'self-development' ||
        (book.slug.includes('creative-confidence')) && c.slug === 'design' ||
        (book.slug.includes('startup-playbook')) && c.slug === 'business';
    });
    
    const category = catIndex >= 0 ? categoryRecords[catIndex] : categoryRecords[0];
    
    const record = await prisma.book.upsert({
      where: { slug: book.slug },
      update: {},
      create: {
        ...book,
        categoryId: category.id,
        coverImage: `/covers/${book.slug}.jpg`,
        pdfUrl: `/pdfs/${book.slug}.pdf`,
      },
    });
    bookRecords.push(record);
  }
  console.log(`✅ Created ${bookRecords.length} books`);

  // Create some reviews
  const reviewData = [
    { userId: demo.id, bookSlug: 'atomic-habits', rating: 5, comment: 'This book changed my life! The practical strategies for habit formation are backed by science and easy to implement.' },
    { userId: demo.id, bookSlug: 'clean-code', rating: 5, comment: 'Essential reading for every developer. The examples are clear and the principles are timeless.' },
    { userId: demo.id, bookSlug: 'the-lean-startup', rating: 4, comment: 'Great methodology for anyone starting a business. The build-measure-learn loop is invaluable.' },
    { userId: admin.id, bookSlug: 'thinking-fast-and-slow', rating: 5, comment: 'Kahneman masterfully explains the two systems of thinking. Dense but incredibly rewarding.' },
    { userId: admin.id, bookSlug: 'rich-dad-poor-dad', rating: 4, comment: 'A paradigm-shifting book about money mindset. Some advice is controversial but thought-provoking.' },
  ];

  for (const rev of reviewData) {
    const book = bookRecords.find(b => b.slug === rev.bookSlug);
    if (book) {
      await prisma.review.upsert({
        where: {
          userId_bookId: { userId: rev.userId, bookId: book.id },
        },
        update: {},
        create: {
          userId: rev.userId,
          bookId: book.id,
          rating: rev.rating,
          comment: rev.comment,
        },
      });
    }
  }
  console.log('✅ Created reviews');

  // Create some orders
  const order1 = await prisma.order.create({
    data: {
      userId: demo.id,
      total: 17.98,
      paymentStatus: 'COMPLETED',
      orderItems: {
        create: [
          { bookId: bookRecords.find(b => b.slug === 'atomic-habits')!.id, quantity: 1, price: 7.99 },
          { bookId: bookRecords.find(b => b.slug === 'the-lean-startup')!.id, quantity: 1, price: 9.99 },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: demo.id,
      total: 18.98,
      paymentStatus: 'COMPLETED',
      orderItems: {
        create: [
          { bookId: bookRecords.find(b => b.slug === 'clean-code')!.id, quantity: 1, price: 18.99 },
          { bookId: bookRecords.find(b => b.slug === 'rich-dad-poor-dad')!.id, quantity: 1, price: 5.99 },
        ],
      },
    },
  });
  console.log('✅ Created sample orders');

  // Create newsletter subscribers
  const emails = ['subscriber1@example.com', 'subscriber2@example.com', 'subscriber3@example.com'];
  for (const email of emails) {
    await prisma.newsletter.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }
  console.log('✅ Created newsletter subscribers');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
