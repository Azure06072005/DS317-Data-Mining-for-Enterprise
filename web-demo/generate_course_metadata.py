#!/usr/bin/env python3
"""
Generate enhanced course metadata WITHOUT random names.

Upgrade:
- Deterministic field assignment (stable hash of course_id)
- Deterministic course naming based on real resource signals:
  total_videos, total_exercises, num_fields, is_prerequisites, total_students_enrolled
- No noisy synthetic titles like "Topic 14"
"""

import csv
import hashlib
from typing import List, Dict


FIELDS = [
    "Computer Science",
    "Mathematics",
    "Business",
    "Data Science",
    "Engineering",
    "Psychology",
    "Physics",
    "Chemistry",
]


def to_int(x, default=0) -> int:
    try:
        if x is None:
            return default
        s = str(x).strip()
        if s == "":
            return default
        return int(float(s))
    except Exception:
        return default


def stable_hash_to_int(value: str) -> int:
    """Deterministic hash -> int."""
    return int(hashlib.md5(value.encode("utf-8")).hexdigest(), 16)


def assign_fields_deterministic(course_id: str, num_fields: int) -> List[str]:
    """Assign fields deterministically based on course_id."""
    if num_fields <= 0:
        num_fields = 1
    base = stable_hash_to_int(course_id) % len(FIELDS)
    k = min(num_fields, len(FIELDS))
    return [FIELDS[(base + i) % len(FIELDS)] for i in range(k)]


def infer_level(total_videos: int, total_exercises: int) -> str:
    """
    Heuristic level from resource volume (deterministic).
    Adjust thresholds if needed.
    """
    score = total_videos + 2 * total_exercises  # exercises weigh more

    if score <= 80:
        return "Intro"
    if score <= 220:
        return "Intermediate"
    return "Advanced"


def is_popular(total_students: int) -> bool:
    """
    Popularity tag (deterministic).
    Threshold chosen to be robust across datasets.
    """
    return total_students >= 30000


def build_course_name(field: str, level: str, multi: bool, prereq: bool, popular: bool) -> str:
    """
    Deterministic, meaningful title.
    """
    parts = [level, field]
    if multi:
        parts.append("Multi-disciplinary")
    if prereq:
        parts.append("With Prerequisites")
    if popular:
        parts.append("Popular")
    return " • ".join(parts)


def build_description(field: str, level: str, total_videos: int, total_exercises: int,
                      multi: bool, prereq: bool, total_students: int) -> str:
    """
    Deterministic description using real signals (no fake topics).
    """
    tags = []
    if multi:
        tags.append("multi-disciplinary")
    if prereq:
        tags.append("requires prerequisites")
    if total_students > 0:
        tags.append(f"{total_students:,} learners enrolled")

    tag_text = ""
    if tags:
        tag_text = " This course is " + ", ".join(tags) + "."

    return (
        f"{level}-level course in {field}. "
        f"Resources include {total_videos} videos and {total_exercises} exercises."
        f"{tag_text}"
    )


def main():
    input_file = r"D:\UIT Document\UIT subjects\DS317 - Phân tích dữ liệu trong doanh nghiệp\DS317-Data-Mining-for-Enterprise\web-demo\course_final_dt.csv"
    output_file = "course_resource_enhanced.csv"

    with open(input_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        courses = list(reader)

    enhanced = []

    for c in courses:
        course_id = str(c.get("course_id", "")).strip()
        if not course_id:
            continue

        num_fields = to_int(c.get("num_fields"), 1)
        total_videos = to_int(c.get("total_videos"), 0)
        total_exercises = to_int(c.get("total_exercises"), 0)
        total_students = to_int(c.get("total_students_enrolled"), 0)
        prereq = to_int(c.get("is_prerequisites"), 0) == 1

        fields = assign_fields_deterministic(course_id, num_fields)
        primary_field = fields[0] if fields else ""
        additional_fields = ",".join(fields[1:]) if len(fields) > 1 else ""

        multi = len(fields) > 1
        level = infer_level(total_videos, total_exercises)
        popular = is_popular(total_students)

        course_name = build_course_name(primary_field, level, multi, prereq, popular)
        description = build_description(
            primary_field, level, total_videos, total_exercises, multi, prereq, total_students
        )

        enhanced.append(
            {
                "course_id": course_id,
                "course_name": course_name,
                "description": description,
                "field": primary_field,
                "additional_fields": additional_fields,
                "total_students_enrolled": c.get("total_students_enrolled", ""),
                "total_videos": c.get("total_videos", ""),
                "total_exercises": c.get("total_exercises", ""),
                "num_fields": c.get("num_fields", ""),
                "is_prerequisites": c.get("is_prerequisites", ""),
                "level": level,
                "is_popular": int(popular),
                "is_multi_field": int(multi),
            }
        )

    fieldnames = [
        "course_id",
        "course_name",
        "description",
        "field",
        "additional_fields",
        "level",
        "is_popular",
        "is_multi_field",
        "total_students_enrolled",
        "total_videos",
        "total_exercises",
        "num_fields",
        "is_prerequisites",
    ]

    with open(output_file, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(enhanced)

    print(f"✅ Generated {len(enhanced)} enhanced course records (NO random)")
    print(f"📄 Output file: {output_file}")

    # quick stats
    dist = {}
    for r in enhanced:
        dist[r["field"]] = dist.get(r["field"], 0) + 1
    print("\n📊 Field Distribution (top):")
    for k, v in sorted(dist.items(), key=lambda x: x[1], reverse=True):
        print(f"   {k}: {v}")


if __name__ == "__main__":
    main()
