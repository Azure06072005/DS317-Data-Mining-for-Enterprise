#!/usr/bin/env python3
"""
Generate courseData.ts from enhanced CSV
"""

import csv
import json

def main():
    input_file = 'course_resource_enhanced.csv'
    output_file = 'data/courseData.ts'
    
    # Read enhanced courses
    courses = []
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        courses = list(reader)
    
    # Generate TypeScript file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('// Course data from course_resource_enhanced.csv\n')
        f.write('import { CourseInfo } from "@/types/prediction";\n\n')
        f.write('export const coursesData: CourseInfo[] = [\n')
        
        for i, course in enumerate(courses):
            # Parse additional fields
            additional_fields = []
            if course['additional_fields']:
                additional_fields = [f.strip() for f in course['additional_fields'].split(',') if f.strip()]
            
            # Escape quotes in strings
            course_name = course['course_name'].replace('"', '\\"')
            description = course['description'].replace('"', '\\"')
            field = course['field'].replace('"', '\\"')
            
            # Format additional fields as JSON array
            additional_fields_json = json.dumps(additional_fields)
            
            f.write('  {\n')
            f.write(f'    courseId: "{course["course_id"]}",\n')
            f.write(f'    courseName: "{course_name}",\n')
            f.write(f'    description: "{description}",\n')
            f.write(f'    field: "{field}",\n')
            f.write(f'    additionalFields: {additional_fields_json},\n')
            f.write(f'    totalStudentsEnrolled: {course["total_students_enrolled"]},\n')
            f.write(f'    totalVideos: {course["total_videos"]},\n')
            f.write(f'    totalExercises: {course["total_exercises"]},\n')
            f.write(f'    numFields: {course["num_fields"]},\n')
            f.write(f'    isPrerequisites: {str(course["is_prerequisites"] == "1").lower()},\n')
            f.write('  }' + (',' if i < len(courses) - 1 else '') + '\n')
        
        f.write('];\n')
    
    print(f"✅ Generated courseData.ts with {len(courses)} courses")

if __name__ == '__main__':
    main()
