const BASE = "http://localhost:3000";

const DATA: { name: string; summary: string; category: string; metadata: Record<string, unknown> }[] = [
  {
    name: "Thailand retirement visa",
    summary:
      "The Thailand Non-Immigrant O-A retirement visa is available to expats aged 50 and over. Requires 800,000 THB in a Thai bank account or a monthly pension of 65,000 THB. Valid for one year and renewable annually.",
    category: "visa",
    metadata: { type: "visa", age: "50+", validity: "1 year", budget: "800,000 THB" },
  },
  {
    name: "Thailand elite visa",
    summary:
      "The Thailand Elite Privilege Card offers 5, 10, or 20-year visas for a fee starting around 600,000 THB. Includes fast-track airport service, 90-day reporting waivers, and various lifestyle perks.",
    category: "visa",
    metadata: { type: "visa", validity: "5-20 years", cost: "600,000+ THB" },
  },
  {
    name: "Cost of living in Bangkok",
    summary:
      "A single expat can live comfortably in Bangkok for roughly 35,000 to 60,000 THB per month. Rent for a modern 1-bedroom condo in the city center ranges from 15,000 to 25,000 THB monthly.",
    category: "cost of living",
    metadata: { city: "Bangkok", monthlyBudget: "35,000-60,000 THB" },
  },
  {
    name: "Renting a condo in Chiang Mai",
    summary:
      "Chiang Mai offers affordable long-stay condo rentals. A furnished 1-bedroom unit typically costs 8,000 to 15,000 THB per month, with utilities and high-speed internet usually extra.",
    category: "cost of living",
    metadata: { city: "Chiang Mai", monthlyRent: "8,000-15,000 THB" },
  },
  {
    name: "Public hospitals in Thailand",
    summary:
      "Thailand has an excellent private healthcare system with international hospitals in Bangkok such as Bumrungrad and Samitivej. Many expats combine local private insurance with international health coverage.",
    category: "healthcare",
    metadata: { type: "healthcare", notableHospitals: ["Bumrungrad", "Samitivej"] },
  },
  {
    name: "Health insurance for expats",
    summary:
      "Expat health insurance in Thailand costs roughly 30,000 to 80,000 THB per year depending on age and coverage level. Policies typically cover inpatient and outpatient care at private hospitals.",
    category: "healthcare",
    metadata: { type: "insurance", annualPremium: "30,000-80,000 THB" },
  },
  {
    name: "Thai street food",
    summary:
      "Street food in Thailand is cheap, delicious, and everywhere. Pad Thai, som tam, and green curry cost between 40 and 80 THB per plate at markets like Bangkok's Chatuchak and Yaowarat.",
    category: "food",
    metadata: { type: "food", pricePerPlate: "40-80 THB", spots: ["Chatuchak", "Yaowarat"] },
  },
  {
    name: "Thai language basics",
    summary:
      "Learning basic Thai helps expats tremendously. Useful phrases include sawasdee (hello), kop khun (thank you), and tao rai (how much). Thai is a tonal language with five tones.",
    category: "language",
    metadata: { type: "language", difficulty: "tonal language" },
  },
  {
    name: "Getting around Bangkok",
    summary:
      "Bangkok's BTS Skytrain and MRT subway are the fastest ways to get around, with fares from 16 THB. Grab ridesharing is widely available, and motorbike taxis are handy for short trips.",
    category: "transport",
    metadata: { city: "Bangkok", modes: ["BTS", "MRT", "Grab"] },
  },
  {
    name: "Opening a bank account",
    summary:
      "Expats can open a Thai bank account with a valid passport, visa, and work permit or proof of residence. Top banks include Bangkok Bank, Kasikorn, and SCB. A non-immigrant visa is usually required.",
    category: "lifestyle",
    metadata: { type: "banking", banks: ["Bangkok Bank", "Kasikorn", "SCB"] },
  },
  {
    name: "Island hopping in the south",
    summary:
      "Thailand's southern islands like Phuket, Koh Samui, and Krabi offer stunning beaches and warm weather year-round. Ferry connections make island hopping easy between November and April.",
    category: "travel",
    metadata: { type: "travel", islands: ["Phuket", "Koh Samui", "Krabi"] },
  },
  {
    name: "Thailand weather and seasons",
    summary:
      "Thailand has three seasons: cool (Nov-Feb), hot (Mar-May), and rainy (Jun-Oct). The cool season is the most pleasant for expats, while the hot season in April can exceed 40°C.",
    category: "lifestyle",
    metadata: { type: "weather", seasons: ["cool", "hot", "rainy"] },
  },
];

async function main() {
  for (const item of DATA) {
    const embedRes = await fetch(`${BASE}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: [item.summary] }),
    });
    const embedData = await embedRes.json();
    if (!embedRes.ok) throw new Error(embedData.error);

    const res = await fetch(`${BASE}/api/vectors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, embedding: embedData.embeddings[0] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    console.log(`inserted: ${item.name}`);
  }
  console.log(`Done. Inserted ${DATA.length} items.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
