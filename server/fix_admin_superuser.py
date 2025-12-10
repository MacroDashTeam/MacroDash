#!/usr/bin/env python3
"""Fix admin user to be superuser in the database"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

print("\n=== Checking admin user ===\n")

# First check if admin user exists
cur.execute("""
    SELECT id, username, email, is_staff, is_superuser, is_active
    FROM auth_user
    WHERE email = 'admin@macrodash.com' OR username = 'admin'
""")

admin = cur.fetchone()

if admin:
    user_id, username, email, is_staff, is_superuser, is_active = admin
    print(f"Found admin user:")
    print(f"  ID: {user_id}")
    print(f"  Username: {username}")
    print(f"  Email: {email}")
    print(f"  is_staff: {is_staff}")
    print(f"  is_superuser: {is_superuser}")
    print(f"  is_active: {is_active}")
    print()

    if not is_superuser or not is_staff:
        print("Updating admin to be superuser...")
        cur.execute("""
            UPDATE auth_user
            SET is_superuser = true,
                is_staff = true,
                is_active = true
            WHERE id = %s
        """, (user_id,))
        conn.commit()
        print("✓ Admin user updated to superuser!")
    else:
        print("✓ Admin is already a superuser")
else:
    print("❌ Admin user not found in database!")
    print("\nSearching for all users with 'admin' in email or username:")
    cur.execute("""
        SELECT id, username, email, is_staff, is_superuser
        FROM auth_user
        WHERE email ILIKE '%admin%' OR username ILIKE '%admin%'
    """)
    users = cur.fetchall()
    if users:
        for u in users:
            print(f"  ID: {u[0]}, Username: {u[1]}, Email: {u[2]}")
    else:
        print("  No users found")

cur.close()
conn.close()
