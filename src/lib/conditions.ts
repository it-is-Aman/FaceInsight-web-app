export interface SkinCondition {
    slug: string;
    name: string;
    description: string;
    symptoms: string[];
    recommendations: string[];
}

export const skinConditions: SkinCondition[] = [
    {
        slug: 'acne',
        name: 'Acne',
        description: 'A common skin condition that occurs when hair follicles become plugged with oil and dead skin cells. It causes whiteheads, blackheads or pimples.',
        symptoms: [
            'Whiteheads (closed plugged pores)',
            'Blackheads (open plugged pores)',
            'Small red, tender bumps (papules)',
            'Pimples (pustules), which are papules with pus at their tips'
        ],
        recommendations: [
            'Wash your face twice a day with a gentle cleanser',
            'Avoid touching or picking at pimples',
            'Use non-comedogenic skincare products',
            'Keep your hair clean and off your face'
        ]
    },
    {
        slug: 'eczema',
        name: 'Eczema (Atopic Dermatitis)',
        description: 'A condition that makes your skin red and itchy. It is common in children but can occur at any age. It is long-lasting (chronic) and tends to flare periodically.',
        symptoms: [
            'Dry skin',
            'Itching, which may be severe, especially at night',
            'Red to brownish-gray patches',
            'Small, raised bumps, which may leak fluid and crust over when scratched'
        ],
        recommendations: [
            'Moisturize your skin at least twice a day',
            'Try to identify and avoid triggers that worsen the condition',
            'Take shorter baths or showers (10 to 15 minutes)',
            'Use gentle soaps'
        ]
    },
    {
        slug: 'psoriasis',
        name: 'Psoriasis',
        description: 'A skin disease that causes red, itchy scaly patches, most commonly on the knees, elbows, trunk and scalp.',
        symptoms: [
            'Red patches of skin covered with thick, silvery scales',
            'Small scaling spots (commonly seen in children)',
            'Dry, cracked skin that may bleed or itch',
            'Itching, burning or soreness'
        ],
        recommendations: [
            'Keep your skin moist',
            'Avoid triggers like stress and smoking',
            'Get a small amount of sunlight',
            'Follow a healthy lifestyle'
        ]
    },
    {
        slug: 'rosacea',
        name: 'Rosacea',
        description: 'A common skin condition that causes blushing or flushing and visible blood vessels in your face. It may also produce small, pus-filled bumps.',
        symptoms: [
            'Facial flushing or redness',
            'Visible small blood vessels',
            'Swollen, red bumps',
            'Eye problems (dry, irritated, swollen eyes)'
        ],
        recommendations: [
            'Protect your face from the sun',
            'Treat your skin gently',
            'Avoid triggers like spicy foods, alcohol, and extreme temperatures',
            'Use soothing skincare products'
        ]
    },
    {
        slug: 'melasma',
        name: 'Melasma',
        description: 'A common skin problem that causes brown to gray-brown patches, usually on the face. Most people get it on their cheeks, bridge of their nose, forehead, chin, and above their upper lip.',
        symptoms: [
            'Brown or gray-brown patches on the face',
            'Patches are usually symmetrical',
            'Commonly appears on cheeks, forehead, and upper lip'
        ],
        recommendations: [
            'Wear sunscreen every day',
            'Wear a wide-brimmed hat when outside',
            'Use gentle skincare products',
            'Avoid waxing areas with melasma'
        ]
    }
];

export function getConditionBySlug(slug: string): SkinCondition | undefined {
    return skinConditions.find(c => c.slug === slug);
}
