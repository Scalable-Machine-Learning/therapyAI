import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Trophy,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { analysisApi } from '@/services/api';
import { AnalysisResult, Insight } from '@/types';
import { cn } from '@/lib/utils';

type TimeRange = '1' | '7' | '14' | 'custom';

const insightIcons = {
  pattern: TrendingUp,
  recommendation: Lightbulb,
  achievement: Trophy,
};

const insightColors = {
  pattern: 'text-primary bg-primary/10',
  recommendation: 'text-accent-foreground bg-accent/20',
  achievement: 'text-mood-positive bg-mood-positive/10',
};

export default function Analysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1');

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(selectedRange));
      
      const result = await analysisApi.triggerAnalysis(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );
      setAnalysis(result);
      setHasRunAnalysis(true);
    } catch (error) {
      console.error('Failed to run analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = analysis?.emotional_trends.map((trend) => ({
    date: format(new Date(trend.date), 'MMM d'),
    score: ((trend.mood_score + 1) / 2) * 100, // Convert -1 to 1 → 0 to 100
    emotion: trend.dominant_emotion,
  })) || [];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">AI Analysis</h1>
            <p className="text-muted-foreground mt-1">Discover patterns in your mental wellbeing</p>
          </div>
        </div>

        {/* Analysis Trigger */}
        <Card className="gradient-hero border-0 text-primary-foreground overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">AI-Powered Insights</span>
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">
                  Analyze Your Journal Entries
                </h2>
                <p className="text-sm text-primary-foreground/80">
                  Get personalized insights about emotional patterns, trends, and areas of focus.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex gap-1 bg-white/10 rounded-lg p-1">
                  {(['1', '7', '14'] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedRange(range)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-md transition-all",
                        selectedRange === range
                          ? "bg-white/20 text-primary-foreground"
                          : "text-primary-foreground/70 hover:text-primary-foreground"
                      )}
                    >
                      {range}d
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={runAnalysis}
                  disabled={isLoading}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {hasRunAnalysis && analysis && (
          <div className="space-y-6 animate-slide-up">
            {/* Summary */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="font-display text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  Analysis period: {format(new Date(analysis.start_date), 'MMM d')} - {format(new Date(analysis.end_date), 'MMM d, yyyy')}
                </p>
              </CardContent>
            </Card>


            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key Insights */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.insights.map((insight, index) => {
                    const Icon = insightIcons[insight.type];
                    return (
                      <div 
                        key={index}
                        className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            insightColors[insight.type]
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Areas of Concern */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-mood-anxious" />
                    Areas of Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.areas_of_concern.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No significant concerns detected. Keep up the great work!
                    </p>
                  ) : (
                    analysis.areas_of_concern.map((concern, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 text-xs rounded-full",
                            concern.severity === 'high' 
                              ? 'bg-mood-negative/15 text-mood-negative'
                              : concern.severity === 'medium'
                              ? 'bg-mood-anxious/15 text-mood-anxious'
                              : 'bg-muted text-muted-foreground'
                          )}>
                            {concern.severity}
                          </span>
                          <h4 className="text-sm font-medium text-foreground">
                            {concern.category}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{concern.description}</p>
                        <ul className="space-y-1">
                          {concern.suggested_actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* Empty State */}
        {!hasRunAnalysis && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                No analysis yet
              </h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                Select a time range above and run an analysis to discover patterns in your journal entries.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
