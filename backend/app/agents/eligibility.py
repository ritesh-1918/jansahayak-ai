import json
import logging
from pathlib import Path
from typing import List, Optional

from app.models.schemas import UserProfile, SchemeMatch

logger = logging.getLogger(__name__)

SCHEMES_PATH = Path(__file__).parent.parent / "data" / "schemes.json"

# Occupation keyword normalisation map
OCCUPATION_KEYWORDS = {
    "farmer": ["farmer", "farming", "kisan", "agriculture", "cultivat", "crop", "kisaan", "fasal", "kheti", "khet"],
    "student": ["student", "study", "school", "college", "padh", "padhna"],
    "worker": ["worker", "labour", "labor", "mazdoor", "kaam", "majdoor", "daily wage"],
    "self-employed": ["self", "shop", "business", "vyapar", "dukan", "trader", "artisan", "karigar"],
    "unemployed": ["unemploy", "no job", "naukri nahi", "jobless", "berozgar"],
}


def _normalise_occupation(raw: Optional[str]) -> str:
    if not raw:
        return ""
    raw_lower = raw.lower()
    for canonical, keywords in OCCUPATION_KEYWORDS.items():
        if any(kw in raw_lower for kw in keywords):
            return canonical
    return raw_lower


def _occupation_matches(scheme_occupations: list, user_occupation: str) -> bool:
    if not scheme_occupations or "any" in scheme_occupations:
        return True
    norm = _normalise_occupation(user_occupation)
    for occ in scheme_occupations:
        if occ == "any":
            return True
        if occ in norm or norm in occ:
            return True
        # Check keyword map
        for canonical, keywords in OCCUPATION_KEYWORDS.items():
            if occ == canonical and any(kw in norm for kw in keywords):
                return True
    return False


class EligibilityEngine:
    def __init__(self):
        self.schemes = self._load_schemes()
        logger.info(f"Loaded {len(self.schemes)} schemes from schemes.json")

    def _load_schemes(self) -> list:
        try:
            with open(SCHEMES_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load schemes.json: {e}")
            return []

    def match_schemes(self, profile: UserProfile) -> List[SchemeMatch]:
        matches = []
        for scheme in self.schemes:
            result = self._check_scheme(profile, scheme)
            if result is not None:
                matches.append(result)
        # Sort by confidence descending
        matches.sort(key=lambda x: x.confidence, reverse=True)
        return matches

    def _check_scheme(self, profile: UserProfile, scheme: dict) -> Optional[SchemeMatch]:
        eligibility = scheme.get("eligibility", {})
        reasons = []
        penalties = 0.0

        # --- Age check ---
        min_age = eligibility.get("min_age")
        max_age = eligibility.get("max_age")
        if profile.age is not None:
            if min_age is not None and profile.age < min_age:
                return None  # hard fail
            if max_age is not None and profile.age > max_age:
                return None  # hard fail
            if min_age is not None:
                reasons.append(f"Age {profile.age} meets minimum age requirement of {min_age}")

        # --- Income check ---
        max_income = eligibility.get("max_income_annual")
        if max_income is not None and profile.annual_income is not None:
            if profile.annual_income > max_income:
                return None  # hard fail
            reasons.append(f"Annual income ₹{int(profile.annual_income):,} is within limit of ₹{int(max_income):,}")

        # --- Occupation check ---
        scheme_occupations = eligibility.get("occupation", ["any"])
        if scheme_occupations and "any" not in scheme_occupations:
            if profile.occupation:
                if not _occupation_matches(scheme_occupations, profile.occupation):
                    return None  # hard fail
                reasons.append(f"Occupation '{profile.occupation}' qualifies for this scheme")
            else:
                penalties += 0.15  # unknown occupation — soft penalty

        # --- Gender check ---
        scheme_gender = eligibility.get("gender", "any")
        if scheme_gender and scheme_gender != "any":
            if profile.gender and profile.gender.lower() not in [scheme_gender, "any"]:
                return None  # hard fail
            elif not profile.gender:
                penalties += 0.1

        # --- Location type ---
        scheme_location = eligibility.get("location_type", "any")
        if scheme_location and scheme_location != "any":
            if profile.location_type and profile.location_type.lower() != scheme_location:
                penalties += 0.2  # soft — rural/urban mismatch
            elif profile.location_type and profile.location_type.lower() == scheme_location:
                reasons.append(f"Location type '{profile.location_type}' matches scheme requirement")

        # --- Land requirement ---
        if eligibility.get("requires_land"):
            if profile.has_land is False:
                return None  # hard fail
            if profile.has_land is True:
                reasons.append(f"Owns {profile.land_acres or '?'} acres of agricultural land")
            else:
                penalties += 0.2  # unknown land status

        # --- Girl child ---
        if eligibility.get("account_for") == "girl_child":
            if profile.has_girl_child is False:
                return None
            if profile.has_girl_child is True:
                reasons.append(f"Has a girl child (age {profile.girl_child_age or 'unknown'})")
            else:
                penalties += 0.25

        # --- APY: not income tax payer ---
        if eligibility.get("not_income_tax_payer"):
            if profile.annual_income and profile.annual_income > 500000:
                penalties += 0.3

        # Compute confidence
        confidence = max(0.45, 1.0 - penalties)

        # If no reasons at all, add a generic one
        if not reasons:
            reasons.append("Basic eligibility criteria met based on provided profile")

        why_eligible = "; ".join(reasons) if reasons else "Meets general eligibility criteria"

        return SchemeMatch(
            scheme_id=scheme["id"],
            name=scheme["name"],
            benefit=scheme["benefit"],
            why_eligible=why_eligible,
            confidence=round(confidence, 2),
            documents_needed=scheme.get("documents_required", []),
            apply_url=scheme.get("apply_url", "#"),
        )


# Singleton
eligibility_engine = EligibilityEngine()
