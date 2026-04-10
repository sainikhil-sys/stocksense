"""
Google Gemini AI integration for StockSense AI.
All AI responses are structured, plain-English, and beginner-friendly.
"""
import json
import logging
import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')


def _safe_call(prompt: str, fallback: dict) -> dict:
    """Call Gemini safely and parse JSON response."""
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```'):
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
        return json.loads(text)
    except json.JSONDecodeError:
        return {'text': response.text if 'response' in dir() else str(fallback)}
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return fallback


def _build_profile_context(profile) -> str:
    if not profile:
        return "User profile not available."
    return f"""
User Financial Profile:
- Age: {profile.age or 'Not set'}
- Monthly Income: ₹{profile.monthly_income:,}
- Monthly Expenses: ₹{profile.monthly_expenses:,}
- Net Monthly Savings: ₹{profile.monthly_savings:,.0f}
- Current Savings: ₹{profile.current_savings:,}
- Risk Level: {profile.risk_level.title()}
- Investment Experience: {profile.investment_experience.title()}
- Savings Rate: {profile.savings_rate}%
"""


def chat_with_ai(message: str, profile, history: list = None) -> str:
    """Main chat function — answers financial questions in plain English."""
    profile_ctx = _build_profile_context(profile)

    system_prompt = f"""You are StockSense AI — a friendly, expert financial advisor for beginners aged 18-35 in India.

{profile_ctx}

Rules:
1. Always explain in simple, jargon-free language (as if explaining to a friend)
2. Use Indian Rupee (₹) context
3. Give structured, numbered action steps when giving advice
4. Be encouraging and positive, not alarming
5. If recommending investments, always suggest categories (index funds, FDs) — NOT specific stocks
6. End with: "Remember, this is educational guidance — consult a SEBI-registered advisor for personalised advice."
7. Keep responses concise (max 200 words) unless asked for detail

User question: {message}"""

    try:
        response = model.generate_content(system_prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Chat Gemini error: {e}")
        return "I'm having trouble connecting right now. Please try again in a moment!"


def get_budget_suggestions(profile, budget) -> list:
    """Generate AI budget optimization suggestions."""
    income = float(budget.actual_income or profile.monthly_income)
    if income == 0:
        return ["Please set your monthly income to get personalized suggestions."]

    prompt = f"""Analyze this budget and give 3-4 actionable suggestions to improve it.

Income: ₹{income:,.0f}
Needs spending: ₹{float(budget.actual_needs):,.0f} (50% target: ₹{income*0.5:,.0f})
Wants spending: ₹{float(budget.actual_wants):,.0f} (30% target: ₹{income*0.3:,.0f})
Savings: ₹{income - float(budget.actual_expenses):,.0f} (20% target: ₹{income*0.2:,.0f})
Budget health score: {budget.health_score}/100

Return a JSON array of suggestion strings (no markdown). Example:
["Suggestion 1", "Suggestion 2", "Suggestion 3"]"""

    result = _safe_call(prompt, [])
    if isinstance(result, list):
        return result
    return ["Review your spending categories to better align with the 50/30/20 budget rule."]


def get_investment_recommendations(profile) -> dict:
    """Generate personalized investment recommendations."""
    profile_ctx = _build_profile_context(profile)
    risk = profile.risk_level if profile else 'moderate'

    prompt = f"""Generate investment recommendations for this user.

{profile_ctx}

Return JSON in this exact format:
{{
  "risk_level": "conservative|moderate|aggressive",
  "reasoning": "2-3 sentence explanation in simple terms",
  "allocation": [
    {{"category": "Category Name", "percentage": 40}},
    ...
  ],
  "categories": [
    {{
      "name": "Category Name",
      "icon": "emoji",
      "description": "Simple 1-2 sentence description",
      "risk": "Low|Medium|High",
      "allocation_pct": 40,
      "horizon": "1-3 years",
      "examples": ["Example 1", "Example 2"]
    }}
  ]
}}

For {risk} risk profile, suggest appropriate allocation across:
- Emergency Fund (FD/Liquid MF)
- Equity Index Funds (Nifty 50/Nifty 500)
- Gold ETF
- PPF/NPS (for moderate/conservative)
- US Equity (for aggressive)"""

    return _safe_call(prompt, {
        'risk_level': risk,
        'reasoning': 'Based on your profile, here is a balanced recommendation.',
        'allocation': [
            {'category': 'Emergency Fund', 'percentage': 30},
            {'category': 'Index Funds', 'percentage': 50},
            {'category': 'Gold ETF', 'percentage': 20},
        ],
        'categories': [],
    })


def get_stock_analysis(stock_data: dict, profile=None) -> dict:
    """Generate beginner-friendly AI analysis of a stock."""
    prompt = f"""Analyze this stock for a beginner investor and return JSON:

Stock: {stock_data.get('symbol')} — {stock_data.get('name')}
Current Price: ₹{stock_data.get('price', 0):,.2f}
52W High: {stock_data.get('week52_high', 'N/A')} | Low: {stock_data.get('week52_low', 'N/A')}
P/E Ratio: {stock_data.get('pe_ratio', 'N/A')}
Market Cap: {stock_data.get('market_cap', 'N/A')}
Beta: {stock_data.get('beta', 'N/A')}
1Y Return: {stock_data.get('return_1y', 'N/A')}%
Sector: {stock_data.get('sector', 'N/A')}

Return JSON:
{{
  "summary": "2-3 sentences: what the company does and current state",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "risk_level": "Low|Medium|High",
  "suitable_for": "Beginners|Intermediate|Advanced investors",
  "valuation": "Cheap|Fair|Expensive",
  "outlook": "Short positive/neutral/negative statement"
}}

Use simple language. No jargon."""

    return _safe_call(prompt, {
        'summary': f"{stock_data.get('name', 'This company')} is a listed company in the {stock_data.get('sector', 'market')} sector.",
        'key_points': ['Check the P/E ratio to understand valuation', 'Look at yearly trends', 'Consider your risk appetite'],
        'risk_level': stock_data.get('risk_level', 'Medium'),
        'suitable_for': 'Beginners',
        'valuation': 'Fair',
        'outlook': 'Always do your own research before investing.',
    })


def simulate_investment(monthly: float, years: int, rate: float) -> dict:
    """Simple compound interest simulation."""
    monthly_rate = rate / 100 / 12
    months = years * 12
    total = monthly * ((((1 + monthly_rate) ** months) - 1) / monthly_rate) * (1 + monthly_rate)
    invested = monthly * months
    profit = total - invested
    return {
        'monthly_investment': monthly,
        'years': years,
        'expected_rate': rate,
        'total_invested': round(invested, 2),
        'future_value': round(total, 2),
        'profit': round(profit, 2),
        'wealth_multiplier': round(total / invested, 2) if invested > 0 else 0,
    }
