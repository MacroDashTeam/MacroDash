#!/usr/bin/env python3
"""Simple script to check users in the database"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("\n=== ALL USERS IN DATABASE ===\n")

cur.execute("""
    SELECT id, username, email, is_staff, is_superuser, is_active, date_joined
    FROM auth_user
    ORDER BY id
""")

rows = cur.fetchall()

for row in rows:
    user_id, username, email, is_staff, is_superuser, is_active, date_joined = row
    print(f"ID: {user_id}")
    print(f"  Username: {username}")
    print(f"  Email: {email}")
    print(f"  is_staff: {is_staff}")
    print(f"  is_superuser: {is_superuser}")
    print(f"  is_active: {is_active}")
    print(f"  date_joined: {date_joined}")
    print()

print(f"Total users: {len(rows)}")
superusers = [r for r in rows if r[4]]  # is_superuser is index 4
print(f"Superusers: {len(superusers)}")

cur.close()
conn.close()
