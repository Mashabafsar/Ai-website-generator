export const A = "/templates/luxeframe";

export const TRAIL = [
  `${A}/img1.webp`,
  `${A}/img2.webp`,
  `${A}/img3.webp`,
  `${A}/img4.webp`,
  `${A}/img5.webp`,
  `${A}/img6.webp`,
  `${A}/img7.webp`,
  `${A}/img8.webp`,
  `${A}/img9.webp`,
  `${A}/img10.webp`,
] as const;

export const PROJECTS = [
  { title: "Ethereal Desert Sands", place: "Ad-Dahna, Saudia Arabia", img: `${A}/project1.webp` },
  { title: "Timeless Istanbul Wonders", place: "Istanbul, Turkey", img: `${A}/project2.webp` },
  { title: "Elegant Tranquility of Soneva", place: "Soneva Jani, Maldives", img: `${A}/project3.webp` },
  { title: "Gijón Cafe Chronicles", place: "Madrid, Spain", img: `${A}/project4.webp` },
  { title: "Chic Sophistication - DIOR", place: "London, UK", img: `${A}/project5.webp` },
  { title: "Mystic Underwater Realms", place: "Tahoe lake, California US", img: `${A}/project6.webp` },
  { title: "Alpine Majesty Unveiled", place: "Mount Rigi, Switzerland", img: `${A}/project7.webp` },
  { title: "Dolomites: Peaks of Perfection", place: "Dolomites, Italy", img: `${A}/project8.webp` },
  { title: "Parisian Backyard Elegance", place: "Paris, France", img: `${A}/project9.webp` },
  { title: "Urban Muse: A Street Story", place: "New York, USA", img: `${A}/project10.webp` },
  { title: "Feast for the Eyes", place: "London, UK", img: `${A}/project11.webp` },
  { title: "Sundown Sounds", place: "California, USA", img: `${A}/project12.webp` },
] as const;

export const SERVICES = [
  "Commercial & Advertising",
  "Architectural",
  "Travel & Landscape",
  "Events & Weddings",
  "Food & Beverage",
  "Underwater",
  "Portrait",
  "Fashion",
  "Product",
  "Sports",
  "Real Estate",
  "Editorial",
] as const;

export const SERVICE_IMGS = SERVICES.map((_, i) => `${A}/serviceAreas${i + 1}.webp`);

export const TEAM = [
  { name: "Lily Rose", role: "Photographer", img: `${A}/team1.webp` },
  { name: "John Paul", role: "Assistant Photographer", img: `${A}/team2.webp` },
  { name: "Emma Grace", role: "Studio Manager", img: `${A}/team3.webp` },
  { name: "Mark Anthony", role: "Digital Retoucher", img: `${A}/team4.webp` },
  { name: "Mia Belle", role: "Art Director", img: `${A}/team5.webp` },
  { name: "James Dean", role: "Stylist", img: `${A}/team6.webp` },
  { name: "Ava Marie", role: "Production Assistant", img: `${A}/team7.webp` },
  { name: "David Lee", role: "Marketing and Sales", img: `${A}/team8.webp` },
  { name: "Zoe Claire", role: "Graphic Designer", img: `${A}/team9.webp` },
  { name: "Michael Scott", role: "Administrative Staff", img: `${A}/team10.webp` },
] as const;

export const CLIENT_LOGOS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `${A}/client${n}.svg`);

export const MORE_IMGS = [`${A}/moreAboutus1.webp`, `${A}/moreAboutus2.webp`, `${A}/moreAboutus5.webp`, `${A}/moreAboutus6.webp`] as const;

export const NAV_IMG = `${A}/nav_img.webp`;
export const ARROW = `${A}/arrow.png`;
export const CONTACT_IMG = `${A}/contact_img.webp`;
export const ABOUT_IMGS = [`${A}/about1.webp`, `${A}/about2.webp`] as const;
