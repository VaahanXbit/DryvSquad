import json
import re
from db.mongodb import db
from llm.llm_service import generate

def clean_int(val_str) -> int:
    if not val_str:
        return 0
    try:
        digits = re.findall(r'\d+', str(val_str).replace(',', ''))
        return int(digits[0]) if digits else 0
    except:
        return 0

def clean_float(val_str) -> float:
    if not val_str:
        return 0.0
    try:
        digits = re.findall(r'\d+\.\d+|\d+', str(val_str))
        return float(digits[0]) if digits else 0.0
    except:
        return 0.0

def get_all_cars_data() -> list:
    try:
        brands = list(db["brands"].find({}))
        models = list(db["models"].find({}))
        variants = list(db["variants"].find({}))
        
        brand_map = {str(b["_id"]): b.get("name", "Unknown") for b in brands}
        
        model_map = {}
        for m in models:
            brand_id_str = str(m["brandId"]) if "brandId" in m else ""
            brand_name = brand_map.get(brand_id_str, "Unknown")
            model_map[str(m["_id"])] = {
                "id": str(m["_id"]),
                "brand": brand_name,
                "name": m.get("name", ""),
                "slug": m.get("slug", ""),
                "image": m.get("image", ""),
                "variants": []
            }
            
        for v in variants:
            model_id_str = str(v["modelId"]) if "modelId" in v else ""
            if model_id_str in model_map:
                specs = v.get("specifications", {}) or {}
                model_map[model_id_str]["variants"].append({
                    "name": v.get("name", ""),
                    "price": v.get("price", ""),
                    "exShowroomPrice": v.get("exShowroomPrice", 0),
                    "engine": v.get("engine", ""),
                    "power": v.get("power", ""),
                    "mileage": v.get("mileage", ""),
                    "fuelType": specs.get("fuelType", specs.get("FuelType", "")),
                    "transmission": specs.get("transmissionType", specs.get("transmission", "")),
                    "seatingCapacity": specs.get("seats", specs.get("seatingCapacity", "")),
                    "safetyRating": specs.get("gncapRating", specs.get("safetyRating", "")),
                    "groundClearance": specs.get("groundClearance", ""),
                    "bootSpace": specs.get("bootSpace", ""),
                    "turningRadius": specs.get("turningRadius", ""),
                    "driveType": specs.get("driveType", ""),
                    "category": specs.get("category", ""),
                    "hillAssist": specs.get("hillAssist", False),
                })
                
        return list(model_map.values())
    except Exception as e:
        print(f"[ERROR] Failed to fetch cars data from db: {e}")
        return []

def parse_budget_range(budget_str: str) -> tuple:
    b = budget_str.lower().strip()
    if "< 10l" in b or "under" in b or "10l" == b:
        return 0, 1000000
    elif "10-15l" in b:
        return 1000000, 1500000
    elif "15-20l" in b:
        return 1500000, 2000000
    else:
        return 2000000, 9990000000

def find_matching_cars(budget: str, seating: str, usage: str, terrain: str, driver: str, custom_query: str = "") -> dict:
    import traceback
    
    print(f"\n==================================================")
    print(f"[AI CAR MATCHMAKER] New Search Request Received")
    print(f"   Budget: {budget}")
    print(f"   Seating: {seating}")
    print(f"   Usage: {usage}")
    print(f"   Terrain: {terrain}")
    print(f"   Driver: {driver}")
    print(f"   Custom Query: {custom_query}")
    print(f"==================================================")
    
    cars = get_all_cars_data()
    if not cars:
        print("[DATABASE ERROR] No cars retrieved from the database!")
        return {"success": False, "recommendations": []}
        
    min_price, max_price = parse_budget_range(budget)
    
    scored_cars = []
    for c in cars:
        has_matching_variant = False
        for v in c["variants"]:
            price_val = v.get("exShowroomPrice", 0)
            if not price_val and v.get("price"):
                price_val = clean_int(v["price"])
            if price_val and min_price <= price_val <= max_price:
                has_matching_variant = True
                break
                
        if not has_matching_variant:
            continue
            
        points = 100
        
        # Extract specifications across variants for scoring
        variant_seats = [clean_int(v["seatingCapacity"]) for v in c["variants"] if v.get("seatingCapacity")]
        variant_transmissions = [str(v.get("transmission")).lower() for v in c["variants"] if v.get("transmission")]
        variant_fuels = [str(v.get("fuelType")).lower() for v in c["variants"] if v.get("fuelType")]
        variant_clearances = [clean_int(v["groundClearance"]) for v in c["variants"] if v.get("groundClearance")]
        variant_boot = [clean_int(v["bootSpace"]) for v in c["variants"] if v.get("bootSpace")]
        variant_radius = [clean_float(v["turningRadius"]) for v in c["variants"] if v.get("turningRadius")]
        variant_categories = [str(v.get("category")).lower() for v in c["variants"] if v.get("category")]
        variant_drives = [str(v.get("driveType")).lower() for v in c["variants"] if v.get("driveType")]
        variant_hills = [v.get("hillAssist") for v in c["variants"] if v.get("hillAssist") is not None]

        # 1. Seating Capacity Scoring
        seat_sel = seating.lower()
        if "7" in seat_sel:
            if any(s >= 7 for s in variant_seats):
                points += 50
            else:
                points -= 30
        elif "5" in seat_sel:
            if any(s >= 5 for s in variant_seats):
                points += 50
        else:
            points += 50
            
        # 2. Primary Usage Scoring
        usage_sel = usage.lower()
        if "city" in usage_sel:
            if any("auto" in t or "amt" in t or "dct" in t or "cvt" in t for t in variant_transmissions):
                points += 25
            if any("electric" in f or "cng" in f or "petrol" in f for f in variant_fuels):
                points += 15
        elif "highway" in usage_sel:
            if any("diesel" in f or "hybrid" in f for f in variant_fuels):
                points += 30
        elif "weekend" in usage_sel:
            if any(b >= 350 for b in variant_boot):
                points += 25
        elif "adventure" in usage_sel:
            if any("suv" in cat for cat in variant_categories):
                points += 25
            if any("awd" in d or "4wd" in d for d in variant_drives):
                points += 20

        # 3. Road & Terrain Conditions Scoring
        terrain_sel = terrain.lower()
        if "rough" in terrain_sel:
            if any(gc >= 180 for gc in variant_clearances):
                points += 30
            if any("suv" in cat for cat in variant_categories):
                points += 15
        elif "hills" in terrain_sel:
            if any(h is True for h in variant_hills):
                points += 20
            if any("awd" in d or "4wd" in d for d in variant_drives):
                points += 25
                
        # 4. Driver Profile Scoring
        driver_sel = driver.lower()
        if "beginner" in driver_sel:
            if any("auto" in t or "amt" in t or "dct" in t or "cvt" in t for t in variant_transmissions):
                points += 20
            if any(r <= 5.2 and r > 0 for r in variant_radius):
                points += 15
        elif "senior" in driver_sel:
            if any("auto" in t or "amt" in t or "dct" in t or "cvt" in t for t in variant_transmissions):
                points += 15
            if any(gc >= 170 for gc in variant_clearances):
                points += 20
        elif "experienced" in driver_sel:
            if any("manual" in t or "dct" in t for t in variant_transmissions):
                points += 15
                
        scored_cars.append((c, points))
        
    scored_cars.sort(key=lambda x: x[1], reverse=True)
    filtered_cars = [item[0] for item in scored_cars[:10]]
    
    if not filtered_cars:
        print("[FILTER] No cars matched budget. Using default fallback slice.")
        filtered_cars = cars[:5]
        
    print(f"[FILTER] Scored and selected {len(filtered_cars)} cars for prompt context:")
    for c in filtered_cars:
        print(f"   - {c['brand']} {c['name']} (ID: {c['id']})")
        
    cars_context = []
    for c in filtered_cars:
        cars_context.append(f"- ID: {c['id']} | Brand: {c['brand']} | Model: {c['name']}")
        
    cars_list_summary = "\n".join(cars_context)
    
    prompt = f"""You are DryvSquad AI, an elite automotive matchmaker for the Indian car market.
A buyer is looking for a car based on these lifestyle preferences:
- Budget Range: {budget}
- Seating Capacity: {seating}
- Primary Usage: {usage}
- Road & Terrain Conditions: {terrain}
- Primary Driver Profile: {driver}
- Additional Custom Requirements: {custom_query}

Here is the list of available cars in our database:
{cars_list_summary}

Select all relevant cars that match the user's budget and criteria (up to 5 cars max). For each selected car, write the details in this exact format:

[RECOMMENDATION]
ID: [exact_model_id_from_the_list_above]
FOCUS: [Brief focus/appeal category label, e.g. City + mileage focus]
VERDICT: [Explanation of why this car fits their needs, wrapping key terms in double asterisks, e.g. This car matches your preferences with its **experienced** driver profile suitability...]
[END]

Do not include any other text or JSON. Provide only the recommendations in the format above.
"""

    try:
        print(f"[LLM] Querying Groq/Gemini...")
        raw_response = generate(prompt, max_tokens=800, temperature=0.0)
        
        print(f"\n--------------------------------------------------")
        print(f"[LLM] Raw Response Received:")
        print(raw_response)
        print(f"--------------------------------------------------\n")
        
        recommendations = []
        blocks = re.split(r"\[RECOMMENDATION\]", raw_response, flags=re.IGNORECASE)
        for block in blocks:
            if not block.strip():
                continue
            id_match = re.search(r"ID:\s*([a-fA-F0-9]{24})", block, re.IGNORECASE)
            focus_match = re.search(r"FOCUS:\s*(.*?)(?=\n|VERDICT:)", block, re.IGNORECASE)
            verdict_match = re.search(r"VERDICT:\s*(.*)", block, re.IGNORECASE | re.DOTALL)
            
            if id_match:
                rec_id = id_match.group(1).strip()
                rec_focus = focus_match.group(1).strip() if focus_match else "Custom Pick"
                rec_verdict = verdict_match.group(1).strip() if verdict_match else ""
                # Strip any trailing END tag or extra spacing
                rec_verdict = re.sub(r"\[END\].*", "", rec_verdict, flags=re.IGNORECASE | re.DOTALL).strip()
                
                recommendations.append({
                    "id": rec_id,
                    "focus": rec_focus,
                    "verdict": rec_verdict
                })
        
        hydrated = []
        for rec in recommendations:
            model_id = rec.get("id")
            db_car = next((c for c in cars if c["id"] == model_id), None)
            if db_car:
                prices = []
                for v in db_car["variants"]:
                    p = v.get("price")
                    if p:
                        prices.append(p.replace("₹", "").strip())
                
                if len(prices) > 1:
                    price_str = f"₹{prices[0]} - ₹{prices[-1]}"
                elif len(prices) == 1:
                    price_str = f"₹{prices[0]}"
                else:
                    price_str = "N/A"
                
                first_variant = db_car["variants"][0] if db_car["variants"] else {}
                
                hydrated.append({
                    "id": db_car["id"],
                    "brand": db_car["brand"],
                    "name": db_car["name"],
                    "image": db_car["image"],
                    "slug": db_car["slug"],
                    "priceRange": price_str,
                    "focus": rec.get("focus", "Custom Pick"),
                    "verdict": rec.get("verdict", ""),
                    "engine": first_variant.get("engine", "N/A"),
                    "power": first_variant.get("power", "N/A"),
                    "mileage": first_variant.get("mileage", "N/A"),
                    "seatingCapacity": first_variant.get("seatingCapacity", "5 Seater")
                })
        print(f"[SUCCESS] Successfully hydrated and matched {len(hydrated)} cars!")
        return {"success": True, "recommendations": hydrated}
    except Exception as e:
        print(f"[ERROR] AI car matching failed: {e}")
        print("Traceback:")
        traceback.print_exc()
        return {"success": False, "recommendations": []}
