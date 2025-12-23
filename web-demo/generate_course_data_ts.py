#!/usr/bin/env python3
"""Generate web-demo/data/courseData.ts from course_resource_enhanced.csv.

- No randomness.
- Converts schools column (JSON string) -> string[]
- Converts additional_fields -> string[]
- Adds derived booleans isPopular/isMultiField and keeps level.
- Generates a deterministic description from real numeric signals.

CSV header expected (from your file):
course_id,course_name,field,additional_fields,level,is_popular,is_multi_field,total_students_enrolled,total_videos,total_exercises,num_fields,is_prerequisites,schools
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path


def to_int(x, default=0) -> int:
    try:
        s = "" if x is None else str(x).strip()
        if s == "":
            return default
        return int(float(s))
    except Exception:
        return default


def to_bool01(x) -> bool:
    return to_int(x, 0) == 1


def parse_csv_list(value: str) -> list[str]:
    """Parse comma separated list into array."""
    if value is None:
        return []
    s = str(value).strip()
    if not s:
        return []
    return [p.strip() for p in s.split(",") if p.strip()]


def parse_json_list(value: str) -> list[str]:
    """Parse JSON list stored as a string (robust for escaped CSV cases)."""
    if value is None:
        return []

    s = str(value).strip()
    if not s or s.lower() in {"[]", "null", "none"}:
        return []

    # Try JSON.parse up to 2 times (handles double-escaped strings)
    for _ in range(2):
        try:
            parsed = json.loads(s)
            if isinstance(parsed, list):
                return [
                    re.sub(r'^[\[\]\\"]+|[\[\]\\"]+$', '', str(x).strip())
                    for x in parsed
                    if str(x).strip()
                ]
            if isinstance(parsed, str):
                s = parsed.strip()
                continue
            break
        except Exception:
            break

    # Fallback: manual cleanup
    s = re.sub(r'^[\[\]\\"]+|[\[\]\\"]+$', '', s)
    s = s.replace('"', "").replace("'", "")
    if not s:
        return []

    return [p.strip() for p in s.split(",") if p.strip()]


def build_description(field: str,
                      level: str,
                      total_videos: int,
                      total_exercises: int,
                      is_multi: bool,
                      has_prereq: bool,
                      total_students: int) -> str:
    tags = []
    if is_multi:
        tags.append("multi-disciplinary")
    if has_prereq:
        tags.append("requires prerequisites")
    if total_students > 0:
        tags.append(f"{total_students:,} learners enrolled")

    tag_text = (" This course is " + ", ".join(tags) + ".") if tags else ""

    return (
        f"{level}-level course in {field}. "
        f"Resources include {total_videos} videos and {total_exercises} exercises."
        f"{tag_text}"
    )


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("`", "\\`")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True, help="Path to course_resource_enhanced.csv")
    ap.add_argument("--out", required=True, help="Output TS file, e.g. web-demo/data/courseData.ts")
    args = ap.parse_args()

    csv_path = Path(args.csv)
    out_path = Path(args.out)

    rows = []
    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            course_id = (r.get("course_id") or "").strip()
            if not course_id:
                continue

            field = (r.get("field") or "Unknown").strip() or "Unknown"
            course_name = (r.get("course_name") or course_id).strip() or course_id
            additional_fields = parse_csv_list(r.get("additional_fields") or "")

            level = (r.get("level") or "").strip() or "Unknown"
            is_popular = to_bool01(r.get("is_popular"))
            # If csv has is_multi_field use it, else infer from num_fields/additional_fields
            is_multi_field = to_bool01(r.get("is_multi_field"))

            total_students = to_int(r.get("total_students_enrolled"), 0)
            total_videos = to_int(r.get("total_videos"), 0)
            total_exercises = to_int(r.get("total_exercises"), 0)
            num_fields = to_int(r.get("num_fields"), 0)
            is_prereq = to_bool01(r.get("is_prerequisites"))

            schools = parse_json_list(r.get("schools") or "[]")

            # strengthen is_multi_field inference if csv missing/wrong
            if not is_multi_field:
                is_multi_field = (num_fields > 1) or (len(additional_fields) > 0)

            description = build_description(
                field=field,
                level=level,
                total_videos=total_videos,
                total_exercises=total_exercises,
                is_multi=is_multi_field,
                has_prereq=is_prereq,
                total_students=total_students,
            )

            rows.append(
                {
                    "courseId": course_id,
                    "courseName": course_name,
                    "description": description,
                    "field": field,
                    "additionalFields": additional_fields,
                    "level": level,
                    "isPopular": is_popular,
                    "isMultiField": is_multi_field,
                    "schools": schools,
                    "totalStudentsEnrolled": total_students,
                    "totalVideos": total_videos,
                    "totalExercises": total_exercises,
                    "numFields": num_fields,
                    "isPrerequisites": is_prereq,
                }
            )

    # Write TS
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with out_path.open("w", encoding="utf-8") as f:
        f.write("// Auto-generated from course_resource_enhanced.csv\n")
        f.write("// DO NOT EDIT MANUALLY\n\n")

        f.write("export type CourseLevel = 'Intro' | 'Intermediate' | 'Advanced' | 'Unknown' | string;\n\n")

        f.write("export interface CourseInfo {\n")
        f.write("  courseId: string;\n")
        f.write("  courseName: string;\n")
        f.write("  description: string;\n")
        f.write("  field: string;\n")
        f.write("  additionalFields: string[];\n")
        f.write("  level: CourseLevel;\n")
        f.write("  isPopular: boolean;\n")
        f.write("  isMultiField: boolean;\n")
        f.write("  schools: string[];\n")
        f.write("  totalStudentsEnrolled: number;\n")
        f.write("  totalVideos: number;\n")
        f.write("  totalExercises: number;\n")
        f.write("  numFields: number;\n")
        f.write("  isPrerequisites: boolean;\n")
        f.write("}\n\n")

        f.write("export const coursesData: CourseInfo[] = [\n")
        for r in rows:
            f.write("  {\n")
            f.write(f"    courseId: `{ts_escape(r['courseId'])}`,\n")
            f.write(f"    courseName: `{ts_escape(r['courseName'])}`,\n")
            f.write(f"    description: `{ts_escape(r['description'])}`,\n")
            f.write(f"    field: `{ts_escape(r['field'])}`,\n")
            # arrays
            af = ", ".join([f"`{ts_escape(x)}`" for x in r["additionalFields"]])
            sc = ", ".join([f"`{ts_escape(x)}`" for x in r["schools"]])
            f.write(f"    additionalFields: [{af}],\n")
            f.write(f"    level: `{ts_escape(r['level'])}`,\n")
            f.write(f"    isPopular: {str(bool(r['isPopular'])).lower()},\n")
            f.write(f"    isMultiField: {str(bool(r['isMultiField'])).lower()},\n")
            f.write(f"    schools: [{sc}],\n")
            f.write(f"    totalStudentsEnrolled: {int(r['totalStudentsEnrolled'])},\n")
            f.write(f"    totalVideos: {int(r['totalVideos'])},\n")
            f.write(f"    totalExercises: {int(r['totalExercises'])},\n")
            f.write(f"    numFields: {int(r['numFields'])},\n")
            f.write(f"    isPrerequisites: {str(bool(r['isPrerequisites'])).lower()},\n")
            f.write("  },\n")
        f.write("];\n")

    print(f"✅ Wrote {len(rows)} courses -> {out_path}")


if __name__ == "__main__":
    main()
