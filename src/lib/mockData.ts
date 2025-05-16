
export interface Keyword {
  id: string;
  name: string;
  volume?: number; // Represents trend score or search volume
  change: number; // Percentage change (e.g., week-over-week)
  trendData?: { date: string; value: number }[]; // For individual keyword trend chart
}

export type TimeFrame = "hour" | "day" | "week" | "month";

export interface TimeFrameKeywords {
  hour: Keyword[];
  day: Keyword[];
  week: Keyword[];
  month: Keyword[];
}

export const mockTrendingKeywords: TimeFrameKeywords = {
  hour: [
    { id: "h1", name: "AI content creation", volume: 150, change: 12 },
    { id: "h2", name: "Real-time market data", volume: 90, change: 8 },
    { id: "h3", name: "Instant SEO tips", volume: 75, change: 5 },
  ],
  day: [
    { id: "d1", name: "E-commerce SEO strategy", volume: 1200, change: 7 },
    { id: "d2", name: "Local business marketing online", volume: 950, change: -3 },
    { id: "d3", name: "Video content for social media", volume: 800, change: 10 },
    { id: "d4", name: "Influencer marketing ROI", volume: 600, change: 2 },
  ],
  week: [
    { id: "w1", name: "Sustainable business practices", volume: 8500, change: 18, trendData: [{date: "Mon", value: 60}, {date: "Tue", value: 65}, {date: "Wed", value: 70}, {date: "Thu", value: 80}, {date: "Fri", value: 85}, {date: "Sat", value: 90}, {date: "Sun", value: 92}] },
    { id: "w2", name: "Remote work productivity tools", volume: 7200, change: 11, trendData: [{date: "Mon", value: 50}, {date: "Tue", value: 55}, {date: "Wed", value: 58}, {date: "Thu", value: 60}, {date: "Fri", value: 62}, {date: "Sat", value: 65}, {date: "Sun", value: 68}] },
    { id: "w3", name: "Data privacy regulations 2024", volume: 6800, change: -5 },
    { id: "w4", name: "AI in customer service", volume: 6500, change: 22 },
    { id: "w5", name: "Personalized email marketing", volume: 5900, change: 9 },
  ],
  month: [
    { id: "m1", name: "Metaverse business opportunities", volume: 35000, change: 25 },
    { id: "m2", name: "Cybersecurity for small business", volume: 32000, change: 15 },
    { id: "m3", name: "Future of finance technology", volume: 28000, change: 10 },
    { id: "m4", name: "Green energy investments", volume: 25000, change: 30 },
    { id: "m5", name: "Digital transformation consulting", volume: 22000, change: 7 },
  ],
};

export const mockCountries = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "EG", label: "Egypt" },
];

export const mockKeywordChartData = [
  { name: "Jan", "Keyword A": 4000, "Keyword B": 2400 },
  { name: "Feb", "Keyword A": 3000, "Keyword B": 1398 },
  { name: "Mar", "Keyword A": 2000, "Keyword B": 9800 },
  { name: "Apr", "Keyword A": 2780, "Keyword B": 3908 },
  { name: "May", "Keyword A": 1890, "Keyword B": 4800 },
  { name: "Jun", "Keyword A": 2390, "Keyword B": 3800 },
];

export const mockTopKeywordsVolumeData = [
  { keyword: "AI tools", volume: 12000 },
  { keyword: "SEO services", volume: 10500 },
  { keyword: "Content marketing", volume: 9800 },
  { keyword: "Social media ads", volume: 7500 },
  { keyword: "Email automation", volume: 6200 },
];
