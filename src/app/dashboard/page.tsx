
"use client";

import React, { useState, useEffect, useMemo, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbulb, LineChart as LucideLineChartIcon, Search, BarChart3, Settings2, Bell, Briefcase, MapPin, Globe, Sparkles, HelpCircle, ListChecks, TrendingUp, Loader2, Target, Users, Bot, VenetianMask, MessageSquareQuote, CheckCircle, ExternalLink, Shield, ShieldOff, AlertTriangle, PieChart, Building2, BrainCircuit, BookCopy, Info, MousePointerClick } from 'lucide-react';
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { mockCountries } from '@/lib/mockData';
import { getArabicTranslationsAction, getSeoSuggestionsAction, getAdvancedSeoAnalysisAction, getTrendingKeywordsAction, getChartTakeawayAction, getMarketDeepDiveAction } from '../actions';
import { useToast } from "@/hooks/use-toast";

import type { Keyword, GenerateTrendingKeywordsOutput, TranslateKeywordsArabicOutput, SeoContentSuggestionsOutput, AdvancedSeoKeywordAnalysisOutput, MarketDeepDiveOutput } from '@/ai/types';

type TimeFrame = keyof GenerateTrendingKeywordsOutput;

const emptyKeywords: GenerateTrendingKeywordsOutput = {
  hour: [],
  day: [],
  week: [],
  month: [],
};

const getHostname = (url: string) => {
  try {
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    return new URL(fullUrl).hostname;
  } catch (e) {
    return url || 'Invalid Source';
  }
};


function DashboardContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const advancedAnalysisRef = useRef<HTMLDivElement>(null);


  const businessTypeFromQuery = searchParams.get('businessType');
  const countryFromQuery = searchParams.get('country');
  const cityFromQuery = searchParams.get('city');

  const [businessType, setBusinessType] = useState(businessTypeFromQuery || "");
  const [country, setCountry] = useState(countryFromQuery || "US");
  const [city, setCity] = useState(cityFromQuery || "");

  const [currentKeywords, setCurrentKeywords] = useState<GenerateTrendingKeywordsOutput>(emptyKeywords);
  const [activeTab, setActiveTab] = useState<TimeFrame>("week");
  
  const [isOverallLoading, setIsOverallLoading] = useState(false);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);

  const [arabicKeywords, setArabicKeywords] = useState<TranslateKeywordsArabicOutput['translatedKeywords']>([]);
  const [seoSuggestions, setSeoSuggestions] = useState<SeoContentSuggestionsOutput['suggestions']>([]);
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
    
    const countryName = mockCountries.find(c => c.value === country)?.label || country;
    const result = await getTrendingKeywordsAction({ businessType, country: countryName, city: city || undefined });
    
    if (result.success && result.data) {
        setCurrentKeywords(result.data);
        setIsLoadingKeywords(false);
        return result.data;
    } else {
        toast({ title: "Keyword Fetch Failed", description: result.error || "Could not fetch AI-generated keywords.", variant: "destructive" });
        setCurrentKeywords(emptyKeywords);
        setIsLoadingKeywords(false);
        return null;
    }
  }, [businessType, country, city, toast]);

  const handleChartTakeaway = useCallback(async (keywordsForChart: Keyword[]) => {
      if (!businessType || !keywordsForChart || keywordsForChart.length === 0) {
          return;
      }
      setIsGeneratingTakeaway(true);
      const chartDataString = JSON.stringify(keywordsForChart.map(kw => ({ name: kw.name, volume: kw.volume })));
      const result = await getChartTakeawayAction({ businessType, keywordChartData: chartDataString });

      if (result.success && result.data) {
          setChartTakeaway(result.data.takeaway);
      } else {
          setChartTakeaway("");
      }
      setIsGeneratingTakeaway(false);
  }, [businessType]);


  const handleTranslateKeywords = useCallback(async (keywordsForTranslation?: Keyword[]) => {
    const keywordsToUse = keywordsForTranslation || currentKeywords[activeTab];
    if (!businessType || !keywordsToUse || keywordsToUse.length === 0) return;

    setIsTranslating(true);
    const keywordNamesString = keywordsToUse.map(kw => kw.name).join(', ');
    const result = await getArabicTranslationsAction({ businessType, keywords: keywordNamesString });
    
    if (result.success && result.data) {
      setArabicKeywords(result.data.translatedKeywords);
    } else {
      setArabicKeywords([]);
      toast({ title: "Translation Failed", description: result.error || "Could not translate keywords.", variant: "destructive" });
    }
    setIsTranslating(false);
  }, [businessType, currentKeywords, activeTab, toast]);

  const handleSeoSuggestions = useCallback(async (keywordsForSuggestions?: Keyword[]) => {
    const keywordsToUse = keywordsForSuggestions || currentKeywords[activeTab];
    if (!businessType || !keywordsToUse || keywordsToUse.length === 0) return;

    setIsSuggesting(true);
    const keywordNamesString = keywordsToUse.map(kw => kw.name).join(', ');
    const result = await getSeoSuggestionsAction({ businessType, trendingKeywords: keywordNamesString });

    if (result.success && result.data && result.data.suggestions.length > 0) {
      setSeoSuggestions(result.data.suggestions);
    } else {
      setSeoSuggestions([]);
      toast({ title: "Suggestion Generation Failed", description: result.error || "Could not generate content briefs.", variant: "destructive" });
    }
    setIsSuggesting(false);
  }, [businessType, currentKeywords, activeTab, toast]);
  
  const loadInitialDashboardData = useCallback(async () => {
    if (!businessTypeFromQuery) return;

    setIsOverallLoading(true);
    toast({ title: "Loading Dashboard", description: `Fetching initial insights for ${businessTypeFromQuery}...` });

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
       toast({ title: "Initial Analysis Issue", description: "Could not fetch keywords, subsequent AI actions skipped.", variant: "destructive"});
    }
    
    setIsOverallLoading(false);
    if (fetchedKeywordsResult) {
      toast({ title: "Dashboard Loaded!", description: "Insights are ready for your review.", variant: "default" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessTypeFromQuery, fetchKeywords]);

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
    toast({ title: "Re-analyzing Market Data", description: `Updating all insights for ${businessType}...` });

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
    
    const countryName = mockCountries.find(c => c.value === country)?.label || country;
    const result = await getMarketDeepDiveAction({ businessType, country: countryName, city: city || undefined });

    if (result.success && result.data) {
      setDeepDiveResults(result.data);
      toast({ title: "Deep-Dive Report Ready!", description: "The complete market analysis has been generated." });
    } else {
      setDeepDiveResults(null);
      toast({ title: "Deep-Dive Failed", description: result.error || "Could not generate the market report.", variant: "destructive" });
    }
    setIsGeneratingDeepDive(false);
  };

  const renderKeywordTable = (keywords: Keyword[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[25%]">Keyword</TableHead>
          <TableHead>Sources</TableHead>
          <TableHead className="text-right">Volume/Trend</TableHead>
          <TableHead className="text-right">Change (%)</TableHead>
          <TableHead className="text-right">Difficulty</TableHead>
          <TableHead>SERP Features</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(isLoadingKeywords || isOverallLoading) && !keywords?.length ? (
           <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading keywords...</TableCell></TableRow>
        ) : keywords && keywords.length > 0 ? keywords.map(keyword => (
          <TableRow key={keyword.id}>
            <TableCell className="font-medium">{keyword.name}</TableCell>
            <TableCell>
              {keyword.sources && keyword.sources.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">Simulated Sources</p>
                      <ul className="list-disc list-inside text-sm">
                        {keyword.sources.map((src, i) => <li key={i}>{src}</li>)}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </TableCell>
            <TableCell className="text-right">{keyword.volume?.toLocaleString() || 'N/A'}</TableCell>
            <TableCell className="text-right">
              <span className={keyword.change >= 0 ? 'text-green-500' : 'text-red-500'}>
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
            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
              No keywords to display. Perform an analysis to populate this table.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const chartConfig = {
    volume: {
      label: "Search Volume",
      color: "hsl(var(--chart-1))",
    },
    difficulty: {
      label: "SEO Difficulty",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const keywordChartData = useMemo(() => {
    const activeKeywords = currentKeywords[activeTab];
    if (activeKeywords && activeKeywords.length > 0) {
      return activeKeywords.slice(0, 10).map(kw => ({
        name: kw.name, // Full name for click handler
        displayName: kw.name.length > 25 ? kw.name.substring(0, 22) + "..." : kw.name,
        volume: kw.volume as number,
        difficulty: kw.difficulty as number,
        change: kw.change,
      }));
    }
    return [];
  }, [currentKeywords, activeTab]);

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const keywordName = data.activePayload[0].payload.name;
      setAdvancedAnalysisKeyword(keywordName);
      toast({
          title: "Keyword Selected",
          description: `"${keywordName}" is ready for a deep-dive. Click "Generate Strategic Brief" to begin.`
      });
      if (advancedAnalysisRef.current) {
        advancedAnalysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-background/90 border rounded-lg shadow-lg backdrop-blur-sm">
          <p className="font-bold text-lg text-foreground mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center gap-4">
              <span className="text-muted-foreground flex items-center"><span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: 'hsl(var(--chart-1))'}}/>Volume:</span>
              <span className="font-mono font-semibold">{data.volume.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-muted-foreground flex items-center"><span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: 'hsl(var(--chart-2))'}}/>Difficulty:</span>
              <span className="font-mono font-semibold">{data.difficulty}/100</span>
            </div>
            <div className="flex justify-between items-center gap-4">
               <span className="text-muted-foreground">Change:</span>
               <span className={`font-mono font-semibold ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                 {data.change >= 0 ? '+' : ''}{data.change}%
               </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LucideLineChartIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-primary">Quantilyst Cockpit</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" aria-label="Settings"><Settings2 className="h-5 w-5" /></Button>
            <Button variant="outline" size="sm" className="gap-1"><HelpCircle className="h-4 w-4"/> Help</Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Card className="shadow-xl rounded-xl overflow-hidden bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Search className="h-6 w-6 text-primary" /> Analysis Context</CardTitle>
                <CardDescription>Insights are tailored for these criteria. Change and re-analyze as needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="businessType" className="flex items-center gap-1 mb-1 font-semibold"><Briefcase className="h-4 w-4 text-primary"/>Business Type / Industry</Label>
                  <Input id="businessType" placeholder="e.g., SaaS, E-commerce" value={businessType} onChange={e => setBusinessType(e.target.value)} className="mt-1"/>
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
              <CardFooter className="p-4">
                <Button onClick={handleManualReanalyze} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isLoadingKeywords || !businessType}>
                  {isOverallLoading || isLoadingKeywords ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <TrendingUp className="mr-2 h-5 w-5" />}
                  {isOverallLoading || isLoadingKeywords ? "Re-Analyzing..." : "Re-Analyze Market"}
                </Button>
              </CardFooter>
            </Card>

            <Card ref={advancedAnalysisRef} className="shadow-xl rounded-xl overflow-hidden bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-6 w-6 text-primary" /> CMO Strategic Brief</CardTitle>
                <CardDescription>Deep strategic insights for any keyword.</CardDescription>
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
                      <AccordionTrigger className="text-base"><Lightbulb className="mr-2 h-4 w-4" /> Unique Content Angle</AccordionTrigger>
                      <AccordionContent className="text-sm">{advancedAnalysisResults.contentAngle}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="long_tail">
                      <AccordionTrigger className="text-base"><ListChecks className="mr-2 h-4 w-4" /> Long-tail Keywords</AccordionTrigger>
                       <AccordionContent>
                         <ul className="space-y-1 list-disc list-inside text-sm">
                           {advancedAnalysisResults.longTailKeywords.map((kw, i) => <li key={i}>{kw}</li>)}
                         </ul>
                       </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="related_questions">
                      <AccordionTrigger className="text-base"><HelpCircle className="mr-2 h-4 w-4" /> Related Questions</AccordionTrigger>
                       <AccordionContent>
                         <ul className="space-y-1 list-disc list-inside text-sm">
                           {advancedAnalysisResults.relatedQuestions.map((q, i) => <li key={i}>{q}</li>)}
                         </ul>
                       </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="outline">
                      <AccordionTrigger className="text-base"><BookCopy className="mr-2 h-4 w-4" /> Detailed Content Outline</AccordionTrigger>
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
                                        <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline">{getHostname(source)}</a>
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
              <CardFooter className="p-4">
                <Button onClick={handleAdvancedSeoAnalysis} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isAnalyzingAdvanced || !businessType || !advancedAnalysisKeyword}>
                  {isAnalyzingAdvanced ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Bot className="mr-2 h-5 w-5" />}
                  {isAnalyzingAdvanced ? "Generating Brief..." : "Generate Strategic Brief"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-9 space-y-6">
            <Card className="shadow-xl rounded-xl overflow-hidden bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><BarChart3 className="h-6 w-6 text-primary"/>Trending Keywords Dashboard</CardTitle>
                <CardDescription>AI-generated keyword trends, volume, and difficulty based on your analysis criteria.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TimeFrame)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4 bg-muted/70 dark:bg-muted/30 rounded-md">
                    <TabsTrigger value="hour" className="py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30">Past Hour</TabsTrigger>
                    <TabsTrigger value="day" className="py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30">Past Day</TabsTrigger>
                    <TabsTrigger value="week" className="py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30">Past Week</TabsTrigger>
                    <TabsTrigger value="month" className="py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30">Past Month</TabsTrigger>
                  </TabsList>
                  <TabsContent value="hour">{renderKeywordTable(currentKeywords.hour)}</TabsContent>
                  <TabsContent value="day">{renderKeywordTable(currentKeywords.day)}</TabsContent>
                  <TabsContent value="week">{renderKeywordTable(currentKeywords.week)}</TabsContent>
                  <TabsContent value="month">{renderKeywordTable(currentKeywords.month)}</TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl rounded-xl overflow-hidden bg-card/80">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><LucideLineChartIcon className="h-6 w-6 text-primary"/>Interactive Keyword Analysis</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <MousePointerClick className="h-4 w-4" />
                        Compare volume vs. difficulty. Click any bar to select that keyword for a deep-dive analysis.
                    </CardDescription>
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
                             <ComposedChart data={keywordChartData} onClick={handleChartClick} margin={{ top: 5, right: 30, left: 20, bottom: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                                <XAxis 
                                    dataKey="displayName" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    stroke="hsl(var(--muted-foreground))" 
                                    angle={-45} 
                                    textAnchor="end" 
                                    interval={0} 
                                    height={100} 
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                />
                                <YAxis 
                                    yAxisId="left" 
                                    stroke="hsl(var(--chart-1))" 
                                    tickFormatter={(value) => typeof value === 'number' && value >= 1000 ? `${value/1000}k` : (value || '').toLocaleString()} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    width={60} 
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right" 
                                    stroke="hsl(var(--chart-2))" 
                                    domain={[0, 100]} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    width={40} 
                                    tick={{ fontSize: 10 }}
                                />
                                <RechartsTooltip 
                                    cursor={{fill: 'hsl(var(--accent)/0.5)', radius: 4}} 
                                    content={<CustomTooltip />} 
                                />
                                <ChartLegend content={<ChartLegendContent wrapperStyle={{paddingTop: '20px'}} />} />
                                <Bar yAxisId="left" dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar yAxisId="right" dataKey="difficulty" fill="var(--color-difficulty)" radius={[4, 4, 0, 0]} barSize={20} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    ) : (
                    <p className="text-muted-foreground text-center py-10">No data available. Perform an analysis to see keyword volumes.</p>
                    )}
                </CardContent>
                <CardFooter className="p-4 border-t border-border/50">
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

            <Card className="shadow-xl rounded-xl overflow-hidden bg-card/80">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><BrainCircuit className="h-6 w-6 text-primary" /> Market Deep-Dive Report</CardTitle>
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
                                <div className="mt-4 space-y-2">
                                  <h4 className="font-semibold text-sm">Data Sources (Simulated)</h4>
                                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                                      {/* Aggregating all sources for display */}
                                      {[...deepDiveResults.tamSamSom.tam.sources, ...deepDiveResults.tamSamSom.sam.sources, ...deepDiveResults.tamSamSom.som.sources].filter((v, i, a) => a.indexOf(v) === i).map((src, i) => (
                                          <li key={i}><a href={src} target="_blank" rel="noopener noreferrer" className="hover:underline">{getHostname(src)}</a></li>
                                      ))}
                                  </ul>
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
                                    <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-primary"><Shield className="h-5 w-5"/>Strengths</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">{deepDiveResults.swot.strengths.map((s,i) => <li key={i}>{s}</li>)}</ul>
                                    </div>
                                    <div className="p-4 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-destructive"><ShieldOff className="h-5 w-5"/>Weaknesses</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">{deepDiveResults.swot.weaknesses.map((w,i) => <li key={i}>{w}</li>)}</ul>
                                    </div>
                                    <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-primary"><Sparkles className="h-5 w-5"/>Opportunities</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">{deepDiveResults.swot.opportunities.map((o,i) => <li key={i}>{o}</li>)}</ul>
                                    </div>
                                    <div className="p-4 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-destructive"><AlertTriangle className="h-5 w-5"/>Threats</h4>
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
                <CardFooter className="p-4 mt-auto">
                    <Button onClick={handleDeepDiveAnalysis} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isGeneratingDeepDive || !businessType}>
                    {isGeneratingDeepDive ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <BrainCircuit className="mr-2 h-5 w-5"/>}
                    {isGeneratingDeepDive ? "Generating Report..." : "Generate Deep-Dive Report"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-xl rounded-xl overflow-hidden flex flex-col bg-card/80">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl"><Globe className="h-6 w-6 text-primary" /> Arabic Keywords (KSA Focus)</CardTitle>
                      <CardDescription>Translated keywords for the KSA market with trend data.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 flex-grow">
                      {isTranslating ? (
                          <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                      ) : arabicKeywords.length > 0 ? (
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Keyword (Arabic)</TableHead>
                                      <TableHead className="text-right">Volume</TableHead>
                                      <TableHead className="text-right">Change</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {arabicKeywords.map((kw, i) => (
                                      <TableRow key={i}>
                                          <TableCell className="font-medium text-right" dir="rtl">{kw.keyword}</TableCell>
                                          <TableCell className="text-right">{kw.volume.toLocaleString()}</TableCell>
                                           <TableCell className="text-right">
                                              <span className={kw.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                                                {kw.change}%
                                              </span>
                                           </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <p className="text-sm text-muted-foreground text-center py-2">Translated keywords will appear here.</p>
                      )}
                  </CardContent>
                  <CardFooter className="p-4 mt-auto">
                      <Button onClick={() => handleTranslateKeywords()} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isTranslating || !businessType || !currentKeywords[activeTab] || currentKeywords[activeTab].length === 0}>
                      {isTranslating ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Globe className="mr-2 h-5 w-5"/>}
                      {isTranslating ? "Translating..." : "Translate to Arabic"}
                      </Button>
                  </CardFooter>
                </Card>


                <Card className="shadow-xl rounded-xl overflow-hidden flex flex-col bg-card/80">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl"><ListChecks className="h-6 w-6 text-primary" /> AI Content Briefs</CardTitle>
                      <CardDescription>Actionable content briefs based on current keyword trends.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4 flex-grow overflow-y-auto max-h-[400px]">
                      {isSuggesting ? (
                          <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                      ) : seoSuggestions.length > 0 ? (
                          seoSuggestions.map((suggestion, index) => (
                              <div key={index} className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-primary" />
                                    {suggestion.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground italic my-2">"{suggestion.hook}"</p>
                                  <ul className="list-disc list-inside space-y-1 text-xs pl-2 text-muted-foreground">
                                      {suggestion.points.map((point, pIndex) => <li key={pIndex}>{point}</li>)}
                                  </ul>
                              </div>
                          ))
                      ) : (
                          <p className="text-sm text-muted-foreground text-center py-10">Content briefs will appear here.</p>
                      )}
                  </CardContent>
                  <CardFooter className="p-4 mt-auto">
                      <Button onClick={() => handleSeoSuggestions()} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isSuggesting || !businessType || !currentKeywords[activeTab] || currentKeywords[activeTab].length === 0}>
                      {isSuggesting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Lightbulb className="mr-2 h-5 w-5"/>}
                      {isSuggesting ? "Briefing..." : "Generate Content Briefs"}
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-xl">Loading Cockpit...</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}
