'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PostCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deliverable: '',
    budget: '',
    timeline: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      router.push('/dashboard/brand');
    }, 1500);
  };

  const isFormValid =
    formData.title &&
    formData.description &&
    formData.deliverable &&
    formData.budget &&
    formData.timeline;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-4"
      >
        <Link href="/dashboard/brand">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Post a New Campaign</h1>
          <p className="text-muted-foreground">
            Fill in the details and reach creators instantly
          </p>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-2xl"
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Provide information about your campaign to attract the right creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campaign Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Campaign Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Summer Collection Launch"
                  value={formData.title}
                  onChange={handleChange}
                  className="border-border/50"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your campaign, target audience, and key message..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="border-border/50"
                />
              </div>

              {/* Deliverable Type */}
              <div className="space-y-2">
                <Label htmlFor="deliverable" className="text-sm font-medium">
                  Deliverable Type
                </Label>
                <Select
                  value={formData.deliverable}
                  onValueChange={(value) =>
                    handleSelectChange('deliverable', value)
                  }
                >
                  <SelectTrigger className="border-border/50">
                    <SelectValue placeholder="Select deliverable type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reel">Instagram Reel</SelectItem>
                    <SelectItem value="post">Instagram Post</SelectItem>
                    <SelectItem value="story">Instagram Story</SelectItem>
                    <SelectItem value="tiktok">TikTok Video</SelectItem>
                    <SelectItem value="youtube">YouTube Video</SelectItem>
                    <SelectItem value="youtube-short">YouTube Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">
                  Budget (₹)
                </Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="e.g., 50000"
                  value={formData.budget}
                  onChange={handleChange}
                  className="border-border/50"
                />
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-sm font-medium">
                  Timeline
                </Label>
                <Select
                  value={formData.timeline}
                  onValueChange={(value) =>
                    handleSelectChange('timeline', value)
                  }
                >
                  <SelectTrigger className="border-border/50">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-day">1 Day</SelectItem>
                    <SelectItem value="2-days">2 Days</SelectItem>
                    <SelectItem value="3-days">3 Days</SelectItem>
                    <SelectItem value="1-week">1 Week</SelectItem>
                    <SelectItem value="2-weeks">2 Weeks</SelectItem>
                    <SelectItem value="1-month">1 Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Link href="/dashboard/brand" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Campaign'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
