/**
 * Single source of truth for the 15 skin concerns the model can recognise.
 * `label` must match the ML service's labels exactly.
 */
export type ConditionCategory = "acne" | "texture" | "tone" | "hydration" | "eyes" | "aging";

export interface SkinCondition {
  label: string;
  slug: string;
  name: string;
  category: ConditionCategory;
  summary: string;
  signs: string[];
  causes: string[];
  care: string[];
  seeADoctor: string;
}

export const CATEGORY_LABELS: Record<ConditionCategory, string> = {
  acne: "Breakouts & pores",
  texture: "Texture",
  tone: "Tone & pigmentation",
  hydration: "Oil & hydration",
  eyes: "Eye area",
  aging: "Fine lines",
};

export const CONDITIONS: SkinCondition[] = [
  {
    label: "HORMONAL ACNE",
    slug: "hormonal-acne",
    name: "Hormonal acne",
    category: "acne",
    summary: "Breakouts linked to hormone fluctuations, typically along the jawline, chin and lower cheeks.",
    signs: ["Deep, tender bumps on the jaw and chin", "Flare-ups that follow a monthly pattern", "Cysts that linger for days"],
    causes: ["Androgen-driven oil production", "Menstrual cycle, stress or PCOS", "Clogged follicles and inflammation"],
    care: ["Cleanse gently twice a day; don't scrub", "Use salicylic acid or benzoyl peroxide spot care", "Add a non-comedogenic moisturiser", "Avoid picking to prevent scarring"],
    seeADoctor: "Painful cysts, scarring, or acne that hasn't improved after 8–12 weeks of consistent care.",
  },
  {
    label: "BLACKHEADS",
    slug: "blackheads",
    name: "Blackheads",
    category: "acne",
    summary: "Open comedones: pores clogged with oil and dead skin that darken when exposed to air.",
    signs: ["Small dark dots, often on the nose and chin", "Slightly raised, rough feel", "No redness or pain"],
    causes: ["Excess sebum", "Build-up of dead skin cells", "Heavy or comedogenic products"],
    care: ["Use a BHA (salicylic acid) 2–3× a week", "Try a clay mask weekly", "Use a retinoid at night", "Don't squeeze, which damages pores"],
    seeADoctor: "Extensive blackheads with inflamed spots, or if over-the-counter care fails after 3 months.",
  },
  {
    label: "SEBACEOUS FILAMENTS",
    slug: "sebaceous-filaments",
    name: "Sebaceous filaments",
    category: "acne",
    summary: "Normal oil channels lining your pores that can look like grey or yellowish dots. Often mistaken for blackheads.",
    signs: ["Uniform light grey dots on nose and cheeks", "Flat, not raised", "Refill a few days after extraction"],
    causes: ["Natural sebum flow", "Oily skin type", "Larger pore size"],
    care: ["Oil cleansing or a gentle BHA can reduce their look", "Use a niacinamide serum", "Don't pore-strip or squeeze", "Accept that they're normal skin anatomy"],
    seeADoctor: "Rarely needed. Ask if you're unsure whether spots are filaments or comedones.",
  },
  {
    label: "LARGE PORES ON FACE",
    slug: "large-pores",
    name: "Enlarged pores",
    category: "texture",
    summary: "Visible pore openings, most common in the T-zone, influenced by genetics, oil and loss of elasticity.",
    signs: ["Visible openings on nose, cheeks and forehead", "Makeup settling into pores", "Often accompanies oily skin"],
    causes: ["Genetics and high sebum output", "Sun damage reducing skin firmness", "Clogged pores stretching the opening"],
    care: ["Keep pores clear with BHA", "Niacinamide can refine their appearance", "Use a retinoid to support collagen", "Wear SPF daily"],
    seeADoctor: "Consider a dermatologist for in-office options (peels, lasers) if they bother you.",
  },
  {
    label: "ROUGH TEXTURE ON FACE",
    slug: "rough-texture",
    name: "Rough texture",
    category: "texture",
    summary: "Uneven, bumpy or sandpapery skin, often from slow cell turnover, dryness or past breakouts.",
    signs: ["Skin feels uneven to the touch", "Makeup looks patchy", "Tiny bumps without redness"],
    causes: ["Dead skin build-up", "Dehydration", "Sun damage or past acne"],
    care: ["Exfoliate with AHA/BHA 2–3× a week, not daily", "Moisturise with ceramides", "Introduce a retinoid slowly", "Daily sunscreen"],
    seeADoctor: "Persistent bumps that itch, spread or don't respond to exfoliation (could be another condition).",
  },
  {
    label: "RAZOR BUMPS",
    slug: "razor-bumps",
    name: "Razor bumps",
    category: "texture",
    summary: "Small inflamed bumps from hairs curling back into the skin after shaving (pseudofolliculitis barbae).",
    signs: ["Red or dark bumps in the beard area", "Itching or tenderness after shaving", "Visible ingrown hairs"],
    causes: ["Close shaving or shaving against the grain", "Curly or coarse hair", "Dull blades and friction"],
    care: ["Shave with the grain using a sharp single blade", "Soften hair with warm water first", "Use a gentle exfoliant between shaves", "Try trimming instead of close shaving"],
    seeADoctor: "Pus-filled bumps, keloid-like scarring, or frequent infections.",
  },
  {
    label: "DARK SPOTS ON FACE",
    slug: "dark-spots",
    name: "Dark spots",
    category: "tone",
    summary: "Patches of hyperpigmentation from sun exposure, post-acne marks or hormonal changes.",
    signs: ["Flat brown or grey patches", "Marks left after spots heal", "Spots that darken in summer"],
    causes: ["UV exposure", "Post-inflammatory hyperpigmentation", "Hormones (melasma)"],
    care: ["Broad-spectrum SPF 30+ every day; this matters most", "Vitamin C in the morning", "Niacinamide, azelaic acid or retinoids", "Be patient: fading takes 8–12 weeks"],
    seeADoctor: "A spot that changes shape, colour or size, bleeds, or looks different from the rest.",
  },
  {
    label: "FACE REDNESS",
    slug: "face-redness",
    name: "Facial redness",
    category: "tone",
    summary: "Flushing or persistent redness that can come from sensitivity, irritation or rosacea.",
    signs: ["Red cheeks, nose or chin", "Stinging with some products", "Visible small blood vessels"],
    causes: ["Irritated or compromised skin barrier", "Rosacea triggers (heat, spicy food, alcohol)", "Over-exfoliation"],
    care: ["Simplify your routine to gentle basics", "Look for centella, azelaic acid or niacinamide", "Use mineral sunscreen", "Avoid hot water and harsh scrubs"],
    seeADoctor: "Persistent redness with bumps, burning, or eye irritation (possible rosacea).",
  },
  {
    label: "DULL SKIN",
    slug: "dull-skin",
    name: "Dull skin",
    category: "tone",
    summary: "Skin that looks tired or lacks radiance, often due to dead-cell build-up, dehydration or lifestyle.",
    signs: ["Lack of glow", "Uneven or greyish tone", "Rough feel"],
    causes: ["Slow cell turnover", "Dehydration", "Poor sleep or sun damage"],
    care: ["Gentle chemical exfoliation weekly", "Vitamin C serum in the morning", "Hydrating serum (hyaluronic acid)", "Sleep, water and SPF"],
    seeADoctor: "Sudden dullness with other symptoms like fatigue or skin colour changes.",
  },
  {
    label: "OILY SKIN",
    slug: "oily-skin",
    name: "Oily skin",
    category: "hydration",
    summary: "Overactive oil glands leave skin shiny and can contribute to clogged pores.",
    signs: ["Shine within hours of washing", "Visible pores", "Makeup slides off"],
    causes: ["Genetics and hormones", "Humid climate", "Over-washing which triggers more oil"],
    care: ["Gentle gel cleanser twice daily", "Lightweight, oil-free moisturiser (don't skip it)", "Niacinamide to balance oil", "Blotting papers during the day"],
    seeADoctor: "Oiliness with persistent acne or sudden change in oil production.",
  },
  {
    label: "DRY SKIN",
    slug: "dry-skin",
    name: "Dry skin",
    category: "hydration",
    summary: "Skin that lacks oil and moisture, feeling tight, flaky or rough.",
    signs: ["Tightness after washing", "Flaking or dull patches", "Fine lines look more visible"],
    causes: ["Weakened skin barrier", "Cold or dry air, hot showers", "Harsh cleansers"],
    care: ["Cream cleanser and lukewarm water", "Moisturiser with ceramides and glycerin", "Apply on damp skin", "Use a humidifier in dry months"],
    seeADoctor: "Cracking, bleeding, intense itch or red scaly patches (could be eczema or dermatitis).",
  },
  {
    label: "DARK CIRCLES ON FACE",
    slug: "dark-circles",
    name: "Dark circles",
    category: "eyes",
    summary: "Darker under-eye skin from pigmentation, thin skin showing blood vessels, or shadows.",
    signs: ["Brown, blue or purple tone under eyes", "Worse when tired", "Can run in families"],
    causes: ["Genetics and thin under-eye skin", "Lack of sleep or allergies", "Pigmentation and sun exposure"],
    care: ["Eye cream with caffeine or vitamin C", "SPF and sunglasses", "Treat allergies and sleep 7–9 h", "Cold compress in the morning"],
    seeADoctor: "Sudden darkening, swelling, or circles on one side only.",
  },
  {
    label: "EYE BAGS",
    slug: "eye-bags",
    name: "Under-eye bags",
    category: "eyes",
    summary: "Puffiness below the eyes from fluid retention, ageing or genetics.",
    signs: ["Swelling under the eyes", "Worse in the morning", "Loose or sagging skin"],
    causes: ["Fluid retention (salt, sleep position)", "Weakened supporting tissue with age", "Allergies"],
    care: ["Sleep with head slightly elevated", "Cool compress or chilled spoons", "Reduce late-night salt and alcohol", "Caffeine eye products"],
    seeADoctor: "Swelling that's severe, persistent, painful, or comes with vision changes.",
  },
  {
    label: "UNDER-EYE WRINKLES",
    slug: "under-eye-wrinkles",
    name: "Under-eye wrinkles",
    category: "aging",
    summary: "Fine lines and crow's feet around the eyes, where skin is thinnest.",
    signs: ["Fine lines when smiling", "Crepey texture", "Lines visible at rest"],
    causes: ["Natural collagen loss", "Sun exposure", "Repeated expressions and dehydration"],
    care: ["Daily SPF and sunglasses", "Gentle retinoid eye cream (start slowly)", "Peptide or hyaluronic acid eye cream", "Moisturise morning and night"],
    seeADoctor: "A dermatologist can discuss prescription retinoids or in-office treatments.",
  },
  {
    label: "FOREHEAD WRINKLES",
    slug: "forehead-wrinkles",
    name: "Forehead lines",
    category: "aging",
    summary: "Horizontal lines from repeated expressions and natural loss of collagen and elasticity.",
    signs: ["Horizontal lines when raising eyebrows", "Lines visible at rest over time"],
    causes: ["Repeated facial expressions", "Collagen loss with age", "Sun damage"],
    care: ["SPF every day", "Retinoid at night", "Hydrating serum and moisturiser", "Antioxidant serum in the morning"],
    seeADoctor: "For deeper lines, a dermatologist can advise on prescription or in-office options.",
  },
];

const byLabel = new Map(CONDITIONS.map((c) => [c.label, c]));
const bySlug = new Map(CONDITIONS.map((c) => [c.slug, c]));

export function getConditionByLabel(label: string): SkinCondition | undefined {
  return byLabel.get(label);
}

export function getConditionBySlug(slug: string): SkinCondition | undefined {
  return bySlug.get(slug);
}

/** Display name for a model label, even if it's not in our content table. */
export function conditionName(label: string): string {
  return byLabel.get(label)?.name ?? label.charAt(0) + label.slice(1).toLowerCase();
}

export type ConfidenceBand = "likely" | "possible" | "unlikely";

/** Raw softmax percentages look falsely precise to users; show a qualitative band instead. */
export function confidenceBand(confidence: number): ConfidenceBand {
  if (confidence >= 0.5) return "likely";
  if (confidence >= 0.2) return "possible";
  return "unlikely";
}

export const BAND_COPY: Record<ConfidenceBand, { label: string; hint: string }> = {
  likely: { label: "Likely", hint: "The model is fairly confident about this one." },
  possible: { label: "Possible", hint: "Some signs detected. Worth keeping an eye on." },
  unlikely: { label: "Low signal", hint: "Only a weak signal. Treat it as a maybe." },
};
