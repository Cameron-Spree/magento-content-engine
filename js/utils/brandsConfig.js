/**
 * Lawsons Group Multi-Brand Configuration for Magento 2 (Amasty Blog Pro)
 * Authentic brand palettes, button styles, store view codes, and internal links banks
 * derived directly from live store designs:
 * 0. All Store Views (Default Global Scope)
 * 1. Lawsons (lawsons.co.uk)
 * 2. AVS Fencing & Landscaping Supplies (avsfencing.co.uk)
 * 3. Oxford Fencing Supplies (oxfordfencing.co.uk)
 * 4. Witham Timber (withamtimber.co.uk)
 * 5. The Landscape Centre (the-landscape-centre.co.uk)
 */

export const ALL_STORE_SCOPE = {
  id: "all",
  name: "All Store Views",
  fullName: "All Store Views (Global / Default Scope)",
  storeCode: "default",
  storeId: 0,
  domain: "https://www.lawsons.co.uk",
  blogSubpath: "/blog/",
  mediaPath: "/media/wysiwyg/blog/",
  tagline: "Global Master Configuration & Common Metadata (Categories, Author, Tags, Master Title)",
  tone: "Master trade & merchant authority encompassing all group brands",
  palette: {
    primary: "#0f172a",          // Modern Slate Charcoal
    primaryDark: "#020617",
    secondary: "#38bdf8",        // Apple Sky Blue Accent
    secondaryText: "#ffffff",
    headerBg: "#0f172a",
    headerTopStrip: "#38bdf8",
    footerBg: "#0f172a",
    surfaceTint: "#f1f5f9",
    borderTint: "#cbd5e1",
    badgeBg: "#2563eb",
    textMain: "#0f172a"
  },
  ctaDefaults: {
    heading: "Explore Quality Timber, Fencing & Landscaping Across Lawsons Group",
    subtext: "Browse our extensive trade & retail inventory across our branch network in London and the South East.",
    primaryBtnText: "Explore Range",
    primaryBtnUrl: "https://www.lawsons.co.uk/fencing-supplies",
    secondaryBtnText: "Find a Branch",
    secondaryBtnUrl: "https://www.lawsons.co.uk/branch-locator"
  },
  linksBank: [
    { url: "https://www.lawsons.co.uk/fencing-supplies", label: "Fencing Supplies" },
    { url: "https://www.lawsons.co.uk/landscaping-supplies", label: "Landscaping Supplies" },
    { url: "https://www.lawsons.co.uk/timber-and-sheet-materials", label: "Timber & Sheet Materials" }
  ]
};

export const BRANDS = {
  lawsons: {
    id: "lawsons",
    name: "Lawsons",
    fullName: "Lawsons Timber, Building & Fencing",
    storeCode: "lawsons_en",
    storeId: 1,
    domain: "https://www.lawsons.co.uk",
    blogSubpath: "/blog/",
    mediaPath: "/media/wysiwyg/blog/lawsons/",
    tagline: "The largest independent Timber, Building Materials & Fencing merchants in London and the South East.",
    tone: "Authoritative, trade-friendly & homeowner-accessible merchant expertise across London & the South East",
    palette: {
      primary: "#008a2e",        // Authentic Lawsons Kelly Green
      primaryDark: "#006822",
      secondary: "#ffdd00",      // Authentic Lawsons Vivid Yellow
      secondaryText: "#111827",
      headerBg: "#008a2e",
      headerTopStrip: "#ffdd00",
      footerBg: "#2d3134",
      surfaceTint: "#f0fdf4",
      borderTint: "#bbf7d0",
      badgeBg: "#dc2626",        // Price Drop Red
      textMain: "#1f2937"
    },
    ctaDefaults: {
      heading: "Shop Quality Timber, Fencing & Building Materials at Lawsons",
      subtext: "Order online for fast delivery across London and the South East, or click & collect from your local Lawsons branch.",
      primaryBtnText: "Explore Fencing & Timber",
      primaryBtnUrl: "https://www.lawsons.co.uk/fencing-supplies",
      secondaryBtnText: "Find Your Nearest Branch",
      secondaryBtnUrl: "https://www.lawsons.co.uk/branch-locator"
    },
    linksBank: [
      { url: "https://www.lawsons.co.uk/fencing-supplies", label: "Fencing Supplies & Fence Panels" },
      { url: "https://www.lawsons.co.uk/fencing-supplies/fence-panels", label: "Timber Fence Panels" },
      { url: "https://www.lawsons.co.uk/fencing-supplies/concrete-fencing", label: "Concrete Fence Posts & Gravel Boards" },
      { url: "https://www.lawsons.co.uk/landscaping-supplies", label: "Landscaping Supplies" },
      { url: "https://www.lawsons.co.uk/landscaping-supplies/railway-sleepers", label: "Softwood & Oak Railway Sleepers" },
      { url: "https://www.lawsons.co.uk/landscaping-supplies/decking", label: "Timber & Composite Decking" },
      { url: "https://www.lawsons.co.uk/landscaping-supplies/paving-and-patio", label: "Natural Stone & Porcelain Paving" },
      { url: "https://www.lawsons.co.uk/garden-buildings", label: "Sheds & Garden Buildings" },
      { url: "https://www.lawsons.co.uk/timber-and-sheet-materials", label: "Timber & Sheet Materials" },
      { url: "https://www.lawsons.co.uk/building-roofing-and-drainage", label: "Building, Roofing & Drainage" },
      { url: "https://www.lawsons.co.uk/insulation-and-drylining", label: "Insulation & Drylining" }
    ]
  },

  avs: {
    id: "avs",
    name: "AVS Fencing",
    fullName: "AVS Fencing & Landscaping Supplies",
    storeCode: "avs_en",
    storeId: 2,
    domain: "https://www.avsfencing.co.uk",
    blogSubpath: "/blog/",
    mediaPath: "/media/wysiwyg/blog/avs/",
    tagline: "Specialist Fencing, Railway Sleepers & Landscaping Supplies for Trade and DIY.",
    tone: "Specialist outdoor landscaping & fencing authority, practical, design-conscious and durable",
    palette: {
      primary: "#3e5b82",        // Authentic AVS Slate Indigo Blue
      primaryDark: "#2c4363",
      secondary: "#7a6248",      // Authentic AVS Earthy Timber Brown
      secondaryText: "#ffffff",
      headerBg: "#333333",       // Authentic AVS Charcoal Header
      headerTopStrip: "#3e5b82",
      footerBg: "#3e5b82",
      surfaceTint: "#f5f3ef",    // Warm Timber Cream Tint
      borderTint: "#d6cec2",
      badgeBg: "#3e5b82",
      textMain: "#262626"
    },
    ctaDefaults: {
      heading: "Transform Your Garden with AVS Fencing & Landscaping",
      subtext: "From contemporary slatted fence panels and railway sleepers to premium decking and paving — available for nationwide & local delivery.",
      primaryBtnText: "Shop Fencing & Sleepers",
      primaryBtnUrl: "https://www.avsfencing.co.uk/fencing",
      secondaryBtnText: "View Landscaping Range",
      secondaryBtnUrl: "https://www.avsfencing.co.uk/landscaping"
    },
    linksBank: [
      { url: "https://www.avsfencing.co.uk/fencing", label: "AVS Fencing Panels & Posts" },
      { url: "https://www.avsfencing.co.uk/fencing/fence-panels", label: "Contemporary & Traditional Fence Panels" },
      { url: "https://www.avsfencing.co.uk/landscaping/sleepers", label: "Green & Brown Treated Railway Sleepers" },
      { url: "https://www.avsfencing.co.uk/landscaping/decking", label: "Timber & Composite Garden Decking" },
      { url: "https://www.avsfencing.co.uk/landscaping/paving", label: "Garden Paving & Patio Slabs" },
      { url: "https://www.avsfencing.co.uk/fencing/gates", label: "Wooden Garden & Driveway Gates" },
      { url: "https://www.avsfencing.co.uk/garden/garden-buildings", label: "Garden Sheds & Outdoor Structures" },
      { url: "https://www.avsfencing.co.uk/garden-tools", label: "Fencing Tools, Postcrete & Fixings" }
    ]
  },

  oxford: {
    id: "oxford",
    name: "Oxford Fencing",
    fullName: "Oxford Fencing Supplies",
    storeCode: "oxford_en",
    storeId: 3,
    domain: "https://www.oxfordfencing.co.uk",
    blogSubpath: "/blog/",
    mediaPath: "/media/wysiwyg/blog/oxford/",
    tagline: "Established in 1986 — Specialist Timber, Fencing, Gates & Decking Merchants.",
    tone: "Trusted regional fencing craftsman & outdoor timber specialist with clear, helpful installation advice",
    palette: {
      primary: "#0f3b68",        // Authentic Oxford Deep Navy Blue
      primaryDark: "#092646",
      secondary: "#4cc3ff",      // Authentic Oxford Sky Cyan Button Accent
      secondaryText: "#ffffff",
      headerBg: "#0085ca",       // Authentic Oxford Cerulean Nav Bar
      headerTopStrip: "#0f3b68",
      footerBg: "#0085ca",
      surfaceTint: "#f0f9ff",
      borderTint: "#bae6fd",
      badgeBg: "#d32f2f",
      textMain: "#1e293b"
    },
    ctaDefaults: {
      heading: "Built for Oxfordshire Gardens — Explore Oxford Fencing Supplies",
      subtext: "Pressure-treated lap panels, closeboard fencing, heavy-duty posts, and railway sleepers delivered straight to your door.",
      primaryBtnText: "Browse Lap & Closeboard Panels",
      primaryBtnUrl: "https://www.oxfordfencing.co.uk/fence-panels",
      secondaryBtnText: "Shop Fence Posts & Fixings",
      secondaryBtnUrl: "https://www.oxfordfencing.co.uk/fence-posts"
    },
    linksBank: [
      { url: "https://www.oxfordfencing.co.uk/fence-panels", label: "Pressure Treated Fence Panels" },
      { url: "https://www.oxfordfencing.co.uk/closeboard-fencing", label: "Closeboard Fencing & Feather Edge" },
      { url: "https://www.oxfordfencing.co.uk/fence-posts", label: "Timber & Concrete Fence Posts" },
      { url: "https://www.oxfordfencing.co.uk/gates", label: "Timber Garden & Side Gates" },
      { url: "https://www.oxfordfencing.co.uk/specialist-fencing", label: "Trellis, Picket & Specialist Fencing" },
      { url: "https://www.oxfordfencing.co.uk/landscaping-supplies", label: "Railway Sleepers & Landscaping" },
      { url: "https://www.oxfordfencing.co.uk/timber-decking", label: "Pressure Treated Timber Decking" },
      { url: "https://www.oxfordfencing.co.uk/tools-and-fixings", label: "Post Mix, Brackets & Fencing Fixings" }
    ]
  },

  witham: {
    id: "witham",
    name: "Witham Timber",
    fullName: "Witham Timber — Fencing & Timber Merchants",
    storeCode: "witham_en",
    storeId: 4,
    domain: "https://www.withamtimber.co.uk",
    blogSubpath: "/blog/",
    mediaPath: "/media/wysiwyg/blog/witham/",
    tagline: "Manufactured on Site. Built Here. Built to Last — Over 30 Years of Timber Experience.",
    tone: "Direct manufacturer pride, heavy-duty timber quality, practical durability and value",
    palette: {
      primary: "#19325c",        // Authentic Witham Deep Navy
      primaryDark: "#10213f",
      secondary: "#0076a8",      // Authentic Witham Ocean Blue
      secondaryText: "#ffffff",
      headerBg: "#0076a8",
      headerTopStrip: "#19325c",
      footerBg: "#1f4e78",
      surfaceTint: "#f1f5f9",
      borderTint: "#cbd5e1",
      badgeBg: "#c92a2a",        // Special Offers Red
      textMain: "#1e293b"
    },
    ctaDefaults: {
      heading: "Manufactured On Site — Heavy-Duty Timber & Fencing from Witham Timber",
      subtext: "High-quality, fully framed fence panels, railway sleepers, and concrete fencing manufactured to last.",
      primaryBtnText: "Shop Timber Fencing",
      primaryBtnUrl: "https://www.withamtimber.co.uk/timber-fencing",
      secondaryBtnText: "View Railway Sleepers",
      secondaryBtnUrl: "https://www.withamtimber.co.uk/railway-sleepers"
    },
    linksBank: [
      { url: "https://www.withamtimber.co.uk/timber-fencing", label: "Heavy-Duty Timber Fencing" },
      { url: "https://www.withamtimber.co.uk/fence-panels-and-trellis", label: "Fence Panels & Garden Trellis" },
      { url: "https://www.withamtimber.co.uk/concrete-fencing", label: "Concrete Fence Posts & Gravel Boards" },
      { url: "https://www.withamtimber.co.uk/gates-and-ironmongery", label: "Timber Gates & Gate Ironmongery" },
      { url: "https://www.withamtimber.co.uk/railway-sleepers", label: "Softwood & Hardwood Railway Sleepers" },
      { url: "https://www.withamtimber.co.uk/decking", label: "Garden Decking Boards & Balustrades" },
      { url: "https://www.withamtimber.co.uk/aggregates", label: "Decorative Aggregates & Sub-Base" },
      { url: "https://www.withamtimber.co.uk/paving", label: "Patio Paving & Landscaping Slabs" }
    ]
  },

  landscape: {
    id: "landscape",
    name: "The Landscape Centre",
    fullName: "The Landscape Centre",
    storeCode: "landscape_en",
    storeId: 5,
    domain: "https://the-landscape-centre.co.uk",
    blogSubpath: "/blog/",
    mediaPath: "/media/wysiwyg/blog/landscape/",
    tagline: "Specialist Bulk Aggregates, Topsoil, Paving, Turf & Landscaping Supplies.",
    tone: "Groundworks, garden design & hard-landscaping specialist with accurate coverage and sub-base advice",
    palette: {
      primary: "#2d6a4f",        // Botanical Landscape Green
      primaryDark: "#1b4332",
      secondary: "#b5835a",      // Warm Stone / Aggregate Ochre
      secondaryText: "#ffffff",
      headerBg: "#1b4332",
      headerTopStrip: "#b5835a",
      footerBg: "#1b4332",
      surfaceTint: "#f2f9f5",
      borderTint: "#b7e4c7",
      badgeBg: "#d97706",
      textMain: "#1f2937"
    },
    ctaDefaults: {
      heading: "Start Your Groundworks & Garden Project with The Landscape Centre",
      subtext: "Bulk bags of aggregates, screened topsoil, natural stone paving, sleepers, and fresh turf delivered on time.",
      primaryBtnText: "Explore Aggregates & Topsoil",
      primaryBtnUrl: "https://the-landscape-centre.co.uk/aggregates",
      secondaryBtnText: "Browse Paving & Sleepers",
      secondaryBtnUrl: "https://the-landscape-centre.co.uk/paving"
    },
    linksBank: [
      { url: "https://the-landscape-centre.co.uk/aggregates", label: "Bulk Aggregates, Ballast & MOT Type 1" },
      { url: "https://the-landscape-centre.co.uk/topsoil-and-bark", label: "Screened Topsoil, Compost & Bark Mulch" },
      { url: "https://the-landscape-centre.co.uk/paving", label: "Natural Stone & Porcelain Patio Paving" },
      { url: "https://the-landscape-centre.co.uk/decorative-stones", label: "Decorative Gravel, Slate & Chippings" },
      { url: "https://the-landscape-centre.co.uk/sleepers", label: "Landscaping Railway Sleepers" },
      { url: "https://the-landscape-centre.co.uk/turf-and-grass", label: "Fresh Lawn Turf & Artificial Grass" }
    ]
  }
};

export const BRAND_LIST = Object.values(BRANDS);
export const ALL_SCOPES_LIST = [ALL_STORE_SCOPE, ...BRAND_LIST];

export function getBrandById(brandId) {
  if (brandId === "all") return ALL_STORE_SCOPE;
  return BRANDS[brandId] || BRANDS.lawsons;
}
