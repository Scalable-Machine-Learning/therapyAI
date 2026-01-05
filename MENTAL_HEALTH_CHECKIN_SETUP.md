# Mental Health Check-in Feature - Setup Guide

## Overview
The mental health check-in feature analyzes the user's latest journal entry using OpenAI's GPT-4.5 model and provides supportive, non-clinical feedback based on the provided prompt template.

## Setup Requirements

### 1. Environment Variables
Add the following to your `.env` file in the backend root:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Get your API key from: https://platform.openai.com/account/api-keys

### 2. Install Dependencies
The `openai` package has been added to `pyproject.toml`. Install it:

```bash
cd backend
pip install -e .
```

## Backend Implementation

### Endpoint
**GET** `/api/inference/mental-health-checkin`

### Authentication
- Requires Bearer token in Authorization header (automatically handled by `get_current_user` dependency)

### Response
```json
{
  "success": true,
  "journal_entry_id": "uuid-of-entry",
  "entry_date": "January 05, 2026",
  "analysis": "The AI-generated mental health check-in analysis..."
}
```

### How It Works
1. Fetches the latest journal entry for the authenticated user
2. Extracts the journal text and date
3. Creates a structured prompt with 7 sections:
   - Emotional snapshot
   - Stressors & patterns
   - Risk flags
   - Protective factors & strengths
   - Practical next steps (24-48h)
   - Gentle follow-up questions
   - Safety note (if needed)
4. Calls OpenAI GPT-4.5 with the prompt
5. Returns the analysis to the client

### Error Handling
- Returns 404 if user has no journal entries
- Returns 500 with error details if OpenAI call fails
- All safety concerns are explicitly flagged by the AI

## Frontend Integration

### API Method
```typescript
import { inferenceApi } from '@/services/api';

const result = await inferenceApi.getMentalHealthCheckin();
console.log(result.analysis);
```

### Example Usage in a Component
```tsx
const [analysis, setAnalysis] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

const handleGetCheckin = async () => {
  setIsLoading(true);
  try {
    const result = await inferenceApi.getMentalHealthCheckin();
    setAnalysis(result.analysis);
  } catch (error) {
    console.error('Failed to get check-in:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## Testing the Endpoint

### Using cURL
```bash
curl -X GET http://localhost:8000/api/inference/mental-health-checkin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Python
```python
import requests

headers = {
    "Authorization": "Bearer YOUR_JWT_TOKEN"
}
response = requests.get(
    "http://localhost:8000/api/inference/mental-health-checkin",
    headers=headers
)
print(response.json())
```

## Prompt Structure

The analysis is performed across 7 dimensions:

1. **Emotional Snapshot** - Overall tone and dominant feelings
2. **Stressors & Patterns** - Recurring themes and cognitive patterns
3. **Risk Flags** - Warning signs to watch for (if any)
4. **Protective Factors** - Strengths and resilience indicators
5. **Practical Next Steps** - Concrete actions for 24-48 hours
6. **Follow-up Questions** - Open-ended reflection prompts
7. **Safety Note** - Only if there are safety concerns

### Safety Features
- The AI explicitly mentions self-harm, suicidal ideation, or harm to others if detected
- Recommends immediate help-seeking in non-judgmental, supportive language
- Provides crisis hotline guidance when needed

## Costs
- OpenAI API charges per token used
- GPT-4.5 is more expensive than GPT-3.5 but provides better analysis
- Typical check-in uses ~300-800 tokens depending on journal entry length

## Future Enhancements
- Store analysis results in Supabase for history/comparison
- Add sentiment analysis alongside check-in
- Support for batch analysis of multiple entries
- Integration with goals and progress tracking
- Chat-based follow-up questions
