import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os
import time

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def import_data(file_path):
    print(f"\n📂 Reading file: {file_path}")
    
    if file_path.endswith('.ods'):
        df = pd.read_excel(file_path, dtype=str, engine='odf')
    else:
        df = pd.read_excel(file_path, dtype=str)
    
    # Fix files where header row is not on row 1
    # Fix files where header row is not on row 1
    if 'MDDS STC' not in df.columns:
        print("   ⚠️  Header not found, assigning manually...")
        HEADERS = ['MDDS STC', 'STATE NAME', 'MDDS DTC', 'DISTRICT NAME', 
                   'MDDS Sub_DT', 'SUB-DISTRICT NAME', 'MDDS PLCN', 'Area Name']
        
        # Try with skiprows first
        found = False
        for skip in range(1, 10):
            if file_path.endswith('.ods'):
                df = pd.read_excel(file_path, dtype=str, engine='odf', skiprows=skip)
            else:
                df = pd.read_excel(file_path, dtype=str, skiprows=skip)
            if 'MDDS STC' in df.columns:
                print(f"   ✅ Found headers at row {skip+1}")
                found = True
                break
        
        # If still not found, assign headers manually
        if not found:
            print("   ⚠️  No headers found, reading raw data with manual headers...")
            if file_path.endswith('.ods'):
                df = pd.read_excel(file_path, dtype=str, engine='odf', 
                                 header=None, skiprows=3)
            else:
                df = pd.read_excel(file_path, dtype=str, 
                                 header=None, skiprows=3)
            df.columns = HEADERS
            print(f"   ✅ Assigned manual headers, {len(df)} rows")

        
    df = df.fillna('')
    print(f"✅ Loaded {len(df)} rows")

    conn = get_connection()
    cur = conn.cursor()

    try:
        # Country
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

        # States
        states = df[['MDDS STC', 'STATE NAME']].drop_duplicates()
        state_map = {}
        for _, row in states.iterrows():
            code = str(row['MDDS STC']).strip()
            name = str(row['STATE NAME']).strip()
            if not code or not name:
                continue
            cur.execute("""
                INSERT INTO "State" (code, name, "countryId", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
                ON CONFLICT (code) DO NOTHING
                RETURNING id
            """, (code, name, country_id))
            result = cur.fetchone()
            if result:
                state_map[code] = result[0]
            else:
                cur.execute('SELECT id FROM "State" WHERE code = %s', (code,))
                state_map[code] = cur.fetchone()[0]
        print(f"   ✅ {len(state_map)} states")

        # Districts
        districts = df[['MDDS STC', 'MDDS DTC', 'DISTRICT NAME']].drop_duplicates()
        district_map = {}
        for _, row in districts.iterrows():
            state_code = str(row['MDDS STC']).strip()
            code = str(row['MDDS DTC']).strip()
            name = str(row['DISTRICT NAME']).strip()
            if not code or not name:
                continue
            state_id = state_map.get(state_code)
            if not state_id:
                continue
            cur.execute("""
                INSERT INTO "District" (code, name, "stateId", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
                ON CONFLICT (code) DO NOTHING
                RETURNING id
            """, (code, name, state_id))
            result = cur.fetchone()
            if result:
                district_map[code] = result[0]
            else:
                cur.execute('SELECT id FROM "District" WHERE code = %s', (code,))
                district_map[code] = cur.fetchone()[0]
        print(f"   ✅ {len(district_map)} districts")

        # SubDistricts
        subdistricts = df[['MDDS DTC', 'MDDS Sub_DT', 'SUB-DISTRICT NAME']].drop_duplicates()
        subdistrict_map = {}
        for _, row in subdistricts.iterrows():
            district_code = str(row['MDDS DTC']).strip()
            code = str(row['MDDS Sub_DT']).strip()
            name = str(row['SUB-DISTRICT NAME']).strip()
            if not code or not name:
                continue
            district_id = district_map.get(district_code)
            if not district_id:
                continue
            cur.execute("""
                INSERT INTO "SubDistrict" (code, name, "districtId", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
                ON CONFLICT (code) DO NOTHING
                RETURNING id
            """, (code, name, district_id))
            result = cur.fetchone()
            if result:
                subdistrict_map[code] = result[0]
            else:
                cur.execute('SELECT id FROM "SubDistrict" WHERE code = %s', (code,))
                subdistrict_map[code] = cur.fetchone()[0]
        print(f"   ✅ {len(subdistrict_map)} sub-districts")

        # Villages — using execute_values (bulk insert, much faster!)
        print(f"   🏡 Inserting villages in bulk...")
        villages = df[['MDDS Sub_DT', 'MDDS PLCN', 'Area Name']].drop_duplicates()
        
        batch = []
        skipped = 0

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

        # Bulk insert all villages at once
        # Bulk insert all villages at once
        if batch:
            execute_values(cur, """
                INSERT INTO "Village" (code, name, "subDistrictId", "createdAt", "updatedAt")
                VALUES %s
                ON CONFLICT (code) DO NOTHING
            """, batch,
            template="(%s, %s, %s, NOW(), NOW())")

        conn.commit()
        print(f"   ✅ {len(batch)} villages inserted, {skipped} skipped")
        print(f"🎉 Import completed!")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise e
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    folder = r"E:\mdds"
    
    files = sorted([
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if f.endswith('.xls') or f.endswith('.xlsx') or f.endswith('.ods')
    ])

    print(f"📁 Found {len(files)} state files")

    start = time.time()
    success = 0
    failed = 0

    for file in files:
        try:
            import_data(file)
            success += 1
        except Exception as e:
            print(f"❌ Failed: {file} → {e}")
            failed += 1
            continue

    elapsed = time.time() - start
    print(f"\n📊 Summary:")
    print(f"   ✅ Success: {success} files")
    print(f"   ❌ Failed:  {failed} files")
    print(f"   ⏱️  Total time: {elapsed:.2f} seconds")