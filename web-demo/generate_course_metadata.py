#!/usr/bin/env python3
"""
Generate enhanced course metadata with course names and fields based on existing course_resource.csv
Uses deterministic assignment based on course_id to ensure stable output across runs.
"""

import csv
import hashlib

# Define field categories and their course name templates
FIELD_TEMPLATES = {
    "Computer Science": [
        "Introduction to Programming",
        "Data Structures and Algorithms",
        "Web Development Fundamentals",
        "Database Management Systems",
        "Software Engineering Principles",
        "Machine Learning Basics",
        "Artificial Intelligence",
        "Computer Networks",
        "Operating Systems",
        "Cybersecurity Fundamentals",
        "Cloud Computing",
        "Mobile App Development",
        "DevOps and CI/CD",
        "Blockchain Technology",
        "Computer Graphics",
    ],
    "Mathematics": [
        "Linear Algebra",
        "Calculus I",
        "Calculus II",
        "Discrete Mathematics",
        "Probability and Statistics",
        "Differential Equations",
        "Applied Mathematics",
        "Numerical Methods",
        "Mathematical Optimization",
        "Number Theory",
        "Graph Theory",
        "Combinatorics",
    ],
    "Business": [
        "Business Management",
        "Marketing Fundamentals",
        "Financial Accounting",
        "Business Analytics",
        "Entrepreneurship",
        "Strategic Management",
        "Human Resource Management",
        "Supply Chain Management",
        "Digital Marketing",
        "Project Management",
        "Business Law",
        "Economics Principles",
    ],
    "Data Science": [
        "Introduction to Data Science",
        "Big Data Analytics",
        "Statistical Learning",
        "Data Visualization",
        "Python for Data Science",
        "R Programming",
        "Deep Learning",
        "Natural Language Processing",
        "Time Series Analysis",
        "Data Mining",
        "Predictive Analytics",
    ],
    "Engineering": [
        "Engineering Mathematics",
        "Circuit Analysis",
        "Mechanics",
        "Thermodynamics",
        "Materials Science",
        "Control Systems",
        "Signal Processing",
        "Embedded Systems",
        "Robotics",
        "Renewable Energy",
    ],
    "Psychology": [
        "Introduction to Psychology",
        "Cognitive Psychology",
        "Social Psychology",
        "Developmental Psychology",
        "Behavioral Psychology",
        "Educational Psychology",
        "Clinical Psychology",
        "Research Methods in Psychology",
    ],
    "Physics": [
        "Classical Mechanics",
        "Electromagnetism",
        "Quantum Mechanics",
        "Thermodynamics and Statistical Physics",
        "Modern Physics",
        "Optics",
        "Astrophysics",
    ],
    "Chemistry": [
        "General Chemistry",
        "Organic Chemistry",
        "Inorganic Chemistry",
        "Physical Chemistry",
        "Analytical Chemistry",
        "Biochemistry",
    ],
}

# Generate course descriptions
def generate_course_name(field, course_id):
    """Generate a deterministic course name based on field and course_id"""
    templates = FIELD_TEMPLATES.get(field, ["Course"])
    
    # Use course_id hash to deterministically select a template
    hash_value = int(hashlib.md5(course_id.encode()).hexdigest(), 16)
    template_index = hash_value % len(templates)
    base_name = templates[template_index]
    
    # Deterministically add level indicators based on hash
    if (hash_value % 10) < 3:  # 30% of courses get a level
        levels = ["Beginner", "Intermediate", "Advanced"]
        level = levels[hash_value % 3]
        return f"{base_name} - {level}"
    
    return base_name

def generate_description(course_name, field, course_id):
    """Generate a deterministic course description"""
    templates = [
        f"Comprehensive introduction to {course_name.lower()} in {field}",
        f"Master the fundamentals of {course_name.lower()} with hands-on projects",
        f"Advanced {course_name.lower()} course covering key concepts in {field}",
        f"Learn {course_name.lower()} through practical examples and case studies",
        f"Deep dive into {course_name.lower()} with real-world applications",
    ]
    # Use course_id hash to deterministically select a description template
    hash_value = int(hashlib.md5(course_id.encode()).hexdigest(), 16)
    return templates[hash_value % len(templates)]

def assign_fields(num_fields, course_id):
    """Assign fields deterministically based on num_fields count and course_id"""
    all_fields = list(FIELD_TEMPLATES.keys())
    hash_value = int(hashlib.md5(course_id.encode()).hexdigest(), 16)
    
    if num_fields == 0:
        # Assign one field deterministically
        return [all_fields[hash_value % len(all_fields)]]
    elif num_fields == 1:
        return [all_fields[hash_value % len(all_fields)]]
    else:
        # Multiple fields - pick deterministically based on hash
        # Use different parts of hash for different field selections
        selected_fields = []
        for i in range(min(num_fields, len(all_fields))):
            # Generate unique index for each field selection
            field_hash = int(hashlib.md5(f"{course_id}_{i}".encode()).hexdigest(), 16)
            field_idx = field_hash % len(all_fields)
            field = all_fields[field_idx]
            # Avoid duplicates
            if field not in selected_fields:
                selected_fields.append(field)
            else:
                # Find next available field
                for j in range(len(all_fields)):
                    alt_field = all_fields[(field_idx + j) % len(all_fields)]
                    if alt_field not in selected_fields:
                        selected_fields.append(alt_field)
                        break
        return selected_fields

def main():
    input_file = 'course_resource.csv'
    output_file = 'course_resource_enhanced.csv'
    
    # Read existing courses
    courses = []
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        courses = list(reader)
    
    # Enhance courses
    enhanced_courses = []
    for course in courses:
        course_id = course['course_id']
        num_fields_val = int(course['num_fields'])
        
        # Assign fields deterministically
        fields = assign_fields(num_fields_val, course_id)
        primary_field = fields[0]
        
        # Generate course name deterministically
        course_name = generate_course_name(primary_field, course_id)
        
        # Generate description deterministically
        description = generate_description(course_name, primary_field, course_id)
        
        # Create enhanced record
        enhanced_course = {
            'course_id': course_id,
            'course_name': course_name,
            'description': description,
            'field': primary_field,
            'additional_fields': ','.join(fields[1:]) if len(fields) > 1 else '',
            'total_students_enrolled': course['total_students_enrolled'],
            'total_videos': course['total_videos'],
            'total_exercises': course['total_exercises'],
            'num_fields': course['num_fields'],
            'is_prerequisites': course['is_prerequisites'],
        }
        enhanced_courses.append(enhanced_course)
    
    # Write enhanced courses
    fieldnames = [
        'course_id', 'course_name', 'description', 'field', 'additional_fields',
        'total_students_enrolled', 'total_videos', 'total_exercises', 
        'num_fields', 'is_prerequisites'
    ]
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(enhanced_courses)
    
    print(f"✅ Generated {len(enhanced_courses)} enhanced course records")
    print(f"📄 Output file: {output_file}")
    
    # Print field distribution
    print("\n📊 Field Distribution:")
    field_dist = {}
    for course in enhanced_courses:
        field = course['field']
        field_dist[field] = field_dist.get(field, 0) + 1
    
    for field, count in sorted(field_dist.items(), key=lambda x: x[1], reverse=True):
        print(f"   {field}: {count} courses")

if __name__ == '__main__':
    main()
