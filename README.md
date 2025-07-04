# Quantilyst Market Intelligence

**Quantilyst** is a comprehensive market intelligence platform designed to provide C-suite executives, marketing directors, and growth hackers with actionable insights. It transforms real-time data signals and deep market analysis into a clear narrative of **numbers, stories, and action steps.**

From search signals and social buzz to funding flows and competitive benchmarks—Quantilyst distills every datapoint into clear, actionable strategy.

## Features

- **Dynamic Trending Keywords:** AI-powered analysis of trending keywords relevant to your business, complete with estimated volume, trend data, and simulated sources for credibility.
- **Interactive Keyword Analysis:** A CMO-level analysis module with multiple chart views and advanced filtering:
  - **Volume vs. Difficulty Chart:** A dual-axis composed chart for direct comparison of keyword potential against ranking difficulty.
  - **Opportunity Matrix:** A scatter plot to instantly identify high-value targets, long-term goals, and quick wins.
  - **Advanced Filtering:** Slice and dice data by keyword, search volume, and SEO difficulty.
- **CMO-Level Strategic Briefs:** In-depth analysis of any keyword, providing insights on search intent, target audience, competitive landscape, unique content angles, and long-tail keyword suggestions.
- **AI Content Briefs:** AI-generated content structures, including a compelling title, an engaging hook, and key talking points to jumpstart your content creation process.
- **Market Deep-Dive Reports:** Comprehensive, C-suite level reports including:
  - Executive Summaries
  - Market Sizing (TAM/SAM/SOM) with simulated source citations.
  - Competitor Benchmarking
  - Full SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
- **AI-Generated Chart Takeaways:** Concise, one-sentence summaries of chart data, providing immediate insights.
- **Internationalization Focus:** Includes features like Arabic keyword translation with volume and trend analysis for the KSA market.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **AI/ML:** Genkit with Google's Gemini models
- **UI:** React, TypeScript, ShadCN-UI, Tailwind CSS
- **Charts:** Recharts

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hrunx/quantilyst.git
    cd quantilyst
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google AI API key:
    ```
    GOOGLE_API_KEY=your_google_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

---
Go build.
