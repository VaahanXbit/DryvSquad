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

MASS_MARKET_BRANDS = {"maruti suzuki", "suzuki", "hyundai", "tata", "mahindra", "honda", "citroen", "citroën"}

def _has_auto(transmissions: list) -> bool:
    return any("auto" in t or "amt" in t or "dct" in t or "cvt" in t for t in transmissions) or any(t == "at" for t in transmissions)

def get_on_road_price(
    ex_showroom_price: int,
    state_code: str,
    fuel_type: str,
    has_loan: bool = False,
    accessories_cost: int = 0,
    state_rules: dict = None
) -> int:
    try:
        # 1. Fetch State Pricing Rule from DB if not provided
        if not state_rules:
            state_rules = db["statepricingrules"].find_one({"stateCode": state_code.upper(), "isActive": True})
            if not state_rules:
                # Fallback to state name search
                state_rules = db["statepricingrules"].find_one({"state": state_code, "isActive": True})
            if not state_rules:
                # Try any active rule as a fallback
                state_rules = db["statepricingrules"].find_one({"isActive": True})
            
        if not state_rules:
            # Absolute fallback if collections are empty (unlikely on prod)
            return ex_showroom_price + accessories_cost
            
        # 2. Road Tax
        fuel = fuel_type.lower()
        road_tax_list = []
        if "electric" in fuel or "ev" in fuel:
            road_tax_list = state_rules.get("roadTax", {}).get("ev", [])
        elif "cng" in fuel:
            road_tax_list = state_rules.get("roadTax", {}).get("cng", [])
        else:
            road_tax_list = state_rules.get("roadTax", {}).get("petrolDiesel", [])
            
        road_tax = 0
        for slab in road_tax_list:
            min_p = slab.get("minPrice", 0) or 0
            max_p = slab.get("maxPrice")
            if ex_showroom_price >= min_p and (max_p is None or ex_showroom_price <= max_p):
                road_tax = int(ex_showroom_price * slab.get("ratePercent", 0) / 100)
                break
                
        # 3. Registration
        reg_rules = state_rules.get("registration", {})
        registration = int(reg_rules.get("flatFee", 5000) + reg_rules.get("additionalCharges", 1500))
        
        # 4. Insurance
        ins_rules = state_rules.get("insurance", {})
        comprehensive_rate = ins_rules.get("comprehensiveRatePercent", 4)
        min_premium = ins_rules.get("minPremium", 8000)
        insurance = int(ex_showroom_price * comprehensive_rate / 100)
        if insurance < min_premium:
            insurance = min_premium
            
        # 5. TCS
        tcs = 0
        if ex_showroom_price > 1000000:
            tcs = int(ex_showroom_price * 0.01)
            
        # 6. Fastag
        fastag = state_rules.get("fastag", {})
        fastag_charges = int(fastag.get("issuanceFee", 100) + fastag.get("minBalance", 200))
        if fastag_charges == 0:
            fastag_charges = 500 # fallback
            
        # 7. Hypothecation
        hypothecation = 1500 if has_loan else 0
        
        # 8. Handling Charges
        handling = state_rules.get("handlingCharges", 10000)
        
        # 9. Luxury Tax
        lux_rules = state_rules.get("luxuryTax", {})
        luxury_tax = 0
        if lux_rules.get("applicable", False):
            threshold = lux_rules.get("thresholdPrice", 2000000)
            if ex_showroom_price > threshold:
                luxury_tax = int(ex_showroom_price * lux_rules.get("ratePercent", 0) / 100)
                
        # 10. EV Subsidy
        subsidy = 0
        if "electric" in fuel or "ev" in fuel:
            sub_rules = state_rules.get("evSubsidy", {})
            if sub_rules.get("applicable", False):
                subsidy = sub_rules.get("flatSubsidy", 0)
                max_sub = sub_rules.get("maxSubsidy", 0)
                if subsidy > max_sub and max_sub > 0:
                    subsidy = max_sub
                    
        # On-Road Price Formula
        on_road = (
            ex_showroom_price
            + road_tax
            + registration
            + insurance
            + tcs
            + fastag_charges
            + hypothecation
            + handling
            + luxury_tax
            + accessories_cost
            - subsidy
        )
        return int(on_road)
    except Exception as e:
        print(f"[ERROR] Failed to calculate on-road price: {e}")
        # Default fallback
        return int(ex_showroom_price * 1.15) + accessories_cost

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
                    "airbags": specs.get("airbags", 0),
                })
                
        return list(model_map.values())
    except Exception as e:
        print(f"[ERROR] Failed to fetch cars data from db: {e}")
        return []

def parse_budget_range(budget_str: str) -> tuple:
    b = budget_str.lower().strip()
    
    if "80l+" in b:
        return 0, 9990000000
        
    # Try dynamic up-to parsing first
    if "up to" in b:
        match = re.search(r"up to\s*(\d+)", b)
        if match:
            x = int(match.group(1))
            if x >= 80:
                return 0, 9990000000
            return 0, x * 100000

    # Legacy fallbacks
    if "< 10l" in b or "under" in b or "10l" == b:
        return 0, 1000000
    elif "10-15l" in b:
        return 1000000, 1500000
    elif "15-20l" in b:
        return 1500000, 2000000
    else:
        return 2000000, 9990000000

def get_base_name(model_name: str, brand: str = "") -> str:
    if not model_name:
        return ""
    base = model_name
    
    # Strip brand prefix if present
    if brand and base.lower().startswith(brand.lower()):
        base = base[len(brand):].strip()
        
    # Apply regex cleanups matching the frontend rules
    base = re.sub(r"\b(1\.\d|2\.\d)\s*(l|turbo|diesel|petrol|hybrid|puretech|tgdi|gdi)?\b", "", base, flags=re.IGNORECASE)
    base = re.sub(r"\b(dct|cvt|amt|at|mt|ivt|tc|manual|automatic|dsg)\b", "", base, flags=re.IGNORECASE)
    base = re.sub(r"\b(smart hybrid|hybrid|mild hybrid|strong hybrid)\b", "", base, flags=re.IGNORECASE)
    base = re.sub(r"\b(4wd|awd|2wd|fwd|rwd)\b", "", base, flags=re.IGNORECASE)
    base = re.sub(r"\b(technology|sportback|quattro|luxury|premium|prestige|exclusive|style|active|ambition|select|executive)\b", "", base, flags=re.IGNORECASE)
    base = re.sub(r"\b(zx|vx|v|zxi|vxi|lxi|s|sx|sxi|ex|dx|lx|mx|gx|ax|zeta|alpha|delta|sigma|k15c|k12n|k10c|110)\b", "", base, flags=re.IGNORECASE)
    
    # Clean multiple spaces
    return re.sub(r"\s+", " ", base).strip()

def classify_city(city_name: str) -> str:
    c = city_name.lower().strip()
    
    tier_1 = [
        "mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", 
        "ahmedabad", "chennai", "kolkata", "pune"
    ]
    
    tier_2 = [
        "jaipur", "lucknow", "kanpur", "nagpur", "indore", "thane", "bhopal", 
        "visakhapatnam", "vizag", "patna", "vadodara", "ghaziabad", "ludhiana", 
        "agra", "nashik", "faridabad", "meerut", "rajkot", "varanasi", "srinagar", 
        "aurangabad", "dhanbad", "amritsar", "navi mumbai", "allahabad", "prayagraj", 
        "ranchi", "howrah", "coimbatore", "jabalpur", "gwalior", "vijayawada", 
        "jodhpur", "madurai", "raipur", "kota", "guwahati", "chandigarh", "solapur", 
        "hubli", "dharwad", "bareilly", "moradabad", "mysore", "mysuru", "gurgaon", 
        "gurugram", "aligarh", "jalandhar", "tiruchirappalli", "bhubaneswar", 
        "salem", "warangal", "guntur", "bhilai", "amravati", "noida", "jamshedpur", 
        "bikaner", "kochi", "cuttack", "dehradun", "kolhapur", "ajmer", "jammu", 
        "mangalore", "mangaluru", "udaipur", "shimla", "panaji"
    ]
    
    if any(city in c for city in tier_1):
        return "tier 1"
    elif any(city in c for city in tier_2):
        return "tier 2"
    elif "rural" in c or "village" in c or "town" in c:
        return "rural"
    else:
        return "tier 3"

def format_price_lakh(price_val: int) -> str:
    if not price_val:
        return "N/A"
    if price_val >= 100000:
        val = price_val / 100000
        return f"{val:.2f}".rstrip('0').rstrip('.') + " Lakh"
    return str(price_val)

def check_hard_filters(matching_variants, non_negotiables: list) -> bool:
    # 1. Transmission check
    if "automatic" in non_negotiables:
        has_auto = any(
            _has_auto([str(v.get("transmission", "")).lower()])
            for v, _ in matching_variants
        )
        if not has_auto:
            return False
            
    # 2. Drive type check
    if "awd_4wd" in non_negotiables:
        has_awd = any(
            any(x in str(v.get("driveType", "")).lower() for x in ["awd", "4wd"])
            for v, _ in matching_variants
        )
        if not has_awd:
            return False
            
    # 3. EV check
    if "ev" in non_negotiables:
        has_ev = any(
            any(x in str(v.get("fuelType", "")).lower() for x in ["electric", "ev"])
            for v, _ in matching_variants
        )
        if not has_ev:
            return False
            
    # 4. Ground Clearance check
    if "high_clearance" in non_negotiables:
        has_gc = any(
            clean_int(v.get("groundClearance")) >= 180
            for v, _ in matching_variants
        )
        if not has_gc:
            return False
            
    # 5. Airbags check
    if "airbags_6" in non_negotiables:
        has_airbags_data = any(
            v.get("airbags") is not None and clean_int(v.get("airbags")) > 0
            for v, _ in matching_variants
        )
        if has_airbags_data:
            has_6_airbags = any(
                clean_int(v.get("airbags")) >= 6
                for v, _ in matching_variants
            )
            if not has_6_airbags:
                return False
                
    return True

def calculate_car_score(c: dict, usage: list, terrain: str, city: str, state: str, params: dict, on_road_price: int) -> int:
    matching_variants = c["matching_variants"]
    raw_score = 0
    
    brand_lower = c.get("brand", "").lower().strip()
    
    variant_seats = [clean_int(v["seatingCapacity"]) for v, _ in matching_variants if v.get("seatingCapacity")]
    variant_transmissions = [str(v.get("transmission")).lower() for v, _ in matching_variants if v.get("transmission")]
    variant_fuels = [str(v.get("fuelType")).lower() for v, _ in matching_variants if v.get("fuelType")]
    variant_clearances = [clean_int(v["groundClearance"]) for v, _ in matching_variants if v.get("groundClearance")]
    variant_boot = [clean_int(v["bootSpace"]) for v, _ in matching_variants if v.get("bootSpace")]
    variant_radius = [clean_float(v["turningRadius"]) for v, _ in matching_variants if v.get("turningRadius")]
    variant_categories = [str(v.get("category")).lower() for v, _ in matching_variants if v.get("category")]
    variant_drives = [str(v.get("driveType")).lower() for v, _ in matching_variants if v.get("driveType")]
    variant_hills = [v.get("hillAssist") for v, _ in matching_variants if v.get("hillAssist") is not None]
    
    # 1. Budget Headroom (10 pts)
    min_budget = params.get("min_budget", 0)
    max_budget = params.get("max_budget", 9990000000)
    if max_budget > 50000000:
        midpoint = 4000000
    else:
        midpoint = (min_budget + max_budget) / 2
        
    if on_road_price <= midpoint:
        raw_score += 10
    else:
        raw_score += 5
        
    # 2. Profile Match (25 pts)
    life_profile = params.get("life_profile", "solo_commuter").lower()
    if life_profile == "joint_family":
        if any(s >= 7 for s in variant_seats):
            raw_score += 25
        else:
            raw_score -= 15
    elif life_profile == "adventure":
        if any("suv" in cat for cat in variant_categories) or any(d in ["awd", "4wd"] for d in variant_drives):
            raw_score += 25
    elif life_profile == "senior_citizen":
        if _has_auto(variant_transmissions):
            raw_score += 15
        if any(gc >= 180 for gc in variant_clearances):
            raw_score += 10
    elif life_profile == "new_driver":
        if _has_auto(variant_transmissions):
            raw_score += 15
        if any(r <= 5.2 and r > 0 for r in variant_radius):
            raw_score += 10
    elif life_profile == "commercial":
        if brand_lower in MASS_MARKET_BRANDS:
            raw_score += 25
    else:
        raw_score += 12
        
    # 3. Terrain & Location (20 pts)
    t_sel = terrain.lower()
    if "rough" in t_sel:
        if any(gc >= 180 for gc in variant_clearances):
            raw_score += 20
    elif "hills" in t_sel:
        if any(h is True for h in variant_hills) or any(d in ["awd", "4wd"] for d in variant_drives):
            raw_score += 20
    else:
        raw_score += 10
        
    city_class = classify_city(city)
    if "rural" in city_class or "tier 3" in city_class or "village" in city_class:
        if any(gc >= 200 for gc in variant_clearances):
            raw_score += 10
    elif "tier 2" in city_class:
        if brand_lower in MASS_MARKET_BRANDS:
            raw_score += 5
            
    # 4. Usage Match (12 pts max)
    usage_score = 0
    usage_list = usage[:2] if isinstance(usage, list) else [str(usage)]
    for u in usage_list:
        u_lower = u.lower()
        if "city" in u_lower:
            if _has_auto(variant_transmissions):
                usage_score += 6
        elif "highway" in u_lower:
            if any("diesel" in f or "hybrid" in f for f in variant_fuels):
                usage_score += 6
        elif "weekend" in u_lower:
            if any(b >= 350 for b in variant_boot):
                usage_score += 6
        elif "adventure" in u_lower:
            if any("suv" in cat for cat in variant_categories):
                usage_score += 6
    raw_score += min(12, usage_score)
    
    # 5. Fuel Match (10 pts)
    fuel_pref = params.get("fuel_pref", "").lower().strip()
    if "electric" in fuel_pref or "ev" in fuel_pref:
        fuel_token = "electric"
    elif "cng" in fuel_pref:
        fuel_token = "cng"
    elif "diesel" in fuel_pref:
        fuel_token = "diesel"
    elif "petrol" in fuel_pref:
        fuel_token = "petrol"
    elif "hybrid" in fuel_pref:
        fuel_token = "hybrid"
    else:
        fuel_token = ""
        
    if fuel_token:
        if any(fuel_token in f for f in variant_fuels):
            raw_score += 10
        else:
            raw_score -= 8
            
    # 6. Ownership Signals (12 pts max)
    owner_sum = 0
    tenure = params.get("tenure", "").strip()
    resale = params.get("resale_importance", "").lower().strip()
    non_negs = params.get("non_negotiables", [])
    
    if tenure == "2-3" and brand_lower in MASS_MARKET_BRANDS:
        owner_sum += 6
    elif tenure == "7+" and brand_lower in MASS_MARKET_BRANDS:
        owner_sum += 6
        
    if resale == "critical" and brand_lower in MASS_MARKET_BRANDS:
        owner_sum += 4
        
    if "low_service_cost" in non_negs and brand_lower in MASS_MARKET_BRANDS:
        owner_sum += 4
    if "resale_value" in non_negs and brand_lower in MASS_MARKET_BRANDS:
        owner_sum += 4
        
    raw_score += min(12, owner_sum)
    
    # 7. Operating Cost Signal (8 pts)
    opex = params.get("monthly_opex_band", "").lower().strip()
    if opex == "under 3k":
        if any("electric" in f or "ev" in f or "cng" in f for f in variant_fuels):
            raw_score += 8
            
    # 8. Standout-Match Kicker (8 pts)
    if life_profile == "adventure" and any(gc >= 220 for gc in variant_clearances):
        raw_score += 8
        
    final_score = max(0, min(100, round(raw_score * 0.85)))
    return final_score

def find_matching_cars(
    budget: str,
    seating: str,
    usage: list,
    terrain: str,
    driver: str,
    city: str,
    state: str = "DL",
    life_profile: str = "solo_commuter",
    tenure: str = "",
    fuel_pref: str = "",
    resale_importance: str = "",
    monthly_opex_band: str = "",
    non_negotiables: list = None,
    custom_query: str = ""
) -> dict:
    import traceback
    if non_negotiables is None:
        non_negotiables = []
    
    city_class = classify_city(city)
    db_state_code = state.upper() if state else "DL"
    
    if city and db_state_code == "DL":
        try:
            loc_doc = db["locations"].find_one({"city": {"$regex": f"^{re.escape(city)}$", "$options": "i"}})
            if loc_doc and loc_doc.get("stateCode"):
                db_state_code = loc_doc.get("stateCode").upper()
        except Exception as e:
            print(f"[WARNING] Dynamic state lookup failed: {e}")

    print(f"\n==================================================")
    print(f"[AI CAR MATCHMAKER] New Search Request Received")
    print(f"   Budget: {budget}")
    print(f"   Seating: {seating}")
    print(f"   Usage: {usage}")
    print(f"   Terrain: {terrain}")
    print(f"   Driver: {driver}")
    print(f"   City: {city} (Classified: {city_class})")
    print(f"   Resolved State: {db_state_code}")
    print(f"   Life Profile: {life_profile}")
    print(f"   Tenure: {tenure}")
    print(f"   Fuel Pref: {fuel_pref}")
    print(f"   Resale Importance: {resale_importance}")
    print(f"   Monthly Opex Band: {monthly_opex_band}")
    print(f"   Non Negotiables: {non_negotiables}")
    print(f"   Custom Query: {custom_query}")
    print(f"==================================================")
    
    # Fetch state pricing rules once per request to avoid N+1 DB queries in loops
    state_rules = None
    try:
        state_rules = db["statepricingrules"].find_one({"stateCode": db_state_code, "isActive": True})
        if not state_rules:
            state_rules = db["statepricingrules"].find_one({"state": state, "isActive": True})
        if not state_rules:
            state_rules = db["statepricingrules"].find_one({"isActive": True})
    except Exception as e:
        print(f"[WARNING] Failed to pre-fetch state pricing rules: {e}")

    cars = get_all_cars_data()
    if not cars:
        print("[DATABASE ERROR] No cars retrieved from the database!")
        return {"success": False, "recommendations": [], "noExactMatch": False, "relaxedNonNegotiables": False}
        
    min_price, max_price = parse_budget_range(budget)
    
    params = {
        "min_budget": min_price,
        "max_budget": max_price,
        "life_profile": life_profile,
        "tenure": tenure,
        "fuel_pref": fuel_pref,
        "resale_importance": resale_importance,
        "monthly_opex_band": monthly_opex_band,
        "non_negotiables": non_negotiables
    }
    
    scored_cars = []
    no_exact_match = False
    relaxed_non_negotiables = False
    
    # PHASE 1: Try with Budget (calculated On-Road) + Non-negotiable Hard Filters 
    for c in cars:
        matching_variants = []
        for v in c["variants"]:
            ex_showroom = v.get("exShowroomPrice", 0)
            if not ex_showroom and v.get("price"):
                ex_showroom = clean_int(v["price"])
            price_val = get_on_road_price(
                ex_showroom_price=ex_showroom,
                state_code=db_state_code,
                fuel_type=v.get("fuelType", "petrol"),
                has_loan=False,
                accessories_cost=0,
                state_rules=state_rules
            )
            if price_val and min_price <= price_val <= max_price:
                matching_variants.append((v, price_val))
                
        if not matching_variants:
            continue
            
        if not check_hard_filters(matching_variants, non_negotiables):
            continue
            
        matching_variants.sort(key=lambda x: x[1])
        c_copy = dict(c)
        c_copy["matching_variants"] = matching_variants
        
        points = calculate_car_score(c_copy, usage, terrain, city, db_state_code, params, matching_variants[0][1])
        scored_cars.append((c_copy, points))
        
    # De-duplicate by base name
    unique_scored_cars = []
    seen_base_names = set()
    for c, score in scored_cars:
        base_name = (c['brand'] + " " + get_base_name(c['name'], c['brand'])).lower().strip()
        if base_name not in seen_base_names:
            seen_base_names.add(base_name)
            unique_scored_cars.append((c, score))
            
    # PHASE 2: Fallback - Relax Non-negotiables, Keep Budget
    if not unique_scored_cars:
        print("[FILTER] No cars matched hard filters. Relaxing non-negotiables.")
        relaxed_non_negotiables = True
        no_exact_match = True
        scored_cars = []
        
        for c in cars:
            matching_variants = []
            for v in c["variants"]:
                ex_showroom = v.get("exShowroomPrice", 0)
                if not ex_showroom and v.get("price"):
                    ex_showroom = clean_int(v["price"])
                price_val = get_on_road_price(
                    ex_showroom_price=ex_showroom,
                    state_code=db_state_code,
                    fuel_type=v.get("fuelType", "petrol"),
                    has_loan=False,
                    accessories_cost=0,
                    state_rules=state_rules
                )
                if price_val and min_price <= price_val <= max_price:
                    matching_variants.append((v, price_val))
                    
            if not matching_variants:
                continue
                
            matching_variants.sort(key=lambda x: x[1])
            c_copy = dict(c)
            c_copy["matching_variants"] = matching_variants
            
            points = calculate_car_score(c_copy, usage, terrain, city, db_state_code, params, matching_variants[0][1])
            scored_cars.append((c_copy, points))
            
        seen_base_names = set()
        for c, score in scored_cars:
            base_name = (c['brand'] + " " + get_base_name(c['name'], c['brand'])).lower().strip()
            if base_name not in seen_base_names:
                seen_base_names.add(base_name)
                unique_scored_cars.append((c, score))
                
    # PHASE 3: Fallback - Relax Budget Too
    if not unique_scored_cars:
        print("[FILTER] No cars matched budget. Using default fallback slice with all database cars.")
        no_exact_match = True
        scored_cars = []
        
        for c in cars:
            all_vars = []
            for v in c["variants"]:
                ex_showroom = v.get("exShowroomPrice", 0) or clean_int(v.get("price"))
                p_val = get_on_road_price(
                    ex_showroom_price=ex_showroom,
                    state_code=db_state_code,
                    fuel_type=v.get("fuelType", "petrol"),
                    has_loan=False,
                    accessories_cost=0,
                    state_rules=state_rules
                )
                all_vars.append((v, p_val))
            all_vars.sort(key=lambda x: x[1])
            
            c_copy = dict(c)
            c_copy["matching_variants"] = all_vars
            
            points = calculate_car_score(c_copy, usage, terrain, city, db_state_code, params, all_vars[0][1])
            scored_cars.append((c_copy, points))
            
        seen_base_names = set()
        for c, score in scored_cars:
            base_name = (c['brand'] + " " + get_base_name(c['name'], c['brand'])).lower().strip()
            if base_name not in seen_base_names:
                seen_base_names.add(base_name)
                unique_scored_cars.append((c, score))
                
    # Sort unique scored cars by score descending, limit to top 10
    unique_scored_cars.sort(key=lambda x: x[1], reverse=True)
    filtered_cars = [item[0] for item in unique_scored_cars[:10]]
    
    print(f"[FILTER] Scored and selected {len(filtered_cars)} cars for prompt context:")
    for c in filtered_cars:
        print(f"   - {c['brand']} {c['name']} (ID: {c['id']})")
        
    cars_context = []
    for c in filtered_cars:
        mv = c.get("matching_variants", [])
        if mv:
            best_v = mv[0][0] # cheapest matching variant
            gc = best_v.get("groundClearance", "N/A")
            trans = ", ".join(list(set([str(v.get("transmission", "N/A")) for v, _ in mv if v.get("transmission")])))
            fuels = ", ".join(list(set([str(v.get("fuelType", "N/A")) for v, _ in mv if v.get("fuelType")])))
            mileage = best_v.get("mileage", "N/A")
            power = best_v.get("power", "N/A")
            category = best_v.get("category", "N/A")
            radius = best_v.get("turningRadius", "N/A")
            
            if len(mv) > 1:
                price_range = f"{format_price_lakh(mv[0][1])} - {format_price_lakh(mv[-1][1])}"
            else:
                price_range = f"{format_price_lakh(mv[0][1])}"
                
            spec_str = f"Price: {price_range} | GC: {gc}mm | Transmissions: {trans} | Fuels: {fuels} | Mileage: {mileage} | Power: {power} | Category: {category} | Turning Radius: {radius}m"
        else:
            spec_str = "N/A"
            
        cars_context.append(f"- ID: {c['id']} | Brand: {c['brand']} | Model: {c['name']} | Specifications: {spec_str}")
        
    cars_list_summary = "\n".join(cars_context)
    
    # Prepend structured parameters context to custom_query for LLM Prompt context
    structured_notes = []
    if tenure:
        structured_notes.append(f"Ownership tenure: {tenure} years")
    if fuel_pref:
        structured_notes.append(f"Stated fuel preference: {fuel_pref}")
    if resale_importance:
        structured_notes.append(f"Resale value importance: {resale_importance}")
    if monthly_opex_band:
        structured_notes.append(f"Target monthly opex/maintenance: {monthly_opex_band}")
    if non_negotiables:
        structured_notes.append(f"Soft non-negotiables: {', '.join(non_negotiables)}")
        
    combined_query_notes = " | ".join(structured_notes)
    final_query_context = custom_query
    if combined_query_notes:
        final_query_context = f"{combined_query_notes} | {custom_query}" if custom_query else combined_query_notes
        
    prompt = f"""You are DryvSquad AI, an elite automotive matchmaker for the Indian car market.
A buyer is looking for a car based on these lifestyle preferences:
- Budget Range: {budget}
- Seating Capacity: {seating}
- Primary Usage: {usage}
- Road & Terrain Conditions: {terrain}
- Primary Driver Profile: {driver}
- Additional Custom Requirements: {final_query_context}

Here is the list of available cars in our database with their matched specifications:
{cars_list_summary}

Select all relevant cars that match the user's budget and criteria (up to 5 cars max). For each selected car, write the details in this exact format:

[RECOMMENDATION]
ID: [exact_model_id_from_the_list_above]
BRAND: [exact_brand_from_the_list_above]
MODEL: [exact_model_from_the_list_above]
FOCUS: [Brief focus/appeal category label, e.g. City + mileage focus]
VERDICT: [Explanation of why this car fits their needs, wrapping key terms in double asterisks. You MUST ground your explanation strictly in the specifications provided above. For example, reference the exact ground clearance, transmission type, fuel type, turning radius, or mileage listed for the candidate to justify why it fits. Do not mention any specs or facts not explicitly listed in the specifications above.]
[END]

Do not include any other text or JSON. Provide only the recommendations in the format above.
"""

    try:
        print(f"[LLM] Querying Groq/Gemini...")
        raw_response = generate(prompt, max_tokens=800, temperature=0.2)
        
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
            brand_match = re.search(r"BRAND:\s*(.*?)(?=\n|MODEL:)", block, re.IGNORECASE)
            model_match = re.search(r"MODEL:\s*(.*?)(?=\n|FOCUS:)", block, re.IGNORECASE)
            focus_match = re.search(r"FOCUS:\s*(.*?)(?=\n|VERDICT:)", block, re.IGNORECASE)
            verdict_match = re.search(r"VERDICT:\s*(.*)", block, re.IGNORECASE | re.DOTALL)
            
            rec_id = id_match.group(1).strip() if id_match else None
            rec_brand = brand_match.group(1).strip() if brand_match else ""
            rec_model = model_match.group(1).strip() if model_match else ""
            rec_focus = focus_match.group(1).strip() if focus_match else "Custom Pick"
            rec_verdict = verdict_match.group(1).strip() if verdict_match else ""
            
            rec_verdict = re.sub(r"\[END\].*", "", rec_verdict, flags=re.IGNORECASE | re.DOTALL).strip()
            
            db_car = None
            if rec_id:
                db_car = next((c for c in filtered_cars if c["id"] == rec_id), None)
            
            if not db_car and rec_brand and rec_model:
                brand_lower = rec_brand.lower().strip()
                model_lower = rec_model.lower().strip()
                
                db_car = next((c for c in filtered_cars if c["brand"].lower().strip() == brand_lower and get_base_name(c["name"]).lower().strip() == get_base_name(rec_model).lower().strip()), None)
                
                if not db_car:
                    db_car = next((c for c in filtered_cars if c["brand"].lower().strip() == brand_lower and (model_lower in c["name"].lower() or get_base_name(c["name"]).lower() in model_lower)), None)
            
            if db_car:
                recommendations.append({
                    "car": db_car,
                    "focus": rec_focus,
                    "verdict": rec_verdict
                })
        
        hydrated = []
        for rec in recommendations:
            db_car = rec["car"]
            
            matching_vars = db_car.get("matching_variants", [])
            if not matching_vars:
                matching_vars = [(v, get_on_road_price(v.get("exShowroomPrice", 0) or clean_int(v.get("price")), db_state_code, v.get("fuelType", "petrol"), has_loan=False, accessories_cost=0, state_rules=state_rules)) for v in db_car["variants"]]
                matching_vars.sort(key=lambda x: x[1])
            
            matching_vars_data = []
            for v, p_val in matching_vars:
                matching_vars_data.append({
                    "name": v.get("name", ""),
                    "exShowroomPrice": v.get("exShowroomPrice", 0),
                    "onRoadPrice": p_val,
                    "transmission": v.get("transmission", ""),
                    "fuelType": v.get("fuelType", ""),
                    "groundClearance": v.get("groundClearance", ""),
                    "airbags": v.get("airbags", 0),
                    "seats": v.get("seatingCapacity", "")
                })
                
            recommended_variant_name = matching_vars[0][0].get("name", "") if matching_vars else ""
            
            if len(matching_vars) > 1:
                price_str = f"₹{format_price_lakh(matching_vars[0][1])} - ₹{format_price_lakh(matching_vars[-1][1])}"
            else:
                price_str = f"₹{format_price_lakh(matching_vars[0][1])}"
            
            display_variant = matching_vars[0][0]
            min_matched_price = matching_vars[0][1]
            
            engine = display_variant.get("engine", "N/A")
            power = display_variant.get("power", "N/A")
            mileage = display_variant.get("mileage", "N/A")
            seating_cap = display_variant.get("seatingCapacity", "5 Seater")
            if seating_cap and "seater" not in str(seating_cap).lower():
                seating_cap = f"{seating_cap} Seater"
            
            hydrated.append({
                "id": db_car["id"],
                "brand": db_car["brand"],
                "name": db_car["name"],
                "displayName": db_car["brand"] + " " + get_base_name(db_car["name"], db_car["brand"]),
                "image": db_car["image"],
                "slug": db_car["slug"],
                "priceRange": price_str,
                "minPrice": min_matched_price,
                "focus": rec["focus"],
                "verdict": rec["verdict"],
                "engine": engine,
                "power": power,
                "mileage": mileage,
                "seatingCapacity": seating_cap,
                "matchingVariants": matching_vars_data,
                "recommendedVariant": recommended_variant_name
            })
            
        print(f"[SUCCESS] Successfully hydrated and matched {len(hydrated)} cars!")
        return {
            "success": True, 
            "recommendations": hydrated,
            "noExactMatch": no_exact_match,
            "relaxedNonNegotiables": relaxed_non_negotiables
        }
    except Exception as e:
        print(f"[ERROR] AI car matching failed: {e}")
        print("Traceback:")
        traceback.print_exc()
        return {"success": False, "recommendations": [], "noExactMatch": False, "relaxedNonNegotiables": False}
