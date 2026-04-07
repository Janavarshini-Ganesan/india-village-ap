import pandas as pd
import psycopg2
from dotenv import load_dotenv
import os
import time

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL')

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def import_data(file_path):
    print(f"\n📂 Reading file: {file_path}")
    
    # Read Excel file
    df = pd.read_excel(file_path, dtype=str)
    df = df.fillna('')
    
    print(f"✅ Loaded {len(df)} rows")
    print(f"📋 Columns: {list(df.columns)}")
    
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        # Step 1: Insert Country (India)
        print("\n🌍 Inserting Country...")
        cur.execute("""
            INSERT INTO "Country" (name, code, "createdAt", "updatedAt")
            VALUES ('India', 'IN', NOW(), NOW())
            ON CONFLICT (code) DO NOTHING
            RETURNING id
        """)
        result = cur.fetchone()
        if result:
            country_id = result[0]
        else:
            cur.execute('SELECT id FROM "Country" WHERE code = %s', ('IN',))
            country_id = cur.fetchone()[0]
        print(f"   Country ID: {country_id}")

        # Step 2: Insert States
        print("\n🗺️  Inserting States...")
        states = df[['MDDS STC', 'STATE NAME']].drop_duplicates()
        state_map = {}
        
        for _, row in states.iterrows():
            state_code = str(row['MDDS STC']).strip()
            state_name = str(row['STATE NAME']).strip()
            if not state_code or not state_name:
                continue
            cur.execute("""
                INSERT INTO "State" (code, name, "countryId", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
                ON CONFLICT (code) DO NOTHING
                RETURNING id
            """, (state_code, state_name, country_id))
            result = cur.fetchone()
            if result:
                state_map[state_code] = result[0]
            else:
                cur.execute('SELECT id FROM "State" WHERE code = %s', (state_code,))
                state_map[state_code] = cur.fetchone()[0]
        
        print(f"   ✅ {len(state_map)} states inserted")

        # Step 3: Insert Districts
        print("\n🏙️  Inserting Districts...")
        districts = df[['MDDS STC', 'MDDS DTC', 'DISTRICT NAME']].drop_duplicates()
        district_map = {}
        
        for _, row in districts.iterrows():
            state_code = str(row['MDDS STC']).strip()
            district_code = str(row['MDDS DTC']).strip()
            district_name = str(row['DISTRICT NAME']).strip()
            if not district_code or not district_name:
                continue
            state_id = state_map.get(state_code)
            if not state_id:
                continue
            cur.execute("""
                INSERT INTO "District" (code, name, "stateId", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
                ON CONFLICT (code) DO NOTHING
                RETURNING id
            """, (district_code, district_name, state_id))
            result = cur.fetchone()
            if result:
                district_map[district_code] = result[0]
            else:
                cur.execute('SELECT id FROM "District" WHERE code = %s', (district_code,))
                district_map[district_code] = cur.fetchone()[0]
        
        print(f"   ✅ {len(district_map)} districts inserted")

        # Step 4: Insert SubDistricts
        print("\n🏘️  Inserting Sub-Districts...")
        subdistricts = df[['MDDS DTC', 'MDDS Sub_DT', 'SUB-DISTRICT NAME']].drop_duplicates()
        subdistrict_map = {}
        
        for _, row in subdistricts.iterrows():
            district_code = str(row['MDDS DTC']).strip()
            subdistrict_code = str(row['MDDS Sub_DT']).strip()
            subdistrict_name = str(row['SUB-DISTRICT NAME']).strip()
            if not subdistrict_code or not subdistrict_name:
                continue
            district_id = district_map.get(district_code)
            if not district_id:
                continue
            cur.execute("""
                INSERT INTO "SubDistrict" (code, name, "districtId", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
                ON CONFLICT (code) DO NOTHING
                RETURNING id
            """, (subdistrict_code, subdistrict_name, district_id))
            result = cur.fetchone()
            if result:
                subdistrict_map[subdistrict_code] = result[0]
            else:
                cur.execute('SELECT id FROM "SubDistrict" WHERE code = %s', (subdistrict_code,))
                subdistrict_map[subdistrict_code] = cur.fetchone()[0]
        
        print(f"   ✅ {len(subdistrict_map)} sub-districts inserted")

        # Step 5: Insert Villages in batches
        print("\n🏡 Inserting Villages...")
        villages = df[['MDDS Sub_DT', 'MDDS PLCN', 'Area Name']].drop_duplicates()
        total = len(villages)
        inserted = 0
        skipped = 0
        batch_size = 500
        batch = []

        for _, row in villages.iterrows():
            subdistrict_code = str(row['MDDS Sub_DT']).strip()
            village_code = str(row['MDDS PLCN']).strip()
            village_name = str(row['Area Name']).strip()
            
            if not village_code or not village_name:
                skipped += 1
                continue
            
            subdistrict_id = subdistrict_map.get(subdistrict_code)
            if not subdistrict_id:
                skipped += 1
                continue
            
            batch.append((village_code, village_name, subdistrict_id))
            
            if len(batch) >= batch_size:
                for item in batch:
                    cur.execute("""
                        INSERT INTO "Village" (code, name, "subDistrictId", "createdAt", "updatedAt")
                        VALUES (%s, %s, %s, NOW(), NOW())
                        ON CONFLICT (code) DO NOTHING
                    """, item)
                inserted += len(batch)
                batch = []
                print(f"   Progress: {inserted}/{total} villages inserted...")

        # Insert remaining batch
        if batch:
            for item in batch:
                cur.execute("""
                    INSERT INTO "Village" (code, name, "subDistrictId", "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, NOW(), NOW())
                    ON CONFLICT (code) DO NOTHING
                """, item)
            inserted += len(batch)

        print(f"   ✅ {inserted} villages inserted, {skipped} skipped")

        # Commit all changes
        conn.commit()
        print("\n🎉 Import completed successfully!")

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Error: {e}")
        raise e
    finally:
        cur.close()
        conn.close()

# Run the import
if __name__ == "__main__":
    # Add your file paths here
    files = [
        r"E:\mdds\mh.xls",
        r"E:\mdds\tn.xls",
        r"E:\mdds\dl.xls",
    ]
    
    start = time.time()
    for file in files:
        if os.path.exists(file):
            import_data(file)
        else:
            print(f"⚠️  File not found: {file}")
    
    elapsed = time.time() - start
    print(f"\n⏱️  Total time: {elapsed:.2f} seconds")