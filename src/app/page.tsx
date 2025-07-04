
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Briefcase, MapPin, Search, BarChart3, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { mockCountries } from '@/lib/mockData';

export default function SearchPage() {
  const [businessType, setBusinessType] = useState("");
  const [country, setCountry] = useState("US");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = () => {
    if (!businessType.trim()) {
      toast({
        title: "Business Type Required",
        description: "Please enter a business type or industry to get insights.",
        variant: "destructive",
      });
      return;
    }
    if (!country) {
      toast({
        title: "Country Required",
        description: "Please select a target country.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const query = new URLSearchParams({
      businessType: businessType.trim(),
      country: country,
    });
    if (city.trim()) {
      query.append('city', city.trim());
    }
    router.push(`/dashboard?${query.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-foreground">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <BarChart3 className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight">Quantilyst Market Intelligence</h1>
          <p className="mt-4 text-xl text-slate-300">
            Real-time, end-to-end market visibility for whoever cares.
          </p>
           <p className="mt-2 text-lg text-slate-400 max-w-xl mx-auto">
            From search signals and social buzz to funding flows and competitive benchmarks—Quantilyst distills every datapoint into clear, actionable strategy.
          </p>
        </div>

        <Card className="bg-card/80 border-border shadow-2xl shadow-primary/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-center text-primary flex items-center justify-center gap-2">
              <Search className="h-8 w-8" /> Fire up the engine:
            </CardTitle>
            <CardDescription className="text-center text-slate-400 pt-2 text-base">
               Tell us what you’re chasing; Quantilyst builds an executive-grade report in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label htmlFor="businessType" className="flex items-center gap-2 text-lg font-medium text-slate-200 mb-2">
                <Briefcase className="h-5 w-5 text-primary" />Business Type / Industry
              </Label>
              <Input
                id="businessType"
                placeholder="e.g., SaaS, Local Restaurant, B2B Tech"
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary text-lg p-3"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="country" className="flex items-center gap-2 text-lg font-medium text-slate-200 mb-2">
                  <Globe className="h-5 w-5 text-primary" />Target Country
                </Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country" className="bg-input border-border text-foreground focus:ring-primary focus:border-primary text-lg p-3 h-auto">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {mockCountries.map(c => (
                      <SelectItem key={c.value} value={c.value} className="text-lg focus:bg-primary/20">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city" className="flex items-center gap-2 text-lg font-medium text-slate-200 mb-2">
                  <MapPin className="h-5 w-5 text-primary" />Target City (Optional)
                </Label>
                <Input
                  id="city"
                  placeholder="e.g., San Francisco, Riyadh"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary text-lg p-3"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-8">
            <Button
              onClick={handleSearch}
              className="w-full text-xl py-7 rounded-lg bg-primary text-primary-foreground transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-primary/40"
              disabled={isLoading || !businessType.trim() || !country}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Search className="mr-2 h-6 w-6" />
              )}
              {isLoading ? "Analyzing..." : "Analyze Insights & Get Report"}
            </Button>
          </CardFooter>
        </Card>
        <p className="text-center text-sm text-muted-foreground/70">
          Powered by HWAH Industries
        </p>
      </div>
    </div>
  );
}
