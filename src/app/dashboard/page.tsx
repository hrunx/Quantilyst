
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
import { Lightbulb, LineChart as LucideLineChartIcon, Search, BarChart3, Settings2, Bell, Briefcase, MapPin, Globe, Sparkles, HelpCircle, FileText, ListChecks, TrendingUp, Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { mockTrendingKeywords, mockCountries, mockTopKeywordsVolumeData } from '@/lib/mockData';
import type { Keyword as AppKeyword, TimeFrame, TimeFrameKeywords } from '@/lib/mockData';
import { getArabicTranslationsAction, getSeoSuggestionsAction, getAdvancedSeoAnalysisAction } from '../actions';
import type { TranslateKeywordsArabicOutput } from '@/ai/flows/translate-keywords-arabic';
import type { SeoContentSuggestionsOutput } from '@/ai/flows/seo-content-suggestions';
import type { AdvancedSeoKeywordAnalysisOutput } from '@/ai/flows/advanced-seo-keyword-analysis';
import { useToast } from "@/hooks/use-toast";

function DashboardContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const businessTypeFromQuery = searchParams.get('businessType');
  const countryFromQuery = searchParams.get('country');
  const cityFromQuery = searchParams.get('city');

  const [businessType, setBusinessType] = useState(businessTypeFromQuery || "E-commerce");
  const [country, setCountry] = useState(countryFromQuery || "US");
  const [city, setCity] = useState(cityFromQuery || "");

  const [currentKeywords, setCurrentKeywords] = useState<TimeFrameKeywords>(mockTrendingKeywords);
  const [activeTab, setActiveTab] = useState<TimeFrame>("week");
  
  const [isOverallLoading, setIsOverallLoading] = useState(false); // For combined initial load
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false); // Specific for keyword fetching

  const [arabicKeywords, setArabicKeywords] = useState<string[]>([]);
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [advancedAnalysisKeyword, setAdvancedAnalysisKeyword] = useState("");
  const [advancedAnalysisResults, setAdvancedAnalysisResults] = useState<AdvancedSeoKeywordAnalysisOutput | null>(null);
  const [isAnalyzingAdvanced, setIsAnalyzingAdvanced] = useState(false);
  
  const generateDynamicKeywords = (baseKeywords: TimeFrameKeywords, bt: string, locCountry: string, locCity: string): TimeFrameKeywords => {
    const newKeywords = JSON.parse(JSON.stringify(baseKeywords)) as TimeFrameKeywords;
    const locationStr = locCity ? `${locCity}, ${locCountry}` : locCountry;
    const baseVolumeMultiplier = locCity ? 0.8 : 1;
    const difficultyBias = locCountry === 'US' ? 5 : 0;

    (Object.keys(newKeywords) as TimeFrame[]).forEach(timeFrame => {
      newKeywords[timeFrame].forEach((kw, index) => {
        const coreTopic = kw.name.split(" - ").pop() || kw.name;
        if (index % 3 === 0) kw.name = `${bt} trends for '${coreTopic}' in ${locationStr}`;
        else if (index % 3 === 1) kw.name = `Best ${coreTopic} strategies for ${bt} (${locationStr})`;
        else kw.name = `How ${bt} in ${locationStr} can leverage ${coreTopic}`;
        
        kw.volume = Math.floor((Math.random() * 4000 + 1000) * baseVolumeMultiplier * (1 + (index * 0.05)));
        kw.change = Math.floor(Math.random() * 60) - 30;
        kw.difficulty = Math.min(100, Math.floor(Math.random() * 70) + 20 + difficultyBias + (bt.length % 10));
        const possibleFeatures = ["Featured Snippet", "People Also Ask", "Image Pack", "Video Carousel", "Local Pack", "Top Stories", "Reviews"];
        const numFeatures = Math.floor(Math.random() * 3);
        kw.serpFeatures = [];
        for (let i = 0; i < numFeatures; i++) {
          const feature = possibleFeatures[Math.floor(Math.random() * possibleFeatures.length)];
          if (!kw.serpFeatures.includes(feature)) kw.serpFeatures.push(feature);
        }
      });
    });
    return newKeywords;
  };

  const fetchKeywords = useCallback(async () => {
    if (!businessType) {
      toast({ title: "Input Required", description: "Business type is needed to fetch keywords.", variant: "destructive" });
      return false;
    }
    setIsLoadingKeywords(true);
    setArabicKeywords([]);
    setSeoSuggestions([]);
    setAdvancedAnalysisResults(null); 
    
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const newDynamicKeywords = generateDynamicKeywords(mockTrendingKeywords, businessType, country, city);
    setCurrentKeywords(newDynamicKeywords);
    setIsLoadingKeywords(false);
    return newDynamicKeywords; // Return the keywords for sequential operations
  }, [businessType, country, city, toast]);


  const handleTranslateKeywords = useCallback(async (keywordsForTranslation?: AppKeyword[]) => {
    const keywordsToUse = keywordsForTranslation || currentKeywords[activeTab];
    if (!businessType || !keywordsToUse || keywordsToUse.length === 0) {
      if (!keywordsForTranslation) { // Only toast if not part of an auto-sequence
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
    if (!businessTypeFromQuery) return; // Don't run if not navigated from search

    setIsOverallLoading(true);
    toast({ title: "Loading Dashboard", description: `Fetching insights for ${businessTypeFromQuery}...` });

    const fetchedKeywordsResult = await fetchKeywords();
    if (fetchedKeywordsResult && fetchedKeywordsResult[activeTab] && fetchedKeywordsResult[activeTab].length > 0) {
      // Keywords are fetched, now trigger dependent actions
      await Promise.all([
        handleTranslateKeywords(fetchedKeywordsResult[activeTab]),
        handleSeoSuggestions(fetchedKeywordsResult[activeTab])
      ]);
      // Pre-fill advanced analysis keyword
      const firstKeywordName = fetchedKeywordsResult[activeTab][0]?.name;
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
  }, [businessTypeFromQuery, fetchKeywords, handleTranslateKeywords, handleSeoSuggestions, activeTab, toast]); // Dependencies for initial load

  // Effect for initial data load when navigated from search page
  useEffect(() => {
    if (businessTypeFromQuery && countryFromQuery) { // Ensure basic params are there
      setBusinessType(businessTypeFromQuery);
      setCountry(countryFromQuery);
      if(cityFromQuery) setCity(cityFromQuery);
      loadInitialDashboardData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessTypeFromQuery, countryFromQuery, cityFromQuery]); // Only re-run if query params actually change

  const handleManualReanalyze = async () => {
    if (!businessType) {
       toast({ title: "Input Required", description: "Please specify a business type.", variant: "destructive" });
       return;
    }
    setIsOverallLoading(true);
    toast({ title: "Re-analyzing Market Data", description: `Updating all insights for ${businessType}${country ? ` in ${country}` : ''}${city ? `, ${city}` : ''}...` });

    const fetchedKeywordsResult = await fetchKeywords(); // This also clears previous AI results
    if (fetchedKeywordsResult && fetchedKeywordsResult[activeTab] && fetchedKeywordsResult[activeTab].length > 0) {
      await Promise.all([
        handleTranslateKeywords(fetchedKeywordsResult[activeTab]),
        handleSeoSuggestions(fetchedKeywordsResult[activeTab])
      ]);
      const firstKeywordName = fetchedKeywordsResult[activeTab][0]?.name;
      if (firstKeywordName && advancedAnalysisKeyword !== firstKeywordName) { // Only update if different to avoid losing user's specific input unless context changed significantly
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
    // Fallback to mock if no dynamic data or still loading, ensures chart always has some structure
    return mockTopKeywordsVolumeData.slice(0,10).map(item => ({ 
      name: item.keyword.length > 30 ? item.keyword.substring(0, 27) + "..." : item.keyword,
      volume: item.volume
    }));
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
                <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-6 w-6 text-primary" /> AI-Powered Advanced SEO Analysis</CardTitle>
                <CardDescription>Unlock deeper strategic insights for any specific keyword relevant to your current business context.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="advancedKeyword" className="flex items-center gap-1 mb-1 font-semibold"><Search className="h-4 w-4 text-primary"/>Keyword for In-depth Analysis</Label>
                  <Input id="advancedKeyword" placeholder="Enter or select a keyword" value={advancedAnalysisKeyword} onChange={e => setAdvancedAnalysisKeyword(e.target.value)} className="mt-1"/>
                </div>
                {isAnalyzingAdvanced && <div className="flex justify-center py-2"><Loader2 className="h-6 w-6 animate-spin text-primary" /> <p className="ml-2 text-sm text-muted-foreground">AI is processing...</p></div>}
                {advancedAnalysisResults && !isAnalyzingAdvanced && (
                  <Accordion type="single" collapsible className="w-full" defaultValue="difficulty">
                    <AccordionItem value="difficulty"><AccordionTrigger className="text-base">Overall Difficulty & Potential</AccordionTrigger><AccordionContent className="text-sm">{advancedAnalysisResults.difficultyAnalysis}</AccordionContent></AccordionItem>
                    <AccordionItem value="long-tail"><AccordionTrigger className="text-base">Long-Tail Keyword Opportunities</AccordionTrigger><AccordionContent><ul className="list-disc list-inside space-y-1 text-sm pl-2">{advancedAnalysisResults.longTailSuggestions.map((kw, i) => <li key={`lt-${i}`}>{kw}</li>)}</ul></AccordionContent></AccordionItem>
                    <AccordionItem value="questions"><AccordionTrigger className="text-base">Common User Questions</AccordionTrigger><AccordionContent><ul className="list-disc list-inside space-y-1 text-sm pl-2">{advancedAnalysisResults.relatedQuestions.map((q, i) => <li key={`q-${i}`}>{q}</li>)}</ul></AccordionContent></AccordionItem>
                    <AccordionItem value="outline"><AccordionTrigger className="text-base">AI-Suggested Content Outline</AccordionTrigger><AccordionContent><h4 className="font-semibold mb-2 text-md">{advancedAnalysisResults.basicContentOutline.title}</h4><ul className="list-disc list-inside space-y-1 text-sm pl-2">{advancedAnalysisResults.basicContentOutline.sections.map((s, i) => <li key={`s-${i}`}>{s}</li>)}</ul></AccordionContent></AccordionItem>
                  </Accordion>
                )}
                 {!isAnalyzingAdvanced && !advancedAnalysisResults && <p className="text-sm text-muted-foreground text-center py-2">Enter a keyword and click analyze to reveal advanced AI insights.</p>}
              </CardContent>
              <CardFooter className="bg-muted/50 dark:bg-muted/20 p-4">
                <Button onClick={handleAdvancedSeoAnalysis} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isAnalyzingAdvanced || !businessType || !advancedAnalysisKeyword}>
                  {isAnalyzingAdvanced ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <FileText className="mr-2 h-5 w-5" />}
                  {isAnalyzingAdvanced ? "Analyzing Keyword..." : "Get Advanced Analysis"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-primary/5 dark:bg-primary/10">
                <CardTitle className="flex items-center gap-2 text-xl"><Globe className="h-6 w-6 text-primary" /> Arabic Keywords (KSA Focus)</CardTitle>
                <CardDescription>Translate your trending keywords into Arabic, tailored for the KSA market based on current context.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 min-h-[100px]">
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
                {(isLoadingKeywords || isOverallLoading) && !keywordChartData.some(d => d.volume > 0) ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p>Loading chart data...</p>
                  </div>
                ) : keywordChartData.length > 0 && keywordChartData.some(d => d.volume > 0) ? (
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
            </Card>

            <Card className="shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-primary/5 dark:bg-primary/10">
                <CardTitle className="flex items-center gap-2 text-xl"><ListChecks className="h-6 w-6 text-primary" /> AI-Driven SEO Content Strategy Hub</CardTitle>
                <CardDescription>Generate actionable content ideas and strategies based on the current keyword trends for your business.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 min-h-[250px] pt-6">
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
                  <p className="text-sm text-muted-foreground text-center py-10">Content ideas will appear here based on the analysis.</p>
                )}
              </CardContent>
              <CardFooter className="bg-muted/50 dark:bg-muted/20 p-4">
                <Button onClick={() => handleSeoSuggestions()} className="w-full text-lg py-6 rounded-md" disabled={isOverallLoading || isSuggesting || !businessType || !currentKeywords[activeTab] || currentKeywords[activeTab].length === 0}>
                 {isSuggesting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Lightbulb className="mr-2 h-5 w-5"/>}
                 {isSuggesting ? "Generating Ideas..." : "Generate Content Strategies"}
                </Button>
              </CardFooter>
            </Card>
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
