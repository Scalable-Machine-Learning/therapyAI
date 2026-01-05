"""AI inference endpoints (therapy chat, sentiment analysis, etc.)."""

from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from datetime import datetime, timedelta
from openai import OpenAI
import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

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


@router.get("/check-setup")
async def check_setup() -> dict[str, Any]:
    """Check if the setup is correct (for debugging)."""
    checks = {
        "openai_api_key_set": bool(os.getenv("OPENAI_API_KEY")),
        "supabase_url_set": bool(os.getenv("SUPABASE_URL")),
        "supabase_key_set": bool(os.getenv("SUPABASE_ANON_KEY")),
    }
    return {"checks": checks}


@router.get("/mental-health-checkin/1day")
async def checkin_1day(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Analyze last 1 entry."""
    return await analyze_entries(1, current_user)


@router.get("/mental-health-checkin/7days")
async def checkin_7days(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Analyze last 7 entries."""
    return await analyze_entries(7, current_user)


@router.get("/mental-health-checkin/14days")
async def checkin_14days(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Analyze last 14 entries."""
    return await analyze_entries(14, current_user)


async def analyze_entries(num_entries: int, current_user: User) -> dict[str, Any]:
    """Helper to analyze last N journal entries."""
    try:
        # Fetch last N entries
        response = (
            supabase.table("journal_entries")
            .select("*")
            .eq("user_id", current_user.id)
            .order("created_at", desc=True)
            .limit(num_entries)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail=f"No journal entries found.",
            )

        entries = response.data
        # Reverse to get chronological order for display
        entries_reversed = list(reversed(entries))

        # Format entries
        formatted_entries = "\n\n".join([
            f"[{datetime.fromisoformat(entry['created_at'].replace('Z', '+00:00')).strftime('%B %d, %Y at %I:%M %p')}]\n{entry['content']}"
            for entry in entries_reversed
        ])

        date_range = f"{entries_reversed[0]['created_at'][:10]} to {entries_reversed[-1]['created_at'][:10]}"

        system_prompt = """You are a supportive mental-health check-in assistant.
You are not a clinician and must not diagnose or make absolute claims.
Base your analysis only on the journal text provided and speak in probabilities, not certainties.
Be calm, honest, and practical—no sugar-coating, no alarmism.

If the journal suggests self-harm, suicidal ideation, harm to others, or inability to stay safe, explicitly say so and recommend reaching out immediately to local emergency services, a crisis hotline, or a trusted person. Keep the tone non-judgmental and supportive."""

        user_prompt = f"""DATE RANGE: {date_range}
ANALYSIS PERIOD: Last {num_entries} entries

JOURNAL ENTRIES (in chronological order):
{formatted_entries}

Your task: Perform a mental health check-in based on these journal entries.

1. Emotional snapshot
Summarize the overall emotional tone and dominant feelings across the entries.

2. Stressors & patterns
Identify likely stressors, recurring themes, or cognitive patterns (e.g., rumination, avoidance, pressure, isolation).

3. Risk flags (if any)
Point out potential warning signs the person should be wary of in the near term (burnout, spiraling thoughts, withdrawal, sleep disruption, etc.).
If there are no major red flags, say that clearly.

4. Protective factors & strengths
Highlight anything in the journals that suggests resilience, support, insight, or healthy coping.

5. Practical next steps (24–48h)
Offer a short list of concrete, realistic actions that could help stabilize or improve their state.

6. Gentle follow-up questions
Provide 3–6 open-ended questions that could help the person reflect or check in with themselves.

7. Safety note (only if needed)
If there are safety concerns, state them plainly and include guidance to seek immediate help."""

        completion = openai_client.chat.completions.create(
            model="gpt-4-turbo",
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
            "period_days": num_entries,
            "date_range": date_range,
            "entry_count": len(entries),
            "analysis": analysis_text,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Failed to generate analysis: {str(e)}"
        )
# - POST /chat - therapy chatbot conversation
# - POST /analyze_sentiment - sentiment analysis on journal entries
# - POST /generate_insights - weekly insights from journal data
