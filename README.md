# Alpha-Drivers

> Service Marketplace for Professional Drivers in Cameroon

Alpha-Drivers connects clients with verified professional drivers in Douala, Yaoundé, Limbe, and Buea. The platform operates like Preply but for driving services.

## 🚀 Quick Start (Demo Mode)

**No database or API keys needed!** The app runs with mock data by default.

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/alpha-drivers.git
cd alpha-drivers

# 2. Install dependencies
npm install

# 3. Copy environment file (demo mode is enabled by default)
cp .env.example .env.local

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - that's it! 🎉

### Deploy to Vercel (1-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/alpha-drivers)

**Environment Variables for Vercel:**
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_DEMO_MODE=true
PLATFORM_COMMISSION_PERCENT=15
```

## 📋 Features

### Phase 1 (Current)
- ✅ User authentication (phone + password)
- ✅ Driver onboarding with registration payment
- ✅ Basic booking flow
- ✅ MTN MoMo / Orange Money integration (Notch Pay)
- ✅ Admin verification panel
- ✅ 4 city landing pages (French SEO)
- ✅ Escrow payment system

### Coming Soon
- 📱 In-app real-time messaging
- ⭐ Reviews and ratings
- 📊 Driver earnings dashboard
- 🚗 Vehicle rental listings
- 🔔 Push notifications
- 📝 Blog and SEO content

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Payments**: Notch Pay (MTN MoMo + Orange Money)
- **Auth**: NextAuth.js (coming)
- **Deployment**: Vercel

## 🎭 Demo Mode vs Production

| Feature | Demo Mode | Production |
|---------|-----------|------------|
| Database | Mock data | PostgreSQL (Supabase) |
| Auth | Simulated | Real sessions |
| Payments | Disabled | Notch Pay (MoMo/OM) |
| File uploads | Disabled | Supabase Storage |
| SMS/Email | Disabled | Twilio/Resend |

**To switch to production:**
1. Set `NEXT_PUBLIC_DEMO_MODE=false`
2. Configure `DATABASE_URL`
3. Run `npx prisma db push`
4. Add other API keys as needed

## 📁 Project Structure

```
alpha-drivers/
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   ├── (marketing)/      # SEO landing pages
│   ├── (app)/            # Protected app pages
│   ├── api/              # API routes
│   ├── drivers/          # Driver listing pages
│   └── page.tsx          # Homepage
├── components/
│   ├── ui/               # Base UI components
│   ├── layout/           # Navbar, Footer
│   ├── driver/           # Driver-specific components
│   └── booking/          # Booking components
├── lib/
│   ├── db/               # Prisma client
│   ├── payments/         # Notch Pay integration
│   ├── utils/            # Utility functions
│   └── validators/       # Zod schemas
├── prisma/
│   └── schema.prisma     # Database schema
└── types/
    └── index.ts          # TypeScript types
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- Notch Pay account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/alpha-drivers.git
cd alpha-drivers
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local`:
```env
DATABASE_URL="postgresql://..."
NOTCHPAY_SECRET_KEY="sk_..."
NEXTAUTH_SECRET="your-secret"
```

5. Initialize the database:
```bash
npx prisma db push
npx prisma generate
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 💳 Payment Flow

The escrow system protects both clients and drivers:

1. **Client pays** → Funds held in escrow
2. **Booking confirmed** → Driver notified
3. **Service delivered** → Client confirms completion
4. **Funds released** → Driver paid via Mobile Money

Commission: 15% platform fee (configurable)

## 🔒 Driver Verification

1. Driver pays registration fee
2. Uploads documents (CNI, License, Photo)
3. Admin reviews and approves/rejects
4. Profile goes live on approval

## 🌐 SEO Strategy

Programmatic SEO with city-specific landing pages:

- `/chauffeur-douala/` (French)
- `/driver-douala/` (English)
- Schema.org LocalBusiness markup
- Dynamic driver profiles

## 📱 Mobile Money Integration

Supports both major providers:
- **MTN Mobile Money** (67, 68, 650-654)
- **Orange Money** (69, 655-659)

Powered by [Notch Pay](https://notchpay.co).

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Add environment variables
3. Deploy!

### Manual

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 📞 Support

- Email: support@alpha-drivers.cm
- WhatsApp: +237 6XX XXX XXX

---

Built with ❤️ for Cameroon
