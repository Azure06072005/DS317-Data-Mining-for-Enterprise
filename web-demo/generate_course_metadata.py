"""Utilities for generating course metadata.

This module previously generated semi-random metadata for demo purposes.
For reproducibility (tests, CI, and deterministic demos), this version
removes all sources of randomness.

Rules implemented:
- course_name is set deterministically to: "Course <course_id>"
- field is derived deterministically from a stable hash of course_id
- description is derived deterministically from course_name and field
- numeric fields that exist in the input are preserved as-is
- num_fields is set deterministically to 1
- additional_fields is left empty (""), deterministically

NOTE: We intentionally use a stable hash (SHA-256) rather than Python's
built-in hash(), which is salted per-process and therefore non-deterministic.
"""

from __future__ import annotations

import hashlib
from typing import Any, Dict


def _stable_int_from_course_id(course_id: Any) -> int:
    """Return a stable non-negative integer derived from course_id."""
    # Normalize to a stable string representation.
    cid = "" if course_id is None else str(course_id)
    digest = hashlib.sha256(cid.encode("utf-8")).hexdigest()
    # Use a prefix of the digest to keep the integer small but stable.
    return int(digest[:12], 16)


def _deterministic_field(course_id: Any) -> str:
    """Return a deterministic field label derived from course_id."""
    # Keep a fixed palette so the value is human-friendly yet stable.
    fields = [
        "Analytics",
        "Artificial Intelligence",
        "Business",
        "Computer Science",
        "Data Engineering",
        "Data Mining",
        "Data Science",
        "Economics",
        "Finance",
        "Information Systems",
        "Machine Learning",
        "Statistics",
    ]
    n = _stable_int_from_course_id(course_id)
    return fields[n % len(fields)]


def generate_course_metadata(course: Dict[str, Any]) -> Dict[str, Any]:
    """Generate deterministic course metadata.

    The function accepts a course record (dict) and returns an updated dict.
    It preserves any existing numeric fields from the input record.

    Deterministic outputs:
      - course_name: "Course <course_id>"
      - field: stable hash-derived field label
      - description: derived from course_name + field
      - num_fields: 1
      - additional_fields: ""
    """

    # Work on a shallow copy to avoid mutating the caller's object.
    out: Dict[str, Any] = dict(course)

    course_id = out.get("course_id")
    course_name = f"Course {course_id}"
    field = _deterministic_field(course_id)

    out["course_name"] = course_name
    out["field"] = field
    out["description"] = f"{course_name} focuses on {field}."

    # Ensure deterministic handling of field counts.
    out["num_fields"] = 1
    out["additional_fields"] = ""

    return out
