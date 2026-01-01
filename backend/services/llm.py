import httpx
from typing import Optional, Dict, Any
from config import settings

class MinimaxService:
    """Service for Minimax LLM API integration"""
    
    def __init__(self):
        self.api_key = settings.MINIMAX_API_KEY
        self.base_url = "https://api.minimax.chat/v1"
        self.model = "abab5.5-chat"  # Default model
        
    async def _make_request(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> Dict[str, Any]:
        """Make request to Minimax API"""
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/text/chatcompletion_v2",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def categorize_transaction(
        self,
        description: str,
        amount: float
    ) -> str:
        """
        Auto-categorize transaction from description
        Returns: category name
        """
        system_prompt = """You are a financial categorization assistant. 
        Categorize transactions into one of these categories:
        - Food & Dining
        - Entertainment
        - Shopping
        - Transport
        - Bills & Utilities
        - Health & Fitness
        - Other
        
        Return ONLY the category name, nothing else."""
        
        prompt = f"Categorize this transaction: '{description}' (${amount})"
        
        try:
            result = await self._make_request(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=20
            )
            
            # Extract category from response
            category = result.get("choices", [{}])[0].get("message", {}).get("content", "Other").strip()
            
            # Validate category
            valid_categories = [
                "Food & Dining", "Entertainment", "Shopping", 
                "Transport", "Bills & Utilities", "Health & Fitness", "Other"
            ]
            
            if category not in valid_categories:
                category = "Other"
            
            return category
        except Exception as e:
            print(f"Error categorizing transaction: {e}")
            return "Other"
    
    async def analyze_spending_pattern(
        self,
        spending_data: Dict[str, Any]
    ) -> str:
        """
        Analyze spending patterns and provide insights
        Returns: insight text
        """
        system_prompt = """You are a personal finance advisor. 
        Analyze spending patterns and provide brief, actionable insights.
        Keep your response under 100 words. Focus on specific patterns and suggestions."""
        
        prompt = f"""Analyze this spending data:
        - Total spent this month: ${spending_data.get('total_spent', 0):.2f}
        - Budget: ${spending_data.get('budget', 0):.2f}
        - Top category: {spending_data.get('top_category', 'N/A')} (${spending_data.get('top_category_amount', 0):.2f})
        - Impulse purchases: {spending_data.get('impulse_count', 0)} (${spending_data.get('impulse_total', 0):.2f})
        - Current streak: {spending_data.get('streak', 0)} days
        
        Provide 2-3 specific insights and suggestions."""
        
        try:
            result = await self._make_request(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=200
            )
            
            insight = result.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return insight
        except Exception as e:
            print(f"Error analyzing spending: {e}")
            return "Unable to generate insights at this time."
    
    async def analyze_reflection(
        self,
        reflection_text: str,
        regret_purchase: bool
    ) -> Dict[str, Any]:
        """
        Analyze daily reflection for emotional triggers
        Returns: {triggers: [...], suggestions: [...]}
        """
        system_prompt = """You are a behavioral finance psychologist.
        Analyze reflections to identify emotional triggers and spending patterns.
        Return insights in this format:
        Triggers: [trigger1, trigger2]
        Suggestions: [suggestion1, suggestion2]"""
        
        emotion = "regret" if regret_purchase else "satisfaction"
        prompt = f"Analyze this reflection (feeling {emotion}): '{reflection_text}'"
        
        try:
            result = await self._make_request(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=300
            )
            
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Parse response (simple parsing, can be improved)
            triggers = []
            suggestions = []
            
            lines = content.split("\n")
            current_section = None
            
            for line in lines:
                line = line.strip()
                if "Triggers:" in line:
                    current_section = "triggers"
                elif "Suggestions:" in line:
                    current_section = "suggestions"
                elif line and line.startswith("-"):
                    item = line[1:].strip()
                    if current_section == "triggers":
                        triggers.append(item)
                    elif current_section == "suggestions":
                        suggestions.append(item)
            
            return {
                "triggers": triggers,
                "suggestions": suggestions
            }
        except Exception as e:
            print(f"Error analyzing reflection: {e}")
            return {
                "triggers": [],
                "suggestions": ["Take time to reflect on your spending habits."]
            }
    
    async def generate_impulse_question(
        self,
        item_name: str,
        price: float
    ) -> str:
        """
        Generate a thoughtful question for impulse check
        Returns: question text
        """
        system_prompt = """You are a mindful spending coach.
        Generate ONE brief, thought-provoking question to help someone pause before an impulse purchase.
        The question should make them consider if they really need the item.
        Keep it under 20 words."""
        
        prompt = f"Generate a reflection question for buying '{item_name}' at ${price:.2f}"
        
        try:
            result = await self._make_request(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.8,
                max_tokens=50
            )
            
            question = result.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return question
        except Exception as e:
            print(f"Error generating question: {e}")
            return "Do you really need this right now?"

# Singleton instance
minimax_service = MinimaxService()
