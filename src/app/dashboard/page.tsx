
"use client";

import React, { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, LineChart as LucideLineChartIcon, Search, BarChart3, Settings2, Bell, Briefcase, MapPin, Globe, Sparkles, HelpCircle, ListChecks, TrendingUp, Loader2, Target, Users, Bot, VenetianMask, MessageSquareQuote, CheckCircle, ExternalLink, Shield, ShieldOff, AlertTriangle, PieChart, Building2, BrainCircuit } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

import { mockTrendingKeywords, mockCountries } from '@/lib/mockData';
import type { Keyword as AppKeyword, TimeFrame, TimeFrameKeywords } from '@/lib/mockData';
import { getArabicTranslationsAction, getSeoSuggestionsAction, getAdvancedSeoAnalysisAction, getTrendingKeywordsAction, getChartTakeawayAction, getMarketDeepDiveAction } from '../actions';
import type { TranslateKeywordsArabicOutput } from '@/ai/flows/translate-keywords-arabic';
import type { SeoContentSuggestionsOutput } from '@/ai/flows/seo-content-suggestions';
import type { AdvancedSeoKeywordAnalysisOutput } from '@/ai/flows/advanced-seo-keyword-analysis';
import type { MarketDeepDiveOutput } from '@/ai/flows/market-deep-dive';
import { useToast } from "@/hooks/use-toast";

const emptyKeywords: TimeFrameKeywords = {
  hour: [],
  day: [],
  week: [],
  month: [],
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const businessTypeFromQuery = searchParams.get('businessType');
  const countryFromQuery = searchParams.get('country');
  const cityFromQuery = searchParams.get('city');

  const [businessType, setBusinessType] = useState(businessTypeFromQuery || "");
  const [country, setCountry] = useState(countryFromQuery || "US");
  const [city, setCity] = useState(cityFromQuery || "");

  const [currentKeywords, setCurrentKeywords] = useState<TimeFrameKeywords>(emptyKeywords);
  const [activeTab, setActiveTab] = useState<TimeFrame>("week");
  
  const [isOverallLoading, setIsOverallLoading] = useState(false);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);

  const [arabicKeywords, setArabicKeywords] = useState<string[]>([]);
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [advancedAnalysisKeyword, setAdvancedAnalysisKeyword] = useState("");
  const [advancedAnalysisResults, setAdvancedAnalysisResults] = useState<AdvancedSeoKeywordAnalysisOutput | null>(null);
  const [isAnalyzingAdvanced, setIsAnalyzingAdvanced] = useState(false);
  
  const [chartTakeaway, setChartTakeaway] = useState("");
  const [isGeneratingTakeaway, setIsGeneratingTakeaway] = useState(false);
  
  const [deepDiveResults, setDeepDiveResults] = useState<MarketDeepDiveOutput | null>(null);
  const [isGeneratingDeepDive, setIsGeneratingDeepDive] = useState(false);

  const fetchKeywords = useCallback(async () => {
    if (!businessType) {
      toast({ title: "Input Required", description: "Business type is needed to fetch keywords.", variant: "destructive" });
      return null;
    }
    setIsLoadingKeywords(true);
    setChartTakeaway("");
    setArabicKeywords([]);
    setSeoSuggestions([]);
    setAdvancedAnalysisResults(null);
    setDeepDiveResults(null);
    
    const result = await getTrendingKeywordsAction({ businessType, country, city: city || undefined });
    
    if (result.success && result.data) {
        setCurrentKeywords(result.data);
        setIsLoadingKeywords(false);
        return result.data;
    } else {
        toast({ title: "Keyword Fetch Failed", description: result.error || "Could not fetch AI-generated keywords. Using mock data as fallback.", variant: "destructive" });
        setCurrentKeywords(mockTrendingKeywords); // Fallback to mock data on error
        setIsLoadingKeywords(false);
        return mockTrendingKeywords;
    }
  }, [businessType, country, city, toast]);

  const handleChartTakeaway = useCallback(async (keywordsForChart: AppKeyword[]) => {
      if (!businessType || !keywordsForChart || keywordsForChart.length === 0) {
          return;
      }
      setIsGeneratingTakeaway(true);
      const chartDataString = JSON.stringify(keywordsForChart.map(kw => ({ name: kw.name, volume: kw.volume })));
      const result = await getChartTakeawayAction({ businessType, keywordChartData: chartDataString });

      if (result.success && result.data) {
          setChartTakeaway(result.data.takeaway);
      } else {
          setChartTakeaway(""); // Clear on failure
      }
      setIsGeneratingTakeaway(false);
  }, [businessType]);


  const handleTranslateKeywords = useCallback(async (keywordsForTranslation?: AppKeyword[]) => {
    const keywordsToUse = keywordsForTranslation || currentKeywords[activeTab];
    if (!businessType || !keywordsToUse || keywordsToUse.length === 0) {
      if (!keywordsForTranslation) {
        toast({ title: "Translation Skipped", description: "Business type and current keywords are required.", variant: "destructive" });
      }
      return;
    }
    setIsTranslating(true);
    if (!keywordsForTranslation) toast({ title: "Translating Keywords", description: "Generating Arabic keywords..." });
    
    const keywordNames = keywordsToUse.map(kw => kw.name);
    const result = await getArabicTranslationsAction({ businessType, keywords: keywordNames });
    
    if (result.success && result.data) {
      setArabicKeywords(result.data.translatedKeywords);
      if (!keywordsForTranslation) toast({ title: "Translation Successful", description: "Arabic keywords generated." });
    } else {
      setArabicKeywords([]);
      if (!keywordsForTranslation) toast({ title: "Translation Failed", description: result.error || "Could not translate.", variant: "destructive" });
    }
    setIsTranslating(false);
  }, [businessType, currentKeywords, activeTab, toast]);

  const handleSeoSuggestions = useCallback(async (keywordsForSuggestions?: AppKeyword[]) => {
    const keywordsToUse = keywordsForSuggestions || currentKeywords[activeTab];
    if (!businessType || !keywordsToUse || keywordsToUse.length === 0) {
      if (!keywordsForSuggestions) {
         toast({ title: "Suggestions Skipped", description: "Business type and keywords are required.", variant: "destructive" });
      }
      return;
    }
    setIsSuggesting(true);
    if (!keywordsForSuggestions) toast({ title: "Generating SEO Content Strategies", description: "AI is crafting ideas..." });
    
    const keywordNamesString = keywordsToUse.map(kw => kw.name).join(', ');
    const result = await getSeoSuggestionsAction({ businessType, trendingKeywords: keywordNamesString });

    if (result.success && result.data && result.data.suggestions.length > 0) {
      setSeoSuggestions(result.data.suggestions);
      if (!keywordsForSuggestions) toast({ title: "SEO Strategies Ready!", description: "Content ideas generated." });
    } else if (result.success && result.data && result.data.suggestions.length === 0) {
      setSeoSuggestions([]);
      if (!keywordsForSuggestions) toast({ title: "No Specific Suggestions", description: result.error || "AI found no specific suggestions.", variant: "default" });
    } else {
      setSeoSuggestions([]);
      if (!keywordsForSuggestions) toast({ title: "Suggestion Failed", description: result.error || "Could not generate suggestions.", variant: "destructive" });
    }
    setIsSuggesting(false);
  }, [businessType, currentKeywords, activeTab, toast]);
  
  const loadInitialDashboardData = useCallback(async () => {
    if (!businessTypeFromQuery) return;

    setIsOverallLoading(true);
    toast({ title: "Loading Dashboard", description: `Fetching insights for ${businessTypeFromQuery}...` });

    const fetchedKeywordsResult = await fetchKeywords();
    if (fetchedKeywordsResult && fetchedKeywordsResult[activeTab] && fetchedKeywordsResult[activeTab].length > 0) {
      const activeKeywords = fetchedKeywordsResult[activeTab];
      await Promise.all([
        handleTranslateKeywords(activeKeywords),
        handleSeoSuggestions(activeKeywords),
        handleChartTakeaway(activeKeywords)
      ]);
      const firstKeywordName = activeKeywords[0]?.name;
      if (firstKeywordName) {
        setAdvancedAnalysisKeyword(firstKeywordName);
      }
    } else {
       toast({ title: "Keyword Fetch Issue", description: "Could not fetch initial keywords, subsequent AI actions skipped.", variant: "destructive"});
    }
    
    setIsOverallLoading(false);
    if (fetchedKeywordsResult) {
      toast({ title: "Dashboard Loaded!", description: "Insights are ready for your review.", variant: "default" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessTypeFromQuery, fetchKeywords, handleTranslateKeywords, handleSeoSuggestions, handleChartTakeaway, activeTab, toast]);

  useEffect(() => {
    if (businessTypeFromQuery && countryFromQuery) {
      setBusinessType(businessTypeFromQuery);
      setCountry(countryFromQuery);
      if(cityFromQuery) setCity(cityFromQuery);
      loadInitialDashboardData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessTypeFromQuery, countryFromQuery, cityFromQuery]);

  const handleManualReanalyze = async () => {
    if (!businessType) {
       toast({ title: "Input Required", description: "Please specify a business type.", variant: "destructive" });
       return;
    }
    setIsOverallLoading(true);
    toast({ title: "Re-analyzing Market Data", description: `Updating all insights for ${businessType}${country ? ` in ${country}` : ''}${city ? `, ${city}` : ''}...` });

    const fetchedKeywordsResult = await fetchKeywords();
    if (fetchedKeywordsResult && fetchedKeywordsResult[activeTab] && fetchedKeywordsResult[activeTab].length > 0) {
      const activeKeywords = fetchedKeywordsResult[activeTab];
      await Promise.all([
        handleTranslateKeywords(activeKeywords),
        handleSeoSuggestions(activeKeywords),
        handleChartTakeaway(activeKeywords)
      ]);
      const firstKeywordName = activeKeywords[0]?.name;
      if (firstKeywordName && advancedAnalysisKeyword !== firstKeywordName) {
        setAdvancedAnalysisKeyword(firstKeywordName);
      }
    } else {
       toast({ title: "Keyword Fetch Issue", description: "Could not fetch keywords, subsequent AI actions skipped.", variant: "destructive"});
    }

    setIsOverallLoading(false);
    if(fetchedKeywordsResult){
      toast({ title: "Analysis Complete!", description: "All insights have been updated.", variant: "default" });
    }
  };

  const handleAdvancedSeoAnalysis = async () => {
    if (!businessType || !advancedAnalysisKeyword) {
      toast({ title: "Advanced Analysis Skipped", description: "Business type and a specific keyword are required.", variant: "destructive" });
      return;
    }
    setIsAnalyzingAdvanced(true);
    setAdvancedAnalysisResults(null);
    toast({ title: "Performing Advanced SEO Analysis", description: `AI is conducting an in-depth analysis for "${advancedAnalysisKeyword}"...` });
    const result = await getAdvancedSeoAnalysisAction({ businessType, keyword: advancedAnalysisKeyword });

    if (result.success && result.data) {
      setAdvancedAnalysisResults(result.data);
      toast({ title: "Advanced Analysis Complete", description: `In-depth insights for "${advancedAnalysisKeyword}" are ready.` });
    } else {
      setAdvancedAnalysisResults(null);
      toast({ title: "Advanced Analysis Failed", description: result.error || "Could not perform advanced analysis.", variant: "destructive" });
    }
    setIsAnalyzingAdvanced(false);
  };
  
  const handleDeepDiveAnalysis = async () => {
    if (!businessType || !country) {
      toast({ title: "Deep-Dive Skipped", description: "Business type and country are required for this report.", variant: "destructive" });
      return;
    }
    setIsGeneratingDeepDive(true);
    setDeepDiveResults(null);
    toast({ title: "Generating Market Deep-Dive Report", description: "This may take a moment. The AI is compiling a comprehensive market analysis..." });
    
    const result = await getMarketDeepDiveAction({ businessType, country, city: city || undefined });

    if (result.success && result.data) {
      setDeepDiveResults(result.data);
      toast({ title: "Deep-Dive Report Ready!", description: "The complete market analysis has been generated." });
    } else {
      setDeepDiveResults(null);
      toast({ title: "Deep-Dive Failed", description: result.error || "Could not generate the market report.", variant: "destructive" });
    }
    setIsGeneratingDeepDive(false);
  };

  const renderKeywordTable = (keywords: AppKeyword[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Keyword</TableHead>
          <TableHead className="text-right">Volume/Trend</TableHead>
          <TableHead className="text-right">Change (%)</TableHead>
          <TableHead className="text-right">Difficulty</TableHead>
          <TableHead>SERP Features</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(isLoadingKeywords || isOverallLoading) && !keywords?.length ? (
           <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading keywords...</TableCell></TableRow>
        ) : keywords && keywords.length > 0 ? keywords.map(keyword => (
          <TableRow key={keyword.id}>
            <TableCell className="font-medium">{keyword.name}</TableCell>
            <TableCell className="text-right">{keyword.volume?.toLocaleString() || 'N/A'}</TableCell>
            <TableCell className="text-right">
              <span className={keyword.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {keyword.change >= 0 ? <TrendingUp className="inline-block h-4 w-4 mr-1" /> : <TrendingUp className="inline-block h-4 w-4 mr-1 transform rotate-180" style={{transform: 'scaleY(-1)'}}/> }
                {keyword.change}%
              </span>
            </TableCell>
            <TableCell className="text-right">{keyword.difficulty ?? 'N/A'}</TableCell>
            <TableCell>
              {keyword.serpFeatures && keyword.serpFeatures.length > 0 
                ? keyword.serpFeatures.map(feature => <Badge key={feature} variant="secondary" className="mr-1 mb-1 whitespace-nowrap">{feature}</Badge>)
                : <Badge variant="outline">None</Badge>}
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
              No keywords to display. Perform an analysis to populate this table.
            </TableCell>
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
    if (activeKeywords && activeKeywords.length > 0 && activeKeywords.every(kw => kw.volume !== undefined && kw.name)) {
      return activeKeywords.slice(0, 10).map(kw => ({ 
        name: kw.name.length > 30 ? kw.name.substring(0, 27) + "..." : kw.name, 
        volume: kw.volume as number,
      }));
    }
    return [];
  }, [currentKeywords, activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 dark:bg-background">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LucideLineChartIcon className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Market Insights Pro Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" aria-label="Settings"><Settings2 className="h-5 w-5" /></Button>
            <Button variant="outline" size="sm" className="gap-1"><HelpCircle className="h-4 w-4"/> Help</Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-primary/5 dark:bg-primary/10">
                <CardTitle className="flex items-center gap-2 text-xl"><Search className="h-6 w-6 text-primary" /> Current Analysis Context</CardTitle>
                <CardDescription>Insights are tailored for the following criteria. Change and re-analyze if needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="businessType" className="flex items-center gap-1 mb-1 font-semibold"><Briefcase className="h-4 w-4 text-primary"/>Business Type / Industry</Label>
                  <Input id="businessType" placeholder="e.g., SaaS, Local Restaurant" value={businessType} onChange={e => setBusinessType(e.target.value)} className="mt-1"/>
                </div>
                <div>
                  <Label htmlFor="country" className="flex items-center gap-1 mb-1 font-semibold"><Globe className="h-4 w-4 text-primary"/>Target Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country" className="mt-1"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>{mockCountries.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city" className="flex items-center gap-1 mb-1 font-semibold"><MapPin className="h-4 w-4 text-primary"/>Target City (Optional)</Label>
                  <Input id="city" placeholder="e.g., San Francisco, Riyadh" value={city} onChange={e => setCity(e.target.value)} className="mt-1"/>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 dark:bg-muted/20 p-4">
                <Button onClick={handleManualReanalyze} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isLoadingKeywords || !businessType}>
                  {isOverallLoading || isLoadingKeywords ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <TrendingUp className="mr-2 h-5 w-5" />}
                  {isOverallLoading || isLoadingKeywords ? "Re-Analyzing..." : "Re-Analyze Market Data"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-primary/5 dark:bg-primary/10">
                <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-6 w-6 text-primary" /> CMO-Level Strategic Brief</CardTitle>
                <CardDescription>Deep strategic insights for any keyword relevant to your business context.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="advancedKeyword" className="flex items-center gap-1 mb-1 font-semibold"><Search className="h-4 w-4 text-primary"/>Keyword for In-depth Analysis</Label>
                  <Input id="advancedKeyword" placeholder="Enter or select a keyword" value={advancedAnalysisKeyword} onChange={e => setAdvancedAnalysisKeyword(e.target.value)} className="mt-1"/>
                </div>
                {isAnalyzingAdvanced && <div className="flex justify-center py-2"><Loader2 className="h-6 w-6 animate-spin text-primary" /> <p className="ml-2 text-sm text-muted-foreground">AI is processing...</p></div>}
                {advancedAnalysisResults && !isAnalyzingAdvanced && (
                  <Accordion type="single" collapsible className="w-full" defaultValue="intent">
                    <AccordionItem value="intent">
                      <AccordionTrigger className="text-base"><Target className="mr-2 h-4 w-4" /> Search Intent &amp; Audience</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{advancedAnalysisResults.searchIntent}</Badge>
                          <p className="text-sm text-muted-foreground">Primary User Intent</p>
                        </div>
                        <p className="text-sm"><strong className="font-semibold text-foreground">Target Audience:</strong> {advancedAnalysisResults.targetAudience}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="competition">
                      <AccordionTrigger className="text-base"><VenetianMask className="mr-2 h-4 w-4" /> Competitive Landscape</AccordionTrigger>
                      <AccordionContent className="text-sm">{advancedAnalysisResults.competitiveLandscape}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="angle">
                      <AccordionTrigger className="text-base"><Lightbulb className="mr-2 h-4 w-4" /> Content Angle &amp; Hook</AccordionTrigger>
                      <AccordionContent className="text-sm">{advancedAnalysisResults.contentAngle}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="outline">
                      <AccordionTrigger className="text-base"><ListChecks className="mr-2 h-4 w-4" /> Detailed Content Outline</AccordionTrigger>
                      <AccordionContent>
                        <h4 className="font-semibold mb-2 text-md">{advancedAnalysisResults.detailedContentOutline.title}</h4>
                        <ul className="space-y-3">
                          {advancedAnalysisResults.detailedContentOutline.sections.map((section, i) => (
                            <li key={`s-${i}`} className="ml-2">
                              <p className="font-semibold">{section.heading}</p>
                              <ul className="list-disc list-inside space-y-1 text-sm pl-2 mt-1 text-muted-foreground">
                                {section.points.map((point, pIdx) => <li key={`p-${pIdx}`}>{point}</li>)}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="difficulty">
                       <AccordionTrigger className="text-base"><BarChart3 className="mr-2 h-4 w-4" /> Difficulty Analysis</AccordionTrigger>
                       <AccordionContent className="text-sm">{advancedAnalysisResults.difficultyAnalysis}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="confidence">
                       <AccordionTrigger className="text-base"><CheckCircle className="mr-2 h-4 w-4" /> Confidence &amp; Sources</AccordionTrigger>
                       <AccordionContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-semibold">Analysis Confidence</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Progress value={advancedAnalysisResults.confidenceScore} className="w-full h-2" />
                                <span className="text-sm font-bold">{advancedAnalysisResults.confidenceScore}%</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Simulated Data Sources</Label>
                            <ul className="space-y-1 mt-1">
                                {advancedAnalysisResults.simulatedSources.map((source, i) => (
                                    <li key={`src-${i}`} className="text-sm text-muted-foreground flex items-center gap-2">
                                        <ExternalLink className="h-3 w-3" />
                                        <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline">{new URL(source).hostname}</a>
                                    </li>
                                ))}
                            </ul>
                          </div>
                       </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                 {!isAnalyzingAdvanced && !advancedAnalysisResults && <p className="text-sm text-muted-foreground text-center py-2">Enter a keyword and click analyze to reveal advanced AI insights.</p>}
              </CardContent>
              <CardFooter className="bg-muted/50 dark:bg-muted/20 p-4">
                <Button onClick={handleAdvancedSeoAnalysis} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isAnalyzingAdvanced || !businessType || !advancedAnalysisKeyword}>
                  {isAnalyzingAdvanced ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Bot className="mr-2 h-5 w-5" />}
                  {isAnalyzingAdvanced ? "Generating Brief..." : "Generate Strategic Brief"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-primary/5 dark:bg-primary/10">
                <CardTitle className="flex items-center gap-2 text-xl"><BarChart3 className="h-6 w-6 text-primary"/>Trending Keywords Dashboard</CardTitle>
                <CardDescription>Monitor live keyword trends, volume, difficulty, and SERP features based on your analysis criteria.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TimeFrame)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4 bg-muted/70 dark:bg-muted/30 rounded-md">
                    <TabsTrigger value="hour" className="py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Past Hour</TabsTrigger>
                    <TabsTrigger value="day" className="py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Past Day</TabsTrigger>
                    <TabsTrigger value="week" className="py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Past Week</TabsTrigger>
                    <TabsTrigger value="month" className="py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Past Month</TabsTrigger>
                  </TabsList>
                  <TabsContent value="hour">{renderKeywordTable(currentKeywords.hour)}</TabsContent>
                  <TabsContent value="day">{renderKeywordTable(currentKeywords.day)}</TabsContent>
                  <TabsContent value="week">{renderKeywordTable(currentKeywords.week)}</TabsContent>
                  <TabsContent value="month">{renderKeywordTable(currentKeywords.month)}</TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-primary/5 dark:bg-primary/10">
                <CardTitle className="flex items-center gap-2 text-xl"><LucideLineChartIcon className="h-6 w-6 text-primary"/>Top Keyword Volume Visualization</CardTitle>
                 <CardDescription>Visual breakdown of search volumes for the top keywords from your active analysis tab.</CardDescription>
              </CardHeader>
              <CardContent className="h-[450px] w-full pt-6"> 
                {(isLoadingKeywords || isOverallLoading) && keywordChartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p>Loading chart data...</p>
                  </div>
                ) : keywordChartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={keywordChartData} margin={{ top: 5, right: 20, left: 20, bottom: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" interval={0} height={100} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}/>
                        <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => value > 1000 ? `${value/1000}k` : value.toLocaleString()} tickLine={false} axisLine={false} width={60} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}/>
                        <ChartTooltip cursor={{fill: 'hsl(var(--accent)/0.5)', radius: 4}} content={<ChartTooltipContent indicator="dot" />}/>
                        <ChartLegend content={<ChartLegendContent wrapperStyle={{paddingTop: '20px'}} />} />
                        <Bar dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} barSize={30}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                   <p className="text-muted-foreground text-center py-10">No data available for chart. Perform an analysis to see keyword volumes.</p>
                )}
              </CardContent>
              <CardFooter className="bg-muted/50 dark:bg-muted/20 p-4 border-t">
                  {isGeneratingTakeaway ? (
                       <div className="flex items-center w-full text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/> AI is analyzing the chart to generate a key takeaway...
                       </div>
                  ) : chartTakeaway ? (
                        <div className="flex items-start gap-3">
                            <MessageSquareQuote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-foreground">CMO Takeaway</h4>
                                <p className="text-sm text-muted-foreground">{chartTakeaway}</p>
                            </div>
                        </div>
                  ) : (
                      <p className="text-sm text-muted-foreground">The AI-generated takeaway for this chart will appear here after analysis.</p>
                  )}
              </CardFooter>
            </Card>

            <Card className="shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-primary/5 dark:bg-primary/10">
                    <CardTitle className="flex items-center gap-2 text-xl"><BrainCircuit className="h-6 w-6 text-primary" /> Market Deep-Dive Analysis</CardTitle>
                    <CardDescription>A comprehensive, C-suite level market report including SWOT, competitor benchmarks, and market sizing.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {isGeneratingDeepDive && (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-lg">AI is generating your deep-dive report...</p>
                            <p className="text-sm">This involves complex analysis and may take a moment.</p>
                        </div>
                    )}
                    {deepDiveResults && !isGeneratingDeepDive && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><Briefcase className="h-5 w-5 text-primary" /> Executive Summary</h3>
                                <p className="text-sm text-muted-foreground">{deepDiveResults.executiveSummary}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><Users className="h-5 w-5 text-primary" /> Market Sizing (TAM/SAM/SOM)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm"><Globe className="h-4 w-4"/>TAM</h4>
                                        <p className="text-2xl font-bold text-primary">${(deepDiveResults.tamSamSom.tam.value / 1_000_000_000).toFixed(1)}B</p>
                                        <p className="text-xs text-muted-foreground">{deepDiveResults.tamSamSom.tam.description}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm"><Target className="h-4 w-4"/>SAM</h4>
                                        <p className="text-2xl font-bold text-primary">${(deepDiveResults.tamSamSom.sam.value / 1_000_000).toFixed(1)}M</p>
                                        <p className="text-xs text-muted-foreground">{deepDiveResults.tamSamSom.sam.description}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm"><PieChart className="h-4 w-4"/>SOM</h4>
                                        <p className="text-2xl font-bold text-primary">${(deepDiveResults.tamSamSom.som.value / 1_000_000).toFixed(1)}M</p>
                                        <p className="text-xs text-muted-foreground">{deepDiveResults.tamSamSom.som.description}</p>
                                    </div>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><Building2 className="h-5 w-5 text-primary" /> Competitor Benchmark</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Competitor</TableHead>
                                            <TableHead>Strengths</TableHead>
                                            <TableHead>Weaknesses</TableHead>
                                            <TableHead className="text-right">Market Share</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deepDiveResults.competitors.map(c => (
                                            <TableRow key={c.name}>
                                                <TableCell className="font-medium">{c.name}</TableCell>
                                                <TableCell className="text-xs">{c.strengths}</TableCell>
                                                <TableCell className="text-xs">{c.weaknesses}</TableCell>
                                                <TableCell className="text-right font-semibold">{c.marketShare}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><Sparkles className="h-5 w-5 text-primary" /> SWOT Analysis</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                                        <h4 className="font-semibold flex items-center gap-2 mb-2"><Shield className="h-5 w-5 text-green-600"/>Strengths</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">{deepDiveResults.swot.strengths.map((s,i) => <li key={i}>{s}</li>)}</ul>
                                    </div>
                                    <div className="p-4 bg-red-100/50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                                        <h4 className="font-semibold flex items-center gap-2 mb-2"><ShieldOff className="h-5 w-5 text-red-600"/>Weaknesses</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">{deepDiveResults.swot.weaknesses.map((w,i) => <li key={i}>{w}</li>)}</ul>
                                    </div>
                                    <div className="p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                                        <h4 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-blue-600"/>Opportunities</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">{deepDiveResults.swot.opportunities.map((o,i) => <li key={i}>{o}</li>)}</ul>
                                    </div>
                                    <div className="p-4 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                                        <h4 className="font-semibold flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5 text-yellow-600"/>Threats</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">{deepDiveResults.swot.threats.map((t,i) => <li key={i}>{t}</li>)}</ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {!isGeneratingDeepDive && !deepDiveResults && (
                         <p className="text-muted-foreground text-center py-10">Your comprehensive market report will appear here. Click the button below to generate it.</p>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/50 dark:bg-muted/20 p-4 mt-auto">
                    <Button onClick={handleDeepDiveAnalysis} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isGeneratingDeepDive || !businessType}>
                    {isGeneratingDeepDive ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <BrainCircuit className="mr-2 h-5 w-5"/>}
                    {isGeneratingDeepDive ? "Generating Report..." : "Generate Deep-Dive Report"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-primary/5 dark:bg-primary/10">
                    <CardTitle className="flex items-center gap-2 text-xl"><Globe className="h-6 w-6 text-primary" /> Arabic Keywords (KSA Focus)</CardTitle>
                    <CardDescription>Translated keywords for the KSA market based on current context.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 min-h-[150px]">
                    {isTranslating && <div className="flex justify-center py-2"><Loader2 className="h-6 w-6 animate-spin text-primary" /> <p className="ml-2 text-sm text-muted-foreground">AI is translating...</p></div>}
                    {arabicKeywords.length > 0 && !isTranslating && (<ul className="list-disc list-inside space-y-1 text-sm pl-2">{arabicKeywords.map((kw, i) => <li key={i}>{kw}</li>)}</ul>)}
                    {!isTranslating && arabicKeywords.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Translated keywords will appear here.</p>}
                </CardContent>
                <CardFooter className="bg-muted/50 dark:bg-muted/20 p-4">
                    <Button onClick={() => handleTranslateKeywords()} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isTranslating || !businessType || !currentKeywords[activeTab] || currentKeywords[activeTab].length === 0}>
                    {isTranslating ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Globe className="mr-2 h-5 w-5"/>}
                    {isTranslating ? "Translating..." : "Generate Arabic Keywords"}
                    </Button>
                </CardFooter>
                </Card>

                <Card className="shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-primary/5 dark:bg-primary/10">
                    <CardTitle className="flex items-center gap-2 text-xl"><ListChecks className="h-6 w-6 text-primary" /> AI Content Strategy</CardTitle>
                    <CardDescription>Actionable content ideas based on the current keyword trends.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 min-h-[150px] pt-6 overflow-y-auto max-h-[300px]">
                    {isSuggesting && <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-3 text-sm text-muted-foreground">AI is brainstorming ideas...</p></div>}
                    {!isSuggesting && seoSuggestions.length > 0 && (
                    <div className="space-y-3">
                        {seoSuggestions.map((suggestion, index) => (
                        <Alert key={index} className="bg-background dark:bg-muted/30 border-l-4 border-primary rounded-md">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            <AlertTitle className="font-semibold text-md text-primary">Content Idea {index + 1}</AlertTitle>
                            <AlertDescription className="text-sm">{suggestion}</AlertDescription>
                        </Alert>
                        ))}
                    </div>
                    )}
                    {!isSuggesting && seoSuggestions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-10">Content ideas will appear here.</p>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/50 dark:bg-muted/20 p-4 mt-auto">
                    <Button onClick={() => handleSeoSuggestions()} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isSuggesting || !businessType || !currentKeywords[activeTab] || currentKeywords[activeTab].length === 0}>
                    {isSuggesting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Lightbulb className="mr-2 h-5 w-5"/>}
                    {isSuggesting ? "Generating Ideas..." : "Generate Content Strategies"}
                    </Button>
                </CardFooter>
                </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-muted/30 dark:bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-xl">Loading dashboard...</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}
