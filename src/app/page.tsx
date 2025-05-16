
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Briefcase, MapPin, Search, BarChart3, Loader2 } from 'lucide-react'; // Added Loader2
import { useToast } from "@/hooks/use-toast";
import { mockCountries } from '@/lib/mockData';

export default function SearchPage() {
  const [businessType, setBusinessType] = useState("");
  const [country, setCountry] = useState("US");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
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

    setIsLoading(true); // Set loading to true

    const query = new URLSearchParams({
      businessType: businessType.trim(),
      country: country,
    });
    if (city.trim()) {
      query.append('city', city.trim());
    }
    // Simulate a short delay if needed, or directly push
    // For actual async work before push, you'd await it here.
    // For now, the loading state is mostly for the button's visual feedback.
    router.push(`/dashboard?${query.toString()}`);
    // No need to setIsLoading(false) here as the page will navigate away.
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <BarChart3 className="mx-auto h-16 w-16 text-sky-400" />
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight">Market Insights Pro</h1>
          <p className="mt-4 text-xl text-slate-300">
            Unlock deep SEO analytics and content strategies tailored for your business.
          </p>
        </div>

        <Card className="bg-slate-800/70 border-slate-700 shadow-2xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-center text-sky-300 flex items-center justify-center gap-2">
              <Search className="h-8 w-8" /> Configure Your Analysis
            </CardTitle>
            <CardDescription className="text-center text-slate-400 pt-2 text-base">
              Provide your business details to generate tailored market insights and SEO recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label htmlFor="businessType" className="flex items-center gap-2 text-lg font-medium text-slate-200 mb-2">
                <Briefcase className="h-5 w-5 text-sky-400" />Business Type / Industry
              </Label>
              <Input
                id="businessType"
                placeholder="e.g., SaaS, Local Restaurant, B2B Tech"
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-lg p-3"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="country" className="flex items-center gap-2 text-lg font-medium text-slate-200 mb-2">
                  <Globe className="h-5 w-5 text-sky-400" />Target Country
                </Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country" className="bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500 text-lg p-3 h-auto">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white">
                    {mockCountries.map(c => (
                      <SelectItem key={c.value} value={c.value} className="text-lg focus:bg-sky-600">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city" className="flex items-center gap-2 text-lg font-medium text-slate-200 mb-2">
                  <MapPin className="h-5 w-5 text-sky-400" />Target City (Optional)
                </Label>
                <Input
                  id="city"
                  placeholder="e.g., San Francisco, Riyadh"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-lg p-3"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-8">
            <Button
              onClick={handleSearch}
              className="w-full text-xl py-7 rounded-lg bg-sky-500 hover:bg-sky-600 transition-colors duration-300 ease-in-out transform hover:scale-105"
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
        <p className="text-center text-sm text-slate-500">
          Powered by Generative AI for cutting-edge market intelligence.
        </p>
      </div>
    </div>
  );
}
