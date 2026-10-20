/**
 * Sample Multi-Brand Data for Magento Content Engine (Lawsons Group Edition)
 * Pre-loaded with authentic 5-Brand Store View Variations (Lawsons, AVS, Oxford, Witham, Landscape Centre)
 * so you can preview how each brand's storefront chrome, buttons, tables, and CTAs render live.
 */

import { BRANDS } from "./brandsConfig.js";

export const DEFAULT_SITE_SETTINGS = {
  magentoBaseUrl: "https://www.lawsons.co.uk",
  magentoBearerToken: "",
  magentoMediaFolder: "/media/wysiwyg/blog/",
  geminiApiKey: "",
  includeScopedCssInCopy: true,
  brandLinksBank: {
    lawsons: [...BRANDS.lawsons.linksBank],
    avs: [...BRANDS.avs.linksBank],
    oxford: [...BRANDS.oxford.linksBank],
    witham: [...BRANDS.witham.linksBank],
    landscape: [...BRANDS.landscape.linksBank]
  }
};

export const SAMPLE_IMAGE_POOL = [
  {
    id: "img_sample_1",
    title: "Pressure Treated Closeboard & Slatted Timber Fencing",
    filename: "pressure-treated-timber-fencing-panels.jpg",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    previewUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    magentoPath: "/media/wysiwyg/blog/pressure-treated-timber-fencing-panels.jpg",
    tags: ["fencing", "fence panels", "timber fence", "closeboard", "slatted"]
  },
  {
    id: "img_sample_2",
    title: "Green Treated Softwood & Oak Railway Sleepers Raised Bed",
    filename: "green-treated-railway-sleepers-raised-bed.jpg",
    url: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1200&q=80",
    previewUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1200&q=80",
    magentoPath: "/media/wysiwyg/blog/green-treated-railway-sleepers-raised-bed.jpg",
    tags: ["railway sleepers", "sleepers", "raised bed", "landscaping", "retaining wall"]
  },
  {
    id: "img_sample_3",
    title: "Natural Stone Patio Paving & Decorative Aggregates",
    filename: "natural-stone-patio-paving-aggregates.jpg",
    url: "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=1200&q=80",
    previewUrl: "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=1200&q=80",
    magentoPath: "/media/wysiwyg/blog/natural-stone-patio-paving-aggregates.jpg",
    tags: ["paving", "aggregates", "patio", "gravel", "sub-base"]
  }
];

export const SAMPLE_POST_PAYLOADS = [
  {
    title: "Concrete vs Timber Fence Posts Guide",
    slug: "concrete-vs-timber-fence-posts",
    categories: ["Fencing Guides", "Garden Advice"],
    tags: ["fence-posts", "concrete-fencing", "timber-fencing", "gravel-boards"],
    short_content: "Compare UC4 pressure-treated timber fence posts against steel-reinforced slotted concrete posts for wind resistance, lifespan, and aesthetics.",
    meta_title: "Concrete vs Timber Fence Posts Buying Guide",
    meta_description: "Discover whether slotted concrete fence posts or UC4 pressure-treated timber posts are right for your garden fence installation.",
    image_placeholders: ["timber fence", "paving"],
    content_html: `<p>Choosing the right fence post is the most critical structural decision in any boundary project. While fence panels can be swapped out in minutes, the posts carry the full wind load and sit directly in damp ground contact year-round.</p>
<h2>1. Slotted Concrete vs UC4 Pressure-Treated Timber Posts</h2>
<p>Modern garden fencing generally comes down to two proven options: steel-reinforced wet-cast concrete posts or UC4 kiln-dried, pressure-treated timber posts. Explore our full <a href="https://www.lawsons.co.uk/fencing-supplies">Fencing Supplies & Fence Panels</a> range to compare profiles side by side.</p>
{{IMAGE:timber fence}}
<h2>2. Technical Specification & Lifespan Comparison</h2>
<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Slotted Concrete Posts</th>
      <th>UC4 Treated Timber Posts</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Expected Lifespan</strong></td>
      <td>25+ Years (Zero ground rot)</td>
      <td>15 Years (With UC4 treatment & post saver)</td>
    </tr>
    <tr>
      <td><strong>Panel Replacement</strong></td>
      <td>Slide panels straight out of slots</td>
      <td>Unscrew brackets or clips</td>
    </tr>
    <tr>
      <td><strong>Aesthetic Finish</strong></td>
      <td>Clean architectural grey or recessed</td>
      <td>Natural warm timber blend</td>
    </tr>
  </tbody>
</table>
<div class="mce-product-grid">
  <div class="mce-product-card">
    <div>
      <h5>Slotted Concrete Posts & Gravel Boards</h5>
      <p>Steel-reinforced wet-cast concrete for maximum wind resistance and zero ground moisture decay.</p>
    </div>
    <a href="https://www.lawsons.co.uk/fencing-supplies/concrete-fencing" class="mce-btn-primary">Shop Concrete Fencing &rarr;</a>
  </div>
  <div class="mce-product-card">
    <div>
      <h5>Heavy-Duty Timber Fence Panels</h5>
      <p>Pressure-treated lap, closeboard, and decorative slatted fence panels in standard 6ft widths.</p>
    </div>
    <a href="https://www.lawsons.co.uk/fencing-supplies/fence-panels" class="mce-btn-secondary">View Fence Panels</a>
  </div>
</div>
<div class="category-spotlight-box">
  <h3>Shop Quality Timber, Fencing & Building Materials at Lawsons</h3>
  <p>Order online for fast delivery across London and the South East, or click & collect from your local Lawsons branch.</p>
  <div class="mce-btn-row">
    <a href="https://www.lawsons.co.uk/fencing-supplies" class="mce-btn-primary">Explore Fencing & Timber &rarr;</a>
    <a href="https://www.lawsons.co.uk/landscaping-supplies" class="mce-btn-secondary">Browse Landscaping</a>
  </div>
</div>
<div class="callout-box want-to-know-more">
  <h4>💡 Want to Know More? Expert Guides & Supplies</h4>
  <ul>
    <li><a href="https://www.lawsons.co.uk/fencing-supplies/concrete-fencing">Concrete Fence Posts & Gravel Boards</a></li>
    <li><a href="https://www.lawsons.co.uk/landscaping-supplies/railway-sleepers">Softwood & Oak Railway Sleepers</a></li>
  </ul>
</div>`,
    variations: {
      lawsons: {
        store_code: "lawsons_en",
        title: "Concrete vs Timber Fence Posts: Which Is Best for Long-Lasting Boundaries? | Lawsons Guide",
        url_key: "concrete-vs-timber-fence-posts",
        short_content: "Lawsons trade & DIY guide comparing steel-reinforced concrete fence posts with UC4 pressure-treated timber posts across London and the South East.",
        meta_title: "Concrete vs Timber Fence Posts: Buying Guide | Lawsons",
        meta_description: "Compare concrete vs UC4 timber fence posts with Lawsons. Discover installation depths, postcrete ratios, and gravel board tips.",
        content_html: `<p>Whether you are a contractor pricing a boundary run in London or a homeowner upgrading storm-damaged panels across the South East, choosing between concrete and timber fence posts dictates how long your fence will stand.</p>
<h2>1. Why Post Selection Matters More Than the Panel</h2>
<p>At Lawsons, we supply both heavy-duty <a href="https://www.lawsons.co.uk/fencing-supplies/concrete-fencing">Concrete Fence Posts & Gravel Boards</a> and pressure-treated timber posts to match our <a href="https://www.lawsons.co.uk/fencing-supplies/fence-panels">Timber Fence Panels</a>.</p>
{{IMAGE:timber fence}}
<h2>2. Side-by-Side Trade Specification Table</h2>
<table>
  <thead>
    <tr>
      <th>Specification</th>
      <th>Lawsons Slotted Concrete Posts</th>
      <th>UC4 Pressure-Treated Timber Posts</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Moisture & Rot Resistance</strong></td>
      <td>100% impervious to ground rot & fungi</td>
      <td>High (UC4 kiln-dried & pressure treated)</td>
    </tr>
    <tr>
      <td><strong>Recommended Post Depth</strong></td>
      <td>600mm (2ft) set in Postcrete</td>
      <td>600mm (2ft) with free-draining gravel base</td>
    </tr>
    <tr>
      <td><strong>Best Paired With</strong></td>
      <td>150mm or 300mm Concrete Gravel Boards</td>
      <td>Treated Timber Gravel Boards & Closeboard</td>
    </tr>
  </tbody>
</table>
<div class="mce-product-grid">
  <div class="mce-product-card">
    <div>
      <h5>Concrete Fence Posts & Gravel Boards</h5>
      <p>Intermediate, corner, and end slotted concrete posts engineered for 6ft fence runs.</p>
    </div>
    <a href="https://www.lawsons.co.uk/fencing-supplies/concrete-fencing" class="mce-btn-primary">Add Concrete Posts &rarr;</a>
  </div>
  <div class="mce-product-card">
    <div>
      <h5>Pressure-Treated Fence Panels</h5>
      <p>Closeboard, overlap, and decorative trellis-top panels stocked across all Lawsons branches.</p>
    </div>
    <a href="https://www.lawsons.co.uk/fencing-supplies/fence-panels" class="mce-btn-secondary">View Product Range</a>
  </div>
</div>
<div class="category-spotlight-box">
  <h3>Shop Quality Timber, Fencing & Building Materials at Lawsons</h3>
  <p>Order online for fast delivery across London and the South East, or click & collect from your local Lawsons branch.</p>
  <div class="mce-btn-row">
    <a href="https://www.lawsons.co.uk/fencing-supplies" class="mce-btn-primary">Explore Fencing Supplies &rarr;</a>
    <a href="https://www.lawsons.co.uk/timber-and-sheet-materials" class="mce-btn-secondary">Shop Timber & Sheet</a>
  </div>
</div>
<div class="callout-box want-to-know-more">
  <h4>💡 Want to Know More? Recommended Reading from Lawsons</h4>
  <ul>
    <li><a href="https://www.lawsons.co.uk/fencing-supplies">Fencing Supplies & Fence Panels</a></li>
    <li><a href="https://www.lawsons.co.uk/landscaping-supplies/railway-sleepers">Softwood & Oak Railway Sleepers</a></li>
  </ul>
</div>`
      },
      avs: {
        store_code: "avs_en",
        title: "Timber vs Concrete Fence Posts: Designing a Stronger Garden Boundary with AVS Fencing",
        url_key: "concrete-vs-timber-fence-posts",
        short_content: "AVS Fencing specialists compare contemporary timber posts against slotted concrete posts for slatted panels, closeboard, and acoustic fencing.",
        meta_title: "Timber vs Concrete Fence Posts Guide | AVS Fencing",
        meta_description: "Planning a new fence? AVS Fencing compares UC4 treated timber posts and concrete posts for durability, style, and easy installation.",
        content_html: `<p>A great garden design starts with a structural boundary that complements your outdoor living space. At AVS Fencing & Landscaping Supplies, one of the most frequent questions at our branches is whether to pair new panels with timber or concrete posts.</p>
<h2>1. Matching Posts to Contemporary & Traditional Panels</h2>
<p>If you are installing modern slatted screens from our <a href="https://www.avsfencing.co.uk/fencing/fence-panels">Contemporary & Traditional Fence Panels</a> collection, warm timber posts create a seamless architectural look, whereas slotted concrete posts deliver unbeatable longevity for traditional boundaries.</p>
{{IMAGE:timber fence}}
<h2>2. AVS Fencing Post Comparison Matrix</h2>
<table>
  <thead>
    <tr>
      <th>Comparison Factor</th>
      <th>AVS Slotted Concrete Posts</th>
      <th>AVS UC4 Treated Timber Posts</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Service Life</strong></td>
      <td>25+ Years maintenance-free</td>
      <td>Up to 15 Years (UC4 ground-contact rated)</td>
    </tr>
    <tr>
      <td><strong>Visual Style</strong></td>
      <td>Structured frame with concrete gravel board</td>
      <td>Warm natural timber ideal for slatted panels</td>
    </tr>
    <tr>
      <td><strong>Installation</strong></td>
      <td>Two-person lift; panels slot straight in</td>
      <td>Lightweight; easy to fix gates & trellis</td>
    </tr>
  </tbody>
</table>
<div class="mce-product-grid">
  <div class="mce-product-card">
    <div>
      <h5>Contemporary & Traditional Fence Panels</h5>
      <p>Double slatted panels, closeboard, and decorative fencing crafted for modern gardens.</p>
    </div>
    <a href="https://www.avsfencing.co.uk/fencing/fence-panels" class="mce-btn-primary">Shop Fence Panels &rarr;</a>
  </div>
  <div class="mce-product-card">
    <div>
      <h5>Fencing Tools, Postcrete & Fixings</h5>
      <p>Fast-setting post mix, gravel board clips, and heavy-duty galvanized gate ironmongery.</p>
    </div>
    <a href="https://www.avsfencing.co.uk/garden-tools" class="mce-btn-secondary">View Tools & Fixings</a>
  </div>
</div>
<div class="category-spotlight-box">
  <h3>Transform Your Garden with AVS Fencing & Landscaping</h3>
  <p>From contemporary slatted fence panels and railway sleepers to premium decking and paving — available for nationwide & local delivery.</p>
  <div class="mce-btn-row">
    <a href="https://www.avsfencing.co.uk/fencing" class="mce-btn-primary">Shop AVS Fencing &rarr;</a>
    <a href="https://www.avsfencing.co.uk/landscaping/sleepers" class="mce-btn-secondary">Explore Railway Sleepers</a>
  </div>
</div>
<div class="callout-box want-to-know-more">
  <h4>💡 Want to Know More? AVS Landscaping Guides</h4>
  <ul>
    <li><a href="https://www.avsfencing.co.uk/fencing">AVS Fencing Panels & Posts</a></li>
    <li><a href="https://www.avsfencing.co.uk/landscaping/decking">Timber & Composite Garden Decking</a></li>
  </ul>
</div>`
      },
      oxford: {
        store_code: "oxford_en",
        title: "Choosing Between Timber & Concrete Fence Posts: The Oxford Fencing Supplies Guide",
        url_key: "concrete-vs-timber-fence-posts",
        short_content: "Established in 1986, Oxford Fencing Supplies explains when to use pressure-treated timber posts vs slotted concrete posts for lap and closeboard fencing.",
        meta_title: "Timber vs Concrete Fence Posts | Oxford Fencing Supplies",
        meta_description: "Expert advice from Oxford Fencing Supplies on selecting timber or concrete fence posts for lap panels, closeboard, and garden gates.",
        content_html: `<p>Since 1986, Oxford Fencing Supplies has helped thousands of Oxfordshire homeowners and fencing contractors build boundaries that stand up to winter gales. Selecting the right post for your soil conditions and panel style is essential.</p>
<h2>1. Supporting Lap Panels & Closeboard Fencing</h2>
<p>Both our <a href="https://www.oxfordfencing.co.uk/fence-panels">Pressure Treated Fence Panels</a> and traditional <a href="https://www.oxfordfencing.co.uk/closeboard-fencing">Closeboard Fencing & Feather Edge</a> systems can be erected using either slotted concrete or UC4 pressure-treated timber posts.</p>
{{IMAGE:timber fence}}
<h2>2. Key Differences at a Glance</h2>
<table>
  <thead>
    <tr>
      <th>Criteria</th>
      <th>Slotted Concrete Fence Posts</th>
      <th>Pressure-Treated Timber Posts</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Ground Contact Rating</strong></td>
      <td>Immune to damp clay & wet soil</td>
      <td>Pressure treated green/brown against rot</td>
    </tr>
    <tr>
      <td><strong>Hanging Wooden Gates</strong></td>
      <td>Requires timber infill batten</td>
      <td>Direct screw fixings for hinges & latches</td>
    </tr>
    <tr>
      <td><strong>Storm Maintenance</strong></td>
      <td>Lift & replace damaged panels in minutes</td>
      <td>Secured with panel clips or mortice rails</td>
    </tr>
  </tbody>
</table>
<div class="mce-product-grid">
  <div class="mce-product-card">
    <div>
      <h5>Timber & Concrete Fence Posts</h5>
      <p>Full range of 2.4m and 3.0m posts, gravel boards, and mortice posts ready for delivery.</p>
    </div>
    <a href="https://www.oxfordfencing.co.uk/fence-posts" class="mce-btn-primary">Shop Fence Posts &rarr;</a>
  </div>
  <div class="mce-product-card">
    <div>
      <h5>Superior Lap & Closeboard Panels</h5>
      <p>Heavy-duty pressure-treated green and brown timber panels in all standard heights.</p>
    </div>
    <a href="https://www.oxfordfencing.co.uk/fence-panels" class="mce-btn-secondary">View Panels</a>
  </div>
</div>
<div class="category-spotlight-box">
  <h3>Built for Oxfordshire Gardens — Explore Oxford Fencing Supplies</h3>
  <p>Pressure-treated lap panels, closeboard fencing, heavy-duty posts, and railway sleepers delivered straight to your door.</p>
  <div class="mce-btn-row">
    <a href="https://www.oxfordfencing.co.uk/fence-panels" class="mce-btn-primary">Browse Fence Panels &rarr;</a>
    <a href="https://www.oxfordfencing.co.uk/tools-and-fixings" class="mce-btn-secondary">Shop Post Mix & Fixings</a>
  </div>
</div>
<div class="callout-box want-to-know-more">
  <h4>💡 Want to Know More? Oxford Fencing Resources</h4>
  <ul>
    <li><a href="https://www.oxfordfencing.co.uk/closeboard-fencing">Closeboard Fencing & Feather Edge</a></li>
    <li><a href="https://www.oxfordfencing.co.uk/gates">Timber Garden & Side Gates</a></li>
  </ul>
</div>`
      },
      witham: {
        store_code: "witham_en",
        title: "Concrete Fencing vs Timber Posts: Heavy-Duty Boundary Advice from Witham Timber",
        url_key: "concrete-vs-timber-fence-posts",
        short_content: "With over 30 years of manufacturing experience, Witham Timber compares wet-cast concrete fence posts and pressure-treated timber posts.",
        meta_title: "Concrete vs Timber Fence Posts | Witham Timber",
        meta_description: "Built here, built to last. Compare Witham Timber's heavy-duty timber fence posts and concrete fencing posts for your next project.",
        content_html: `<p>With over 30 years of timber and fencing experience at Witham Timber, we know a fence is only as strong as the posts holding it upright. Whether you prefer the natural look of timber or the zero-maintenance durability of concrete, here is how to choose.</p>
<h2>1. Pairing Manufactured-on-Site Panels with the Right Posts</h2>
<p>Our fully framed <a href="https://www.withamtimber.co.uk/fence-panels-and-trellis">Fence Panels & Garden Trellis</a> are manufactured to slot effortlessly into our <a href="https://www.withamtimber.co.uk/concrete-fencing">Concrete Fence Posts & Gravel Boards</a> or fix securely to heavy-duty timber posts.</p>
{{IMAGE:timber fence}}
<h2>2. Witham Timber Structural Comparison</h2>
<table>
  <thead>
    <tr>
      <th>Performance Metric</th>
      <th>Witham Concrete Fencing Posts</th>
      <th>Witham Pressure-Treated Timber Posts</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Durability</strong></td>
      <td>Steel-reinforced wet-cast concrete</td>
      <td>Deep pressure-treated softwood</td>
    </tr>
    <tr>
      <td><strong>Base Protection</strong></td>
      <td>Pairs with 6in or 12in concrete gravel boards</td>
      <td>Pairs with treated timber gravel boards</td>
    </tr>
    <tr>
      <td><strong>Gate Integration</strong></td>
      <td>Compatible with wall plates</td>
      <td>Ideal for hanging heavy timber gates</td>
    </tr>
  </tbody>
</table>
<div class="mce-product-grid">
  <div class="mce-product-card">
    <div>
      <h5>Concrete Fence Posts & Gravel Boards</h5>
      <p>Intermediate, corner, and 3-way slotted concrete posts built for exposed sites.</p>
    </div>
    <a href="https://www.withamtimber.co.uk/concrete-fencing" class="mce-btn-primary">Shop Concrete Range &rarr;</a>
  </div>
  <div class="mce-product-card">
    <div>
      <h5>Heavy-Duty Timber Fencing</h5>
      <p>Manufactured on site at Witham Timber for superior strength and longevity.</p>
    </div>
    <a href="https://www.withamtimber.co.uk/timber-fencing" class="mce-btn-secondary">View Timber Fencing</a>
  </div>
</div>
<div class="category-spotlight-box">
  <h3>Manufactured On Site — Heavy-Duty Timber & Fencing from Witham Timber</h3>
  <p>High-quality, fully framed fence panels, railway sleepers, and concrete fencing manufactured to last.</p>
  <div class="mce-btn-row">
    <a href="https://www.withamtimber.co.uk/timber-fencing" class="mce-btn-primary">Shop Timber Fencing &rarr;</a>
    <a href="https://www.withamtimber.co.uk/railway-sleepers" class="mce-btn-secondary">View Railway Sleepers</a>
  </div>
</div>
<div class="callout-box want-to-know-more">
  <h4>💡 Want to Know More? Witham Timber Guides</h4>
  <ul>
    <li><a href="https://www.withamtimber.co.uk/gates-and-ironmongery">Timber Gates & Gate Ironmongery</a></li>
    <li><a href="https://www.withamtimber.co.uk/railway-sleepers">Softwood & Hardwood Railway Sleepers</a></li>
  </ul>
</div>`
      },
      landscape: {
        store_code: "landscape_en",
        title: "Groundworks & Post Foundations: Setting Concrete & Timber Posts | The Landscape Centre",
        url_key: "concrete-vs-timber-fence-posts",
        short_content: "The Landscape Centre covers sub-base drainage, ballast, post mix, and structural post selection for garden boundaries and sleeper walls.",
        meta_title: "Setting Timber & Concrete Fence Posts | The Landscape Centre",
        meta_description: "Get the foundations right. Learn how to bed concrete and timber fence posts with ballast, drainage shingle, and sleepers from The Landscape Centre.",
        content_html: `<p>Every long-lasting boundary or retaining feature begins below ground level. At The Landscape Centre, we supply the essential aggregates, ballast, and structural timbers that keep fence posts and sleeper walls dead-level for decades.</p>
<h2>1. Drainage & Sub-Base Preparation for Fence Posts</h2>
<p>Before placing either a concrete or timber post into its hole, adding 100mm of compacted shingle or sub-base from our <a href="https://the-landscape-centre.co.uk/aggregates">Bulk Aggregates, Ballast & MOT Type 1</a> range aids drainage and prevents water pooling around the base.</p>
{{IMAGE:paving}}
<h2>2. Post Foundation & Backfill Guide</h2>
<table>
  <thead>
    <tr>
      <th>Post Type</th>
      <th>Hole Depth (for 1.8m Fence)</th>
      <th>Recommended Aggregate & Mix</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Slotted Concrete Post</strong></td>
      <td>600mm minimum</td>
      <td>20mm Ballast & Cement or rapid Postcrete</td>
    </tr>
    <tr>
      <td><strong>UC4 Timber Fence Post</strong></td>
      <td>600mm + 100mm pea shingle base</td>
      <td>Free-draining gravel heel + concrete collar</td>
    </tr>
    <tr>
      <td><strong>Vertical Sleeper Retaining Post</strong></td>
      <td>750mm–900mm (depending on height)</td>
      <td>Heavy-duty concrete haunching + drainage pipe</td>
    </tr>
  </tbody>
</table>
<div class="mce-product-grid">
  <div class="mce-product-card">
    <div>
      <h5>Bulk Aggregates, Ballast & Shingle</h5>
      <p>20mm all-in ballast, MOT Type 1 sub-base, and pea shingle in bulk bags or loose loads.</p>
    </div>
    <a href="https://the-landscape-centre.co.uk/aggregates" class="mce-btn-primary">Shop Aggregates &rarr;</a>
  </div>
  <div class="mce-product-card">
    <div>
      <h5>Landscaping Railway Sleepers</h5>
      <p>Ideal for raised beds, garden edging, and stepped boundary transitions.</p>
    </div>
    <a href="https://the-landscape-centre.co.uk/sleepers" class="mce-btn-secondary">Explore Sleepers</a>
  </div>
</div>
<div class="category-spotlight-box">
  <h3>Start Your Groundworks & Garden Project with The Landscape Centre</h3>
  <p>Bulk bags of aggregates, screened topsoil, natural stone paving, sleepers, and fresh turf delivered on time.</p>
  <div class="mce-btn-row">
    <a href="https://the-landscape-centre.co.uk/aggregates" class="mce-btn-primary">Explore Aggregates & Topsoil &rarr;</a>
    <a href="https://the-landscape-centre.co.uk/paving" class="mce-btn-secondary">Browse Paving & Sleepers</a>
  </div>
</div>
<div class="callout-box want-to-know-more">
  <h4>💡 Want to Know More? Hard Landscaping Essentials</h4>
  <ul>
    <li><a href="https://the-landscape-centre.co.uk/topsoil-and-bark">Screened Topsoil, Compost & Bark Mulch</a></li>
    <li><a href="https://the-landscape-centre.co.uk/decorative-stones">Decorative Gravel, Slate & Chippings</a></li>
  </ul>
</div>`
      }
    }
  }
];
