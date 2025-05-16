
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, LineChart as LucideLineChart, Search, BarChart3, Settings2, Bell, Briefcase, MapPin, Globe, Sparkles, HelpCircle, FileText, ListChecks } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


import { mockTrendingKeywords, mockCountries, mockTopKeywordsVolumeData } from '@/lib/mockData';
import type { Keyword as AppKeyword, TimeFrame, TimeFrameKeywords } from '@/lib/mockData'; // Renamed to avoid conflict
import { getArabicTranslationsAction, getSeoSuggestionsAction, getAdvancedSeoAnalysisAction } from './actions';
import type { TranslateKeywordsArabicOutput } from '@/ai/flows/translate-keywords-arabic';
import type { SeoContentSuggestionsOutput } from '@/ai/flows/seo-content-suggestions';
import type { AdvancedSeoKeywordAnalysisOutput } from '@/ai/flows/advanced-seo-keyword-analysis';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";


export default function DashboardPage() {
  const [businessType, setBusinessType] = useState("E-commerce");
  const [country, setCountry] = useState("US");
  const [city, setCity] = useState("");
  const [currentKeywords, setCurrentKeywords] = useState<TimeFrameKeywords>(mockTrendingKeywords);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TimeFrame>("week");

  const [arabicKeywords, setArabicKeywords] = useState<string[]>([]);
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [advancedAnalysisKeyword, setAdvancedAnalysisKeyword] = useState("");
  const [advancedAnalysisResults, setAdvancedAnalysisResults] = useState<AdvancedSeoKeywordAnalysisOutput | null>(null);
  const [isAnalyzingAdvanced, setIsAnalyzingAdvanced] = useState(false);

  const { toast } = useToast();

  const generateDynamicKeywords = (baseKeywords: TimeFrameKeywords, bt: string, locCountry: string, locCity: string): TimeFrameKeywords => {
    const newKeywords = JSON.parse(JSON.stringify(baseKeywords)) as TimeFrameKeywords; // Deep copy
    const prefix = `${bt} in ${locCity || locCountry} - `;

    (Object.keys(newKeywords) as TimeFrame[]).forEach(timeFrame => {
      if (newKeywords[timeFrame].length > 0) {
        newKeywords[timeFrame].forEach(kw => {
          kw.name = kw.name.includes(" - ") ? prefix + kw.name.split(" - ").pop() : prefix + kw.name; // Avoid multi-prefixing
          kw.volume = Math.floor(Math.random() * 5000) + 1000;
          kw.change = Math.floor(Math.random() * 40) - 20;
          kw.difficulty = Math.floor(Math.random() * 100);
          // Keep existing serpFeatures or add some randomly if none
          if (!kw.serpFeatures || kw.serpFeatures.length === 0) {
            const possibleFeatures = ["Featured Snippet", "People Also Ask", "Image Pack", "Video Carousel"];
            if (Math.random() > 0.7) kw.serpFeatures = [possibleFeatures[Math.floor(Math.random() * possibleFeatures.length)]];
          }
        });
      }
    });
    return newKeywords;
  };

  const handleAnalyze = async () => {
    if (!businessType) {
      toast({ title: "Analysis Skipped", description: "Business type is required.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    toast({ title: "Fetching Data", description: `Analyzing keywords for ${businessType}${country ? ` in ${country}` : ''}${city ? `, ${city}` : ''}...` });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDynamicKeywords = generateDynamicKeywords(mockTrendingKeywords, businessType, country, city);
    setCurrentKeywords(newDynamicKeywords); 
    
    setIsLoading(false);
    toast({ title: "Analysis Complete", description: "Latest keyword data loaded." });
  };

  const handleTranslateKeywords = async () => {
    if (!businessType || !currentKeywords[activeTab] || currentKeywords[activeTab].length === 0) {
      toast({ title: "Translation Skipped", description: "Business type and keywords are required for translation.", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    toast({ title: "Translating Keywords", description: "Generating Arabic keywords..." });
    const keywordsToTranslate = currentKeywords[activeTab].map(kw => kw.name);
    const result = await getArabicTranslationsAction({ businessType, keywords: keywordsToTranslate });
    if (result.success && result.data) {
      setArabicKeywords(result.data.translatedKeywords);
      toast({ title: "Translation Successful", description: "Arabic keywords generated." });
    } else {
      toast({ title: "Translation Failed", description: result.error || "Could not translate keywords.", variant: "destructive" });
      setArabicKeywords([]);
    }
    setIsTranslating(false);
  };

  const handleSeoSuggestions = async () => {
    if (!businessType || !currentKeywords[activeTab] || currentKeywords[activeTab].length === 0) {
      toast({ title: "Suggestions Skipped", description: "Business type and trending keywords are required.", variant: "destructive" });
      return;
    }
    setIsSuggesting(true);
    toast({ title: "Generating SEO Suggestions", description: "Fetching content ideas..." });
    const trendingKeywordsString = currentKeywords[activeTab].map(kw => kw.name).join(", ");
    const result = await getSeoSuggestionsAction({ businessType, trendingKeywords: trendingKeywordsString });
    
    if (result.success && result.data && result.data.suggestions.length > 0) {
      setSeoSuggestions(result.data.suggestions);
      toast({ title: "SEO Suggestions Ready", description: "Content ideas generated." });
    } else if (result.success && result.data && result.data.suggestions.length === 0) {
      setSeoSuggestions([]);
      toast({ title: "SEO Suggestions", description: "No specific suggestions were generated for this input.", variant: "default" });
    } else {
      toast({ title: "Suggestion Failed", description: result.error || "Could not get SEO suggestions.", variant: "destructive" });
      setSeoSuggestions([]);
    }
    setIsSuggesting(false);
  };

  const handleAdvancedSeoAnalysis = async () => {
    if (!businessType || !advancedAnalysisKeyword) {
      toast({ title: "Analysis Skipped", description: "Business type and a keyword are required for advanced analysis.", variant: "destructive" });
      return;
    }
    setIsAnalyzingAdvanced(true);
    setAdvancedAnalysisResults(null);
    toast({ title: "Advanced SEO Analysis", description: `Analyzing "${advancedAnalysisKeyword}"...` });
    const result = await getAdvancedSeoAnalysisAction({ businessType, keyword: advancedAnalysisKeyword });

    if (result.success && result.data) {
      setAdvancedAnalysisResults(result.data);
      toast({ title: "Advanced Analysis Complete", description: `Insights for "${advancedAnalysisKeyword}" are ready.` });
    } else {
      setAdvancedAnalysisResults(null);
      toast({ title: "Advanced Analysis Failed", description: result.error || "Could not perform advanced analysis.", variant: "destructive" });
    }
    setIsAnalyzingAdvanced(false);
  };
  
  useEffect(() => {
    const weeklyKeywords = currentKeywords.week;
    if (weeklyKeywords) {
      weeklyKeywords.forEach(keyword => {
        if (keyword.change > 15) {
          // console.log(`ALERT: Keyword "${keyword.name}" week-over-week change is ${keyword.change}%!`);
        }
      });
    }
  }, [currentKeywords]);


  const renderKeywordTable = (keywords: AppKeyword[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          <TableHead className="text-right">Volume/Trend</TableHead>
          <TableHead className="text-right">Change (%)</TableHead>
          <TableHead className="text-right">Difficulty</TableHead>
          <TableHead>SERP Features</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords && keywords.length > 0 ? keywords.map(keyword => (
          <TableRow key={keyword.id}>
            <TableCell>{keyword.name}</TableCell>
            <TableCell className="text-right">{keyword.volume?.toLocaleString() || 'N/A'}</TableCell>
            <TableCell className="text-right">
              <span className={keyword.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {keyword.change >= 0 ? '+' : ''}{keyword.change}%
              </span>
            </TableCell>
            <TableCell className="text-right">{keyword.difficulty ?? 'N/A'}</TableCell>
            <TableCell>
              {keyword.serpFeatures && keyword.serpFeatures.length > 0 
                ? keyword.serpFeatures.map(feature => <Badge key={feature} variant="secondary" className="mr-1 mb-1">{feature}</Badge>)
                : 'None'}
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center">No keywords to display for this period or after analysis.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const chartConfig = {
    volume: {
      label: "Volume",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const keywordChartData = useMemo(() => {
    const activeKeywords = currentKeywords[activeTab];
    if (activeKeywords && activeKeywords.every(kw => kw.volume !== undefined && kw.name)) {
      return activeKeywords.slice(0, 10).map(kw => ({ 
        keyword: kw.name.length > 20 ? kw.name.substring(0, 17) + "..." : kw.name,
        volume: kw.volume as number,
      }));
    }
    return mockTopKeywordsVolumeData.slice(0,10).map(item => ({
      keyword: item.keyword.length > 20 ? item.keyword.substring(0, 17) + "..." : item.keyword,
      volume: item.volume
    }));
  }, [currentKeywords, activeTab]);


  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Market Insights Pro</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Settings2 className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Inputs & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search className="h-6 w-6 text-primary" /> Configure Analysis</CardTitle>
                <CardDescription>Specify your business and location to get tailored insights.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="businessType" className="flex items-center gap-1"><Briefcase className="h-4 w-4"/>Business Type</Label>
                  <Input id="businessType" placeholder="e.g., SaaS, Restaurant, E-commerce" value={businessType} onChange={e => setBusinessType(e.target.value)} className="mt-1"/>
                </div>
                <div>
                  <Label htmlFor="country" className="flex items-center gap-1"><Globe className="h-4 w-4"/>Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country" className="mt-1">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCountries.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city" className="flex items-center gap-1"><MapPin className="h-4 w-4"/>City (Optional)</Label>
                  <Input id="city" placeholder="e.g., New York, Riyadh" value={city} onChange={e => setCity(e.target.value)} className="mt-1"/>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAnalyze} className="w-full" disabled={isLoading || !businessType}>
                  {isLoading ? "Analyzing..." : "Analyze Trends"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> Advanced SEO Analysis</CardTitle>
                <CardDescription>Get deeper AI insights for a specific keyword.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="advancedKeyword" className="flex items-center gap-1"><Search className="h-4 w-4"/>Keyword to Analyze</Label>
                  <Input id="advancedKeyword" placeholder="Enter a keyword" value={advancedAnalysisKeyword} onChange={e => setAdvancedAnalysisKeyword(e.target.value)} className="mt-1"/>
                </div>
                {isAnalyzingAdvanced && <p className="text-sm text-muted-foreground text-center">Analyzing keyword...</p>}
                {advancedAnalysisResults && !isAnalyzingAdvanced && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="difficulty">
                      <AccordionTrigger>Difficulty Analysis</AccordionTrigger>
                      <AccordionContent>{advancedAnalysisResults.difficultyAnalysis}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="long-tail">
                      <AccordionTrigger>Long-tail Suggestions</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {advancedAnalysisResults.longTailSuggestions.map((kw, i) => <li key={`lt-${i}`}>{kw}</li>)}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="questions">
                      <AccordionTrigger>Related Questions</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {advancedAnalysisResults.relatedQuestions.map((q, i) => <li key={`q-${i}`}>{q}</li>)}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="outline">
                      <AccordionTrigger>Basic Content Outline</AccordionTrigger>
                      <AccordionContent>
                        <h4 className="font-semibold mb-1">{advancedAnalysisResults.basicContentOutline.title}</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {advancedAnalysisResults.basicContentOutline.sections.map((s, i) => <li key={`s-${i}`}>{s}</li>)}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                 {!isAnalyzingAdvanced && !advancedAnalysisResults && <p className="text-sm text-muted-foreground">Enter a keyword and click analyze for advanced insights.</p>}
              </CardContent>
              <CardFooter>
                <Button onClick={handleAdvancedSeoAnalysis} className="w-full" disabled={isAnalyzingAdvanced || !businessType || !advancedAnalysisKeyword}>
                  {isAnalyzingAdvanced ? "Analyzing..." : "Get Advanced Analysis"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="h-6 w-6 text-primary" /> Arabic Keywords (KSA)</CardTitle>
                <CardDescription>Translate trending keywords to Arabic for the KSA region.</CardDescription>
              </CardHeader>
              <CardContent>
                {isTranslating && <p className="text-sm text-muted-foreground">Translating...</p>}
                {arabicKeywords.length > 0 && !isTranslating && (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {arabicKeywords.map((kw, i) => <li key={i}>{kw}</li>)}
                  </ul>
                )}
                {!isTranslating && arabicKeywords.length === 0 && <p className="text-sm text-muted-foreground">Translated keywords will appear here.</p>}
              </CardContent>
              <CardFooter>
                <Button onClick={handleTranslateKeywords} className="w-full" disabled={isTranslating || !businessType || !currentKeywords[activeTab] || currentKeywords[activeTab].length === 0}>
                  {isTranslating ? "Translating..." : "Generate Arabic Keywords"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Dashboards Display */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary"/>Trending Keywords Dashboard</CardTitle>
                <CardDescription>Live keyword trends for your business category and selected region. Includes difficulty and SERP features.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TimeFrame)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
                    <TabsTrigger value="hour">Past Hour</TabsTrigger>
                    <TabsTrigger value="day">Past Day</TabsTrigger>
                    <TabsTrigger value="week">Past Week</TabsTrigger>
                    <TabsTrigger value="month">Past Month</TabsTrigger>
                  </TabsList>
                  <TabsContent value="hour">{renderKeywordTable(currentKeywords.hour)}</TabsContent>
                  <TabsContent value="day">{renderKeywordTable(currentKeywords.day)}</TabsContent>
                  <TabsContent value="week">{renderKeywordTable(currentKeywords.week)}</TabsContent>
                  <TabsContent value="month">{renderKeywordTable(currentKeywords.month)}</TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Keyword Volume Visualizations</CardTitle>
                 <CardDescription>Bar chart illustrating top keyword volumes based on the active tab or overall analysis.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] w-full"> 
                {keywordChartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={keywordChartData} margin={{ top: 5, right: 20, left: 10, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="keyword" 
                          tickLine={false} 
                          axisLine={false} 
                          stroke="hsl(var(--muted-foreground))"
                          angle={-45} 
                          textAnchor="end" 
                          interval={0} 
                          height={80} 
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tickFormatter={(value) => value.toLocaleString()}
                          tickLine={false}
                          axisLine={false}
                          width={80}
                        />
                        <ChartTooltip
                          cursor={{fill: 'hsl(var(--accent))', radius: 4}}
                          content={<ChartTooltipContent indicator="dot" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="volume" fill="var(--color-volume)" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                   <p className="text-muted-foreground text-center py-8">No data available for chart. Analyze trends first.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListChecks className="h-6 w-6 text-primary" /> SEO Content Ideas Dashboard</CardTitle>
                <CardDescription>AI-powered content ideas based on current trends for your business.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 min-h-[200px]">
                {isSuggesting && <p className="text-sm text-muted-foreground text-center py-4">Generating suggestions...</p>}
                {!isSuggesting && seoSuggestions.length > 0 && (
                  <div className="space-y-3">
                    {seoSuggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Suggestion {index + 1}</AlertTitle>
                        <AlertDescription>
                          {suggestion}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
                {!isSuggesting && seoSuggestions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Click "Get SEO Suggestions" to generate content ideas.
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSeoSuggestions} className="w-full" disabled={isSuggesting || !businessType || !currentKeywords[activeTab] || currentKeywords[activeTab].length === 0}>
                 {isSuggesting ? "Generating..." : "Get SEO Suggestions"}
                </Button>
              </CardFooter>
            </Card>

          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
