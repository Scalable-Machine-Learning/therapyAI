"""AI inference endpoints (therapy chat, sentiment analysis, etc.)."""

from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from datetime import datetime
from openai import OpenAI
import os
from dotenv import load_dotenv

try:
    from backend.schemas import User
    from backend.dependencies import get_current_user, supabase
except ModuleNotFoundError:
    from schemas import User
    from dependencies import get_current_user, supabase

load_dotenv()

router = APIRouter(prefix="/api/inference", tags=["inference"])

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@router.get("/health")
async def inference_health() -> dict[str, str]:
    """Health check for the inference service."""
    return {"status": "ok", "message": "Inference router is ready"}


@router.get("/mental-health-checkin")
async def mental_health_checkin(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Perform a mental health check-in based on the user's latest journal entry.
    Uses OpenAI to analyze the entry and provide supportive feedback.
    """
    try:
        # Fetch the latest journal entry for the user
        response = (
            supabase.table("journal_entries")
            .select("*")
            .eq("user_id", current_user.id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="No journal entries found. Please create one before running analysis.",
            )

        latest_entry = response.data[0]
        journal_text = latest_entry["content"]
        entry_date = latest_entry["created_at"]

        # Format the date for the prompt
        if isinstance(entry_date, str):
            entry_datetime = datetime.fromisoformat(entry_date.replace("Z", "+00:00"))
        else:
            entry_datetime = entry_date
        formatted_date = entry_datetime.strftime("%B %d, %Y")

        # Create the prompt with the journal content and date
        system_prompt = """You are a supportive mental-health check-in assistant.
You are not a clinician and must not diagnose or make absolute claims.
Base your analysis only on the journal text provided and speak in probabilities, not certainties.
Be calm, honest, and practical—no sugar-coating, no alarmism.

If the journal suggests self-harm, suicidal ideation, harm to others, or inability to stay safe, explicitly say so and recommend reaching out immediately to local emergency services, a crisis hotline, or a trusted person. Keep the tone non-judgmental and supportive."""

        user_prompt = f"""DATE: {formatted_date}

TODAY'S JOURNAL (verbatim):
{journal_text}

Your task: Perform a mental health check-in based on the journal.

1. Emotional snapshot
Summarize the overall emotional tone and dominant feelings.

2. Stressors & patterns
Identify likely stressors, recurring themes, or cognitive patterns (e.g., rumination, avoidance, pressure, isolation).

3. Risk flags (if any)
Point out potential warning signs the person should be wary of in the near term (burnout, spiraling thoughts, withdrawal, sleep disruption, etc.).
If there are no major red flags, say that clearly.

4. Protective factors & strengths
Highlight anything in the journal that suggests resilience, support, insight, or healthy coping.

5. Practical next steps (24–48h)
Offer a short list of concrete, realistic actions that could help stabilize or improve their state.

6. Gentle follow-up questions
Provide 3–6 open-ended questions that could help the person reflect or check in with themselves.

7. Safety note (only if needed)
If there are safety concerns, state them plainly and include guidance to seek immediate help."""

        # Call OpenAI API
        completion = openai_client.chat.completions.create(
            model="gpt-4.5",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
        )

        analysis_text = completion.choices[0].message.content

        return {
            "success": True,
            "journal_entry_id": latest_entry["id"],
            "entry_date": formatted_date,
            "analysis": analysis_text,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate mental health check-in: {str(e)}"
        )


# TODO: Add more AI/ML endpoints here, e.g.:
# - POST /chat - therapy chatbot conversation
# - POST /analyze_sentiment - sentiment analysis on journal entries
# - POST /generate_insights - weekly insights from journal data

