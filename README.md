# 🚀 Quantilyst Market Intelligence

<div align="center">

![Quantilyst Logo](https://img.shields.io/badge/Quantilyst-Market%20Intelligence-blue?style=for-the-badge&logo=chart-line)

**AI-powered market intelligence and SEO analytics platform**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-98.9%25-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-Horizon%20Beta-FF6B35?style=flat-square&logo=openai)](https://openrouter.ai/)

*From search signals and social buzz to funding flows and competitive benchmarks—Quantilyst distills every datapoint into clear, actionable strategy.*

[🌟 Live Demo](http://localhost:9002) • [📖 Documentation](#features) • [🚀 Quick Start](#getting-started)

</div>

---

## 🎯 What is Quantilyst?

**Quantilyst** is a comprehensive market intelligence platform designed to provide C-suite executives, marketing directors, and growth hackers with actionable insights. It transforms real-time data signals and deep market analysis into a clear narrative of **numbers, stories, and action steps**.

### 💡 Why Quantilyst?

- **🎯 Executive-Grade Insights**: C-suite level analysis and strategic recommendations
- **🤖 AI-Powered**: Leverages OpenRouter's Horizon Beta model for superior market analysis
- **🌍 Global Focus**: Specialized features for international markets (KSA/Arabic support)
- **📊 Interactive Dashboards**: Beautiful, responsive charts and data visualizations
- **⚡ Real-time**: Live trending keyword analysis and market signals

---

## ✨ Features

### 🔥 **Dynamic Trending Keywords**
AI-powered analysis of trending keywords relevant to your business, complete with:
- Estimated search volume and trend data
- SEO difficulty scoring
- Simulated data sources for credibility
- Time-based analysis (hour, day, week, month)

### 📊 **Interactive Keyword Analysis**
CMO-level analysis module with multiple chart views:

**Volume vs. Difficulty Chart**
- Dual-axis composed chart for direct comparison
- Identify keyword potential vs. ranking difficulty

**Opportunity Matrix**
- Scatter plot visualization
- Instantly spot high-value targets, long-term goals, and quick wins

**Advanced Filtering**
- Filter by keyword name, search volume, SEO difficulty
- Dynamic range sliders and search capabilities

### 🎯 **CMO-Level Strategic Briefs**
In-depth analysis of any keyword providing:
- Search intent analysis
- Target audience profiling
- Competitive landscape overview
- Unique content angle recommendations
- Long-tail keyword suggestions
- Related questions and content outlines

### 📝 **AI Content Briefs**
AI-generated content structures including:
- Compelling titles and engaging hooks
- Key talking points for content creation
- SEO-optimized content suggestions

### 📈 **Market Deep-Dive Reports**
Comprehensive, C-suite level reports featuring:
- **Executive Summaries** with strategic recommendations
- **Market Sizing (TAM/SAM/SOM)** with source citations
- **Competitor Benchmarking** analysis
- **Full SWOT Analysis** (Strengths, Weaknesses, Opportunities, Threats)

### 🌍 **International Market Focus**
- Arabic keyword translation for KSA market
- Volume and trend analysis for regional markets
- Localized market intelligence

### 📊 **AI-Generated Chart Takeaways**
Concise, one-sentence summaries of chart data providing immediate actionable insights.

---

## 🛠 Tech Stack

<div align="center">

| Category | Technology |
|----------|------------|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js) Next.js 15 (App Router) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript) TypeScript |
| **AI/ML** | ![OpenRouter](https://img.shields.io/badge/OpenRouter-Horizon%20Beta-FF6B35?style=flat-square&logo=openai) Genkit with Horizon Beta |
| **UI Framework** | ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react) React 18 |
| **Styling** | ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css) Tailwind CSS |
| **Components** | ![Radix UI](https://img.shields.io/badge/Radix-UI-161618?style=flat-square) ShadCN-UI + Radix |
| **Charts** | ![Recharts](https://img.shields.io/badge/Recharts-Charts-FF6B6B?style=flat-square) Recharts |

</div>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **OpenRouter API Key** ([Get one here](https://openrouter.ai/keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hrunx/Quantilyst.git
   cd Quantilyst
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in the root directory
   echo "OPENROUTER_API_KEY=sk-or-v1-your-api-key-here" > .env
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:9002](http://localhost:9002) 🎉

---

## 📱 Screenshots

<div align="center">

### 🏠 Main Dashboard
*AI-powered market intelligence at your fingertips*

### 📊 Interactive Analytics
*Beautiful charts with real-time insights*

### 🎯 Strategic Briefs
*Executive-level keyword analysis*

### 🌍 Global Market Intelligence
*International market insights and translations*

</div>

---

## 🎮 Usage Examples

### Basic Market Analysis
```typescript
// Analyze trending keywords for solar panels in Saudi Arabia
const analysis = await getTrendingKeywordsAction({
  businessType: "solar panels",
  country: "SA",
  city: "riyadh"
});
```

### Generate Strategic Brief
```typescript
// Get CMO-level insights for a specific keyword
const brief = await getAdvancedSeoAnalysisAction({
  businessType: "solar panels",
  keyword: "best solar companies saudi arabia"
});
```

### Market Deep Dive
```typescript
// Generate comprehensive market report
const report = await getMarketDeepDiveAction({
  businessType: "solar panels",
  country: "Saudi Arabia",
  city: "Riyadh"
});
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenRouter** for access to the powerful Horizon Beta model
- **Vercel** for the amazing Next.js framework
- **ShadCN** for the beautiful UI components
- **Recharts** for the interactive chart library

---

## 📞 Support & Contact

<div align="center">

**Found a bug?** [Open an issue](https://github.com/hrunx/Quantilyst/issues)

**Have a question?** [Start a discussion](https://github.com/hrunx/Quantilyst/discussions)

**Want to contribute?** Check out our [Contributing Guidelines](#contributing)

---

**Made with ❤️ by the Quantilyst Team**

*Transforming data into strategy, one insight at a time.*

[![GitHub stars](https://img.shields.io/github/stars/hrunx/Quantilyst?style=social)](https://github.com/hrunx/Quantilyst/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/hrunx/Quantilyst?style=social)](https://github.com/hrunx/Quantilyst/network/members)

</div>
