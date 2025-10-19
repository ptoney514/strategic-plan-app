#!/usr/bin/env python3
"""
Import goals and metrics from Excel files into the database.
This script reads the client's Excel files and creates the hierarchical goal structure.
"""

import os
import sys
from pathlib import Path
import openpyxl
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values
import uuid

# Database connection
DB_HOST = "127.0.0.1"
DB_PORT = "54322"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "postgres"

# Westside district ID
DISTRICT_ID = "a0000000-0000-0000-0000-000000000002"

# Excel files directory
EXCEL_DIR = Path(__file__).parent.parent / "public" / "excel-goals"

def connect_db():
    """Connect to PostgreSQL database."""
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

def clear_existing_westside_data(conn):
    """Clear existing Westside goals and metrics to start fresh."""
    with conn.cursor() as cur:
        print("Clearing existing Westside data...")
        cur.execute("DELETE FROM spb_metrics WHERE district_id = %s;", (DISTRICT_ID,))
        cur.execute("DELETE FROM spb_goals WHERE district_id = %s;", (DISTRICT_ID,))
        conn.commit()
        print(f"  Deleted metrics and goals for Westside")

def parse_excel_file(file_path):
    """Parse an Excel file and extract goals/metrics structure."""
    print(f"\nParsing {file_path.name}...")

    wb = openpyxl.load_workbook(file_path)
    sheet = wb.active

    # Extract objective name from filename
    objective_name = file_path.stem.replace("Pernell ", "").replace(" Strat Plan Update", "").replace("REVISED ", "")

    data = {
        'objective': objective_name,
        'goals': [],
        'strategies': [],
        'metrics': []
    }

    current_goal = None
    current_strategy = None

    # Skip header rows and iterate through data
    for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        if not any(row):  # Skip empty rows
            continue

        # Try to identify row type based on content
        first_cell = str(row[0]) if row[0] else ""

        # Goal rows typically have "Goal X" or start with a number
        if "Goal" in first_cell or (first_cell and first_cell[0].isdigit()):
            # This is a goal
            goal_text = row[1] if len(row) > 1 else first_cell
            if goal_text and isinstance(goal_text, str) and len(goal_text) > 5:
                current_goal = {
                    'title': goal_text.strip(),
                    'description': row[2] if len(row) > 2 and row[2] else None,
                    'strategies': []
                }
                data['goals'].append(current_goal)
                print(f"  Found Goal: {goal_text[:50]}...")

        # Strategy rows (sub-goals)
        elif current_goal and first_cell and len(first_cell) > 3:
            strategy_text = row[1] if len(row) > 1 else first_cell
            if strategy_text and isinstance(strategy_text, str) and len(strategy_text) > 5:
                current_strategy = {
                    'title': strategy_text.strip(),
                    'description': row[2] if len(row) > 2 and row[2] else None,
                    'metrics': []
                }
                current_goal['strategies'].append(current_strategy)
                print(f"    Found Strategy: {strategy_text[:50]}...")

        # Metric rows
        elif current_strategy:
            # Look for metric indicators in the row
            metric_text = None
            metric_type = 'numeric'

            # Check various columns for metric data
            for cell in row:
                if cell and isinstance(cell, str) and len(str(cell)) > 10:
                    if any(keyword in str(cell).lower() for keyword in ['metric', 'measure', 'indicator', 'target', '%', 'rate', 'score']):
                        metric_text = str(cell).strip()
                        break

            if metric_text:
                # Determine metric type
                if 'ratio' in metric_text.lower() or '/' in metric_text:
                    metric_type = 'ratio'
                elif any(qual in metric_text.lower() for qual in ['great', 'good', 'excellent', 'poor']):
                    metric_type = 'qualitative'
                elif '%' in metric_text or 'percent' in metric_text.lower():
                    metric_type = 'percentage'

                metric = {
                    'title': metric_text,
                    'type': metric_type,
                    'target_value': 100.0 if metric_type == 'percentage' else None
                }
                current_strategy['metrics'].append(metric)
                print(f"      Found Metric: {metric_text[:40]}...")

    return data

def insert_data(conn, data):
    """Insert parsed data into database."""
    with conn.cursor() as cur:
        objective_name = data['objective']
        print(f"\nInserting data for: {objective_name}")

        # Create the objective (level 0)
        objective_id = str(uuid.uuid4())
        objective_number = "1"  # We'll update numbering after all imports

        cur.execute("""
            INSERT INTO spb_goals (
                id, district_id, parent_id, goal_number, title, level,
                order_position, created_at, updated_at, status
            ) VALUES (%s, %s, NULL, %s, %s, 0, %s, NOW(), NOW(), 'on-target')
            RETURNING id
        """, (objective_id, DISTRICT_ID, objective_number, objective_name, 0))

        print(f"  Created Objective: {objective_name}")

        # Create goals (level 1)
        for goal_idx, goal in enumerate(data['goals'], start=1):
            goal_id = str(uuid.uuid4())
            goal_number = f"{objective_number}.{goal_idx}"

            cur.execute("""
                INSERT INTO spb_goals (
                    id, district_id, parent_id, goal_number, title, description, level,
                    order_position, created_at, updated_at, status
                ) VALUES (%s, %s, %s, %s, %s, %s, 1, %s, NOW(), NOW(), 'on-target')
                RETURNING id
            """, (goal_id, DISTRICT_ID, objective_id, goal_number, goal['title'],
                  goal.get('description'), goal_idx))

            print(f"    Created Goal {goal_number}: {goal['title'][:50]}...")

            # Create strategies (level 2)
            for strategy_idx, strategy in enumerate(goal['strategies'], start=1):
                strategy_id = str(uuid.uuid4())
                strategy_number = f"{goal_number}.{strategy_idx}"

                cur.execute("""
                    INSERT INTO spb_goals (
                        id, district_id, parent_id, goal_number, title, description, level,
                        order_position, created_at, updated_at, status
                    ) VALUES (%s, %s, %s, %s, %s, %s, 2, %s, NOW(), NOW(), 'on-target')
                    RETURNING id
                """, (strategy_id, DISTRICT_ID, goal_id, strategy_number, strategy['title'],
                      strategy.get('description'), strategy_idx))

                print(f"      Created Strategy {strategy_number}: {strategy['title'][:40]}...")

                # Create metrics
                for metric_idx, metric in enumerate(strategy['metrics'], start=1):
                    metric_id = str(uuid.uuid4())
                    metric_number = f"M{strategy_number}.{metric_idx}"

                    cur.execute("""
                        INSERT INTO spb_metrics (
                            id, district_id, goal_id, metric_number, title,
                            metric_calculation_type, target_value, baseline_value,
                            is_higher_better, created_at, updated_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE, NOW(), NOW())
                    """, (metric_id, DISTRICT_ID, strategy_id, metric_number, metric['title'],
                          metric['type'], metric.get('target_value'), 50.0))

                    print(f"        Created Metric {metric_number}: {metric['title'][:30]}...")

        conn.commit()

def main():
    """Main import function."""
    print("=" * 80)
    print("IMPORTING CLIENT EXCEL DATA INTO DATABASE")
    print("=" * 80)

    # Connect to database
    try:
        conn = connect_db()
        print("✓ Connected to database")
    except Exception as e:
        print(f"✗ Failed to connect to database: {e}")
        sys.exit(1)

    # Clear existing data
    clear_existing_westside_data(conn)

    # Find all Excel files
    excel_files = sorted(EXCEL_DIR.glob("*.xlsx"))

    if not excel_files:
        print(f"✗ No Excel files found in {EXCEL_DIR}")
        conn.close()
        sys.exit(1)

    print(f"\nFound {len(excel_files)} Excel files")

    # Parse and import each file
    for file_path in excel_files:
        try:
            data = parse_excel_file(file_path)
            insert_data(conn, data)
        except Exception as e:
            print(f"✗ Error processing {file_path.name}: {e}")
            import traceback
            traceback.print_exc()
            continue

    # Update goal numbering to be sequential
    print("\nUpdating goal numbering...")
    with conn.cursor() as cur:
        cur.execute("""
            WITH numbered_objectives AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
                FROM spb_goals
                WHERE district_id = %s AND level = 0
            )
            UPDATE spb_goals g
            SET goal_number = no.rn::text
            FROM numbered_objectives no
            WHERE g.id = no.id;
        """, (DISTRICT_ID,))
        conn.commit()

    # Trigger progress calculation
    print("\nRecalculating progress for all goals...")
    with conn.cursor() as cur:
        cur.execute("SELECT recalculate_district_progress(%s);", (DISTRICT_ID,))
        conn.commit()

    # Show summary
    print("\n" + "=" * 80)
    print("IMPORT SUMMARY")
    print("=" * 80)

    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM spb_goals WHERE district_id = %s AND level = 0;", (DISTRICT_ID,))
        objectives_count = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM spb_goals WHERE district_id = %s AND level = 1;", (DISTRICT_ID,))
        goals_count = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM spb_goals WHERE district_id = %s AND level = 2;", (DISTRICT_ID,))
        strategies_count = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM spb_metrics WHERE district_id = %s;", (DISTRICT_ID,))
        metrics_count = cur.fetchone()[0]

    print(f"Objectives (Level 0): {objectives_count}")
    print(f"Goals (Level 1):      {goals_count}")
    print(f"Strategies (Level 2): {strategies_count}")
    print(f"Metrics:              {metrics_count}")
    print("=" * 80)
    print("✓ Import completed successfully!")

    conn.close()

if __name__ == "__main__":
    main()
