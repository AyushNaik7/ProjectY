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
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PostCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
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
    // Clear validation error for this field on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Campaign title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Campaign title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!formData.deliverable) {
      errors.deliverable = 'Please select a deliverable type';
    }

    if (!formData.budget) {
      errors.budget = 'Budget is required';
    } else if (parseInt(formData.budget) <= 0) {
      errors.budget = 'Budget must be greater than 0';
    } else if (parseInt(formData.budget) > 10000000) {
      errors.budget = 'Budget cannot exceed ₹1 crore';
    }

    if (!formData.timeline) {
      errors.timeline = 'Please select a timeline';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/campaigns', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Failed to create campaign');
      // }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/brand');
      }, 1500);
    } catch (err) {
      const error = err as { message?: string };
      console.error('Campaign creation error:', err);
      setSubmitError(error.message || 'Failed to create campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.title &&
    formData.description &&
    formData.deliverable &&
    formData.budget &&
    formData.timeline &&
    Object.keys(validationErrors).length === 0;

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
                  className={`border-border/50 ${
                    validationErrors.title ? 'border-destructive' : ''
                  }`}
                  disabled={isLoading}
                />
                {validationErrors.title && (
                  <p className="text-xs text-destructive">{validationErrors.title}</p>
                )}
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
                  className={`border-border/50 ${
                    validationErrors.description ? 'border-destructive' : ''
                  }`}
                  disabled={isLoading}
                />
                {validationErrors.description && (
                  <p className="text-xs text-destructive">{validationErrors.description}</p>
                )}
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
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={`border-border/50 ${
                      validationErrors.deliverable ? 'border-destructive' : ''
                    }`}
                  >
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
                {validationErrors.deliverable && (
                  <p className="text-xs text-destructive">{validationErrors.deliverable}</p>
                )}
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
                  className={`border-border/50 ${
                    validationErrors.budget ? 'border-destructive' : ''
                  }`}
                  disabled={isLoading}
                />
                {validationErrors.budget && (
                  <p className="text-xs text-destructive">{validationErrors.budget}</p>
                )}
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
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={`border-border/50 ${
                      validationErrors.timeline ? 'border-destructive' : ''
                    }`}
                  >
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
                {validationErrors.timeline && (
                  <p className="text-xs text-destructive">{validationErrors.timeline}</p>
                )}
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{submitError}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                    ✓
                  </div>
                  <p className="text-sm text-green-700">Campaign created successfully! Redirecting...</p>
                </div>
              )}

              {/* Submit Buttons */}
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
