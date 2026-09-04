// Icon Selection Agent — settles the icon on every item that renders one.
//
// The heavy model proposes names during initial generation, but its output is
// never trusted: anything outside the allowlist is discarded and replaced by a
// keyword match against the item's own copy, so a service always ends up with a
// relevant glyph even when the model returns nothing (the deterministic
// fallback provider) or invents a name. Deliberately rules-based — picking an
// icon for a title is a lookup, not a judgement call.

import { ICON_NAMES, isIconName } from "@/lib/icons/registry";
import { getVariantSpec, iconCount } from "@/lib/sections/registry";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";

/**
 * Words that point at an icon, most specific first. Only the keyword needs to
 * appear in the item's title or body; the icon name itself is always a valid
 * match too, which covers most plain titles ("Security" -> shield).
 */
const KEYWORD_ICONS: [string[], string][] = [
  // Trades & property
  [["plumb", "pipe", "leak", "drain", "faucet", "water"], "droplets"],
  [["electric", "wiring", "rewire", "socket", "power"], "plug-zap"],
  [["roof", "gutter", "chimney"], "house"],
  [["paint", "decorat"], "paint-roller"],
  [["carpent", "joiner", "woodwork", "timber"], "hammer"],
  [["build", "construct", "extension", "renovat", "remodel", "refurb"], "hard-hat"],
  [["kitchen", "bathroom", "tiling", "flooring", "install"], "wrench"],
  [["heating", "boiler", "furnace", "hvac"], "flame"],
  [["cooling", "air condition", "aircon", "ventilat"], "wind"],
  [["clean", "hygiene", "sanit", "wash"], "spray-can"],
  [["garden", "landscap", "lawn", "tree", "hedge"], "leaf"],
  [["waste", "rubbish", "recycl", "disposal"], "recycle"],
  [["survey", "measure", "plan", "drawing", "blueprint", "architect", "space"], "pencil-ruler"],
  [["furnitur", "interior", "styling", "sofa"], "sofa"],
  [["lighting", "lamp"], "lamp"],
  [["secur", "alarm", "lock", "guard", "protect", "safe"], "shield-check"],
  [["key", "access", "entry"], "key"],

  // Health & wellbeing
  [["dental", "dentist", "teeth", "tooth", "whiten", "orthodont", "smile"], "smile"],
  [["doctor", "clinic", "medical", "gp", "diagnos", "checkup", "check-up"], "stethoscope"],
  [["cardio", "heart", "blood pressure"], "heart-pulse"],
  [["pharmac", "prescription", "medicine", "medication"], "pill"],
  [["vaccin", "injection", "inject", "blood test"], "syringe"],
  [["therap", "counsel", "mental", "mind", "wellbeing", "psycholog"], "brain"],
  [["physio", "chiro", "ortho", "joint", "back pain", "bone"], "bone"],
  [["emergency", "urgent", "ambulance"], "ambulance"],
  [["hospital", "surgery", "surgical"], "hospital"],
  [["massage", "spa", "relax", "wellness", "facial", "beauty", "skin"], "sparkles"],
  [["hair", "barber", "cut", "styling", "salon", "nail"], "scissors"],
  [["fitness", "gym", "strength", "training", "workout", "weight"], "dumbbell"],
  [["run", "cardio class", "endurance", "marathon", "step"], "footprints"],
  [["cycl", "bike", "spin"], "bike"],
  [["yoga", "pilates", "stretch", "mobility"], "activity"],
  [["basketball", "football", "soccer", "tennis", "padel", "volleyball", "tournament", "league"], "trophy"],
  [["nutrition", "diet", "meal plan"], "salad"],
  [["outdoor", "hiking", "climb", "adventure"], "mountain"],

  // Food & hospitality
  [["menu", "dining", "restaurant", "dine", "eat", "cuisine", "kitchen table"], "utensils"],
  [["chef", "cook", "culinary"], "chef-hat"],
  [["cater", "event food", "banquet", "buffet"], "utensils-crossed"],
  [["coffee", "espresso", "latte", "cafe", "café", "barista", "brew"], "coffee"],
  [["tea", "juice", "smoothie", "soft drink", "soda"], "cup-soda"],
  [["wine", "vineyard", "sommelier"], "wine"],
  [["beer", "brewery", "ale", "pub", "bar"], "beer"],
  [["pizza", "pizzeria"], "pizza"],
  [["bake", "bakery", "bread", "pastr", "cake", "dessert"], "cake-slice"],
  [["croissant", "breakfast", "brunch"], "croissant"],
  [["ice cream", "gelato", "frozen"], "ice-cream-cone"],
  [["burger", "steak", "grill", "bbq", "barbecue", "meat", "butcher"], "beef"],
  [["seafood", "fish", "sushi"], "fish"],
  [["soup", "broth", "stew"], "soup"],
  [["sandwich", "deli", "takeaway", "take-away", "lunch"], "sandwich"],
  [["vegan", "vegetarian", "organic", "produce", "farm"], "carrot"],
  [["hotel", "stay", "room", "accommodation", "lodging"], "hotel"],
  [["bed", "suite", "sleep"], "bed"],

  // Retail & commerce
  [["shop", "store", "retail", "boutique"], "store"],
  [["order", "cart", "checkout", "basket"], "shopping-cart"],
  [["deliver", "shipping", "courier", "logistic", "transport", "haulage"], "truck"],
  [["packag", "parcel", "fulfil", "warehouse", "stock", "inventor"], "package"],
  [["gift", "hamper", "present"], "gift"],
  [["cloth", "apparel", "fashion", "garment", "tailor", "uniform"], "shirt"],
  [["ticket", "booking", "reserv"], "ticket"],
  [["price", "pricing", "discount", "offer", "deal", "sale"], "tag"],

  // Money, legal & education
  [["account", "bookkeep", "payroll", "tax", "vat", "audit"], "calculator"],
  [["invoic", "billing", "receipt", "expense"], "receipt"],
  [["payment", "card", "checkout"], "credit-card"],
  [["loan", "mortgage", "lending", "finance", "funding", "capital"], "banknote"],
  [["saving", "pension", "invest", "wealth", "portfolio"], "piggy-bank"],
  [["bank", "treasury", "government", "public sector"], "landmark"],
  [["legal", "law", "solicitor", "attorney", "litigation", "dispute"], "gavel"],
  [["complian", "regulat", "policy", "governance", "contract", "agreement"], "scale"],
  [["insur", "claim", "cover", "warrant", "guarantee"], "shield"],
  [["train", "course", "workshop", "learn", "teach", "tuition", "lesson"], "graduation-cap"],
  [["school", "nursery", "childcare", "student", "academy"], "school"],
  [["guide", "resource", "knowledge", "read", "documentation", "manual"], "book-open"],

  // Technology
  [["website", "web design", "webflow", "landing page", "front-end", "frontend", "ui"], "monitor"],
  [["app", "mobile", "ios", "android"], "smartphone"],
  [["software", "develop", "engineer", "code", "coding", "programming", "api"], "code"],
  [["cloud", "migration", "aws", "azure", "hosting", "saas"], "cloud"],
  [["data", "database", "warehouse", "pipeline", "etl"], "database"],
  [["server", "infrastructur", "devops", "network", "it support"], "server"],
  [["analytic", "report", "dashboard", "metric", "insight", "statistic"], "chart-column"],
  [["forecast", "growth", "scal", "performance", "optimis", "optimiz", "improve"], "trending-up"],
  [["automat", "workflow", "integrat", "sync"], "workflow"],
  [["ai", "machine learning", "intelligen", "model"], "cpu"],
  [["test", "qa", "debug", "bug", "fix", "troubleshoot", "repair"], "bug"],
  [["wifi", "broadband", "connect", "telecom"], "wifi"],
  [["privacy", "gdpr", "encrypt", "backup"], "lock"],
  [["identity", "verification", "verify", "kyc"], "fingerprint"],

  // Creative & media
  [["brand", "logo", "identity design", "visual", "colour", "color", "palette"], "palette"],
  [["graphic", "illustrat", "artwork", "design"], "pen-tool"],
  [["photo", "photograph", "headshot", "portrait", "shoot"], "camera"],
  [["video", "film", "reel", "animation", "motion"], "video"],
  [["music", "audio", "sound", "song"], "music"],
  [["podcast", "voice", "recording", "interview"], "mic"],
  [["print", "signage", "brochure", "leaflet", "flyer"], "printer"],
  [["copywrit", "content", "blog", "article", "editorial", "news"], "newspaper"],
  [["typograph", "font", "typeface"], "type"],
  [["marketing", "advertis", "campaign", "promot", "outreach", "pr"], "megaphone"],
  [["seo", "search", "keyword", "ranking", "discover"], "search"],
  [["social", "share", "community", "engagement"], "share-2"],
  [["email", "newsletter", "mailing"], "mail"],

  // Travel & motor
  [["car", "vehicle", "auto", "motor", "garage", "mot"], "car-front"],
  [["tyre", "tire", "brake", "servicing", "diagnostic"], "gauge"],
  [["fuel", "petrol", "diesel", "charging", "ev"], "fuel"],
  [["flight", "fly", "airline", "airport"], "plane"],
  [["holiday", "vacation", "tour", "trip", "itinerar", "travel"], "plane-takeoff"],
  [["luggage", "baggage"], "luggage"],
  [["cruise", "boat", "yacht", "sail", "marine"], "ship"],
  [["rail", "railway", "commut"], "train-front"],
  [["camp", "glamping", "festival"], "tent"],
  [["beach", "coast", "island", "tropical"], "tree-palm"],
  [["surf", "swim", "dive", "watersport"], "waves"],
  [["map", "route", "direction", "navigation"], "map"],
  [["local", "area", "location", "region", "nationwide", "coverage"], "map-pin"],

  // Pets
  [["dog", "puppy", "canine", "walking"], "dog"],
  [["cat", "kitten", "feline"], "cat"],
  [["pet", "animal", "vet", "veterinar", "grooming"], "paw-print"],
  [["bird", "avian"], "bird"],

  // Process & service generics — the tail of the ladder
  [["consult", "advis", "strateg", "discovery", "assess", "audit"], "clipboard-list"],
  [["support", "helpdesk", "help desk", "assistance", "aftercare", "maintenance"], "life-buoy"],
  [["contact", "enquir", "inquir", "call", "phone", "speak"], "phone"],
  [["message", "chat", "conversation", "feedback"], "message-circle"],
  [["team", "staff", "people", "expert team", "specialist"], "users"],
  [["client", "customer", "partner", "collaborat", "relationship"], "handshake"],
  [["schedule", "appointment", "diary", "calendar", "availab"], "calendar-check"],
  [["fast", "quick", "rapid", "same day", "turnaround", "speed", "instant"], "zap"],
  [["time", "hour", "24", "always", "round the clock"], "clock"],
  [["launch", "start", "onboard", "kick", "begin", "get going"], "rocket"],
  [["idea", "creative", "concept", "innovat", "vision"], "lightbulb"],
  [["deliver", "build", "execut", "implement", "produc"], "settings"],
  [["review", "approv", "sign off", "quality check", "inspect"], "clipboard-check"],
  [["award", "accredit", "certif", "qualified", "licenced", "licensed"], "award"],
  [["experience", "year", "proven", "track record", "reliab", "depend"], "badge-check"],
  [["transparent", "honest", "clear", "no surprise", "fair"], "eye"],
  [["free", "no obligation", "quote", "estimate"], "file-text"],
  [["flexible", "bespoke", "personal", "your way", "choice", "option"], "sliders-horizontal"],
  [["result", "outcome", "impact", "success", "goal", "objective"], "target"],
  [["care", "friendly", "comfort", "welcome", "kind"], "heart"],
  [["global", "international", "worldwide", "across"], "globe"],
  [["sustain", "eco", "green", "carbon", "environment"], "leaf"],
];

/** The last resort — a neutral rotation so a grid never repeats one glyph. */
const GENERIC_CYCLE = ["circle-check", "star", "target", "zap", "shield-check", "sparkles"];

/**
 * Icon names matched as whole words, longest first, so "Cloud hosting" resolves
 * to `cloud` while "Category" never resolves to `cat`.
 */
const NAME_PHRASES: [RegExp, string][] = [...ICON_NAMES]
  .sort((a, b) => b.length - a.length)
  .map((name) => [new RegExp(`\\b${name.replace(/-/g, "[ -]")}\\b`), name]);

/**
 * Keywords are prefixes ("plumb" has to reach "plumbing"), but a prefix that
 * short is mostly noise — "pr" inside "precision", "eat" inside "treatment" —
 * so anything this brief has to be a whole word.
 */
const SHORT_KEYWORD = 3;

const hasKeyword = (haystack: string, keyword: string): boolean =>
  keyword.length > SHORT_KEYWORD
    ? haystack.includes(keyword)
    : new RegExp(`\\b${keyword}\\b`).test(haystack);

/** First keyword match against the item's own copy, else null. */
function matchIcon(text: string): string | null {
  const haystack = text.toLowerCase();
  for (const [keywords, icon] of KEYWORD_ICONS) {
    if (keywords.some((k) => hasKeyword(haystack, k))) return icon;
  }
  // A title that simply names an allowlisted icon ("Delivery", "Analytics").
  for (const [pattern, name] of NAME_PHRASES) {
    if (pattern.test(haystack)) return name;
  }
  return null;
}

/**
 * Normalizes every icon-bearing section: keeps the model's allowlisted picks,
 * fills the rest from the item's copy, and avoids repeating a glyph inside one
 * section. Mutates and returns the same blueprint.
 */
export function selectIcons(blueprint: WebsiteBlueprint): WebsiteBlueprint {
  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      const spec = getVariantSpec(section.variant);
      if (!spec?.iconField) {
        delete section.icons;
        continue;
      }

      const count = iconCount(section.variant, section.content);
      if (!count) {
        delete section.icons;
        continue;
      }

      const titles = section.content[spec.iconField];
      const bodies = section.content[bodyFieldFor(spec.iconField)];
      const proposed = section.icons ?? [];
      const icons: (string | null)[] = [];
      const used = new Set<string>();

      for (let i = 0; i < count; i++) {
        // An allowlisted name is a deliberate choice (model or editor) and is
        // kept as-is; only the gaps we fill in avoid repeating a sibling.
        const candidate = proposed[i];
        if (isIconName(candidate)) {
          used.add(candidate);
          icons.push(candidate);
          continue;
        }

        const title = Array.isArray(titles) ? (titles[i] ?? "") : "";
        const body = Array.isArray(bodies) ? (bodies[i] ?? "") : "";
        icons.push(pickUnused([matchIcon(title), matchIcon(body)], used, i));
      }

      section.icons = icons;
    }
  }

  return blueprint;
}

/** The description array that pairs with an icon field, for extra match text. */
function bodyFieldFor(iconField: string): string {
  return iconField === "stepTitles" ? "stepBodies" : "itemBodies";
}

/**
 * First unused candidate, else a generic glyph offset by position so a section
 * that matches nothing still shows variety instead of six identical ticks.
 */
function pickUnused(candidates: (string | null | undefined)[], used: Set<string>, index: number): string {
  for (const candidate of candidates) {
    if (isIconName(candidate) && !used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
  for (let offset = 0; offset < GENERIC_CYCLE.length; offset++) {
    const name = GENERIC_CYCLE[(index + offset) % GENERIC_CYCLE.length];
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  return GENERIC_CYCLE[index % GENERIC_CYCLE.length];
}
