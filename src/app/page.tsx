
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Search, BarChart3, Settings2, Bell, Briefcase, MapPin, Globe } from 'lucide-react';
import { mockTrendingKeywords, mockCountries, Keyword, TimeFrame } from '@/lib/mockData';
import { getArabicTranslationsAction, getSeoSuggestionsAction } from './actions';
import type { TranslateKeywordsArabicOutput } from '@/ai/flows/translate-keywords-arabic';
import type { SeoContentSuggestionsOutput } from '@/ai/flows/seo-content-suggestions';
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
  const [seoSuggestions, setSeoSuggestions] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    toast({ title: "Fetching Data", description: "Analyzing keywords and trends..." });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In a real app, you would fetch new data based on inputs
    // For now, we just re-use mock data or slightly alter it
    setCurrentKeywords(prev => ({ ...prev })); 
    setIsLoading(false);
    toast({ title: "Analysis Complete", description: "Latest keyword data loaded." });
  };

  const handleTranslateKeywords = async () => {
    if (!businessType || currentKeywords[activeTab].length === 0) {
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
    if (!businessType || currentKeywords[activeTab].length === 0) {
      toast({ title: "Suggestions Skipped", description: "Business type and trending keywords are required.", variant: "destructive" });
      return;
    }
    setIsSuggesting(true);
    toast({ title: "Generating SEO Suggestions", description: "Fetching content ideas..." });
    const trendingKeywordsString = currentKeywords[activeTab].map(kw => kw.name).join(", ");
    const result = await getSeoSuggestionsAction({ businessType, trendingKeywords: trendingKeywordsString });
    if (result.success && result.data) {
      setSeoSuggestions(result.data.suggestions);
      toast({ title: "SEO Suggestions Ready", description: "Content ideas generated." });
    } else {
      toast({ title: "Suggestion Failed", description: result.error || "Could not get SEO suggestions.", variant: "destructive" });
      setSeoSuggestions("");
    }
    setIsSuggesting(false);
  };
  
  useEffect(() => {
    // Example of an alert for high keyword change - to be implemented fully with real data
    const weeklyKeywords = currentKeywords.week;
    weeklyKeywords.forEach(keyword => {
      if (keyword.change > 15) {
        // In a real app, this would integrate with an email service
        console.log(`ALERT: Keyword "${keyword.name}" week-over-week change is ${keyword.change}%!`);
        // toast({
        //   title: "High Keyword Alert!",
        //   description: `Keyword "${keyword.name}" has a ${keyword.change}% week-over-week change.`,
        //   variant: "destructive"
        // });
      }
    });
  }, [currentKeywords, toast]);


  const renderKeywordTable = (keywords: Keyword[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          <TableHead className="text-right">Volume/Trend</TableHead>
          <TableHead className="text-right">Change (%)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords.length > 0 ? keywords.map(keyword => (
          <TableRow key={keyword.id}>
            <TableCell>{keyword.name}</TableCell>
            <TableCell className="text-right">{keyword.volume?.toLocaleString() || 'N/A'}</TableCell>
            <TableCell className={`text-right ${keyword.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {keyword.change > 0 ? '+' : ''}{keyword.change}%
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center">No keywords to display for this period.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

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
                <Button onClick={handleTranslateKeywords} className="w-full" disabled={isTranslating || !businessType || currentKeywords[activeTab]?.length === 0}>
                  {isTranslating ? "Translating..." : "Generate Arabic Keywords"}
                </Button>
              </CardFooter>
            </Card>

             <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LineChart className="h-6 w-6 text-primary" /> SEO Content Suggestions</CardTitle>
                <CardDescription>Get AI-powered content ideas based on current trends.</CardDescription>
              </CardHeader>
              <CardContent>
                {isSuggesting && <p className="text-sm text-muted-foreground">Generating suggestions...</p>}
                {seoSuggestions && !isSuggesting && (
                  <p className="text-sm whitespace-pre-wrap">{seoSuggestions}</p>
                )}
                {!isSuggesting && !seoSuggestions && <p className="text-sm text-muted-foreground">SEO content suggestions will appear here.</p>}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSeoSuggestions} className="w-full" disabled={isSuggesting || !businessType || currentKeywords[activeTab]?.length === 0}>
                 {isSuggesting ? "Generating..." : "Get SEO Suggestions"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Dashboard Display */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary"/>Trending Keywords Dashboard</CardTitle>
                <CardDescription>Live keyword trends for your business category and selected region.</CardDescription>
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
            
            {/* Placeholder for charts - to be implemented */}
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Keyword Trend Visualizations</CardTitle>
                 <CardDescription>Charts and graphs illustrating keyword performance.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">Detailed charts and graphs will be displayed here.</p>
                {/* Example: <img src="https://placehold.co/600x300.png?text=Keyword+Trend+Chart" alt="Placeholder chart" className="w-full h-auto rounded-md" data-ai-hint="data finance" /> */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

    