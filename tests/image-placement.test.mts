import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { assignBest, inferPhotoKind, scorePhoto, MIN_FIT_SCORE } = await import(
  "../lib/images/placement"
);
const { assignImportedImages } = await import("../lib/agents/imported-images");
const { releaseRetitledItemPhotos } = await import("../lib/agents/image-slots");

type Blueprint = import("../lib/blueprint/types").WebsiteBlueprint;
type ImportedImage = import("../lib/branding/imported-brand").ImportedBrandImage;

const upload = (name: string) => `/uploads/p1/imported/${name}.jpg`;

function photo(
  name: string,
  analysis: ImportedImage["analysis"],
  orientation: ImportedImage["orientation"] = "landscape"
): ImportedImage {
  return {
    url: upload(name),
    altText: "",
    sourcePageUrl: "https://brightsmile.example/",
    orientation,
    analysis,
  };
}

function dentalBlueprint(): Blueprint {
  return {
    business: { name: "Bright Smile", industry: "Dental Clinic", description: "Family dentist" },
    design: { tone: "warm", colorPalette: [], typography: "sans", visualStyle: "clean" },
    seo: { title: "Bright Smile", description: "Dentist" },
    quoteSignals: [],
    pages: [
      {
        slug: "home",
        title: "Home",
        sections: [
          {
            id: "hero",
            type: "hero",
            variant: "hero-split-with-image",
            content: { headline: "Gentle dental care for the whole family", subheadline: "Modern clinic" },
            imageKeywords: ["modern dental clinic"],
          },
          {
            id: "about",
            type: "about",
            variant: "about-with-image",
            content: { heading: "Meet our team", body: "Our dentists and hygienists" },
            imageKeywords: ["dental team"],
          },
          {
            id: "services",
            type: "services",
            variant: "services-grid",
            content: {
              heading: "Services",
              itemTitles: ["Teeth whitening", "Dental cleaning"],
              itemBodies: ["Brighter smile in one visit", "Plaque removal and polish"],
            },
          },
        ],
      },
    ],
  } as Blueprint;
}

describe("photo placement scoring", () => {
  it("infers the kind of photo from its description", () => {
    assert.equal(inferPhotoKind("Company logo on a white background"), "graphic");
    assert.equal(inferPhotoKind("Smiling dentist talking with a family"), "people");
    assert.equal(inferPhotoKind("Bright clinic reception interior"), "place");
    assert.equal(inferPhotoKind(""), undefined);
  });

  it("never places logos or text graphics", () => {
    const score = scorePhoto(
      { description: "Bright Smile logo", kind: "graphic" },
      { role: "hero", orientation: "landscape", subject: "Bright Smile", industry: "Dental" }
    );
    assert.equal(score, Number.NEGATIVE_INFINITY);
  });

  it("prefers the photo that shows the slot's subject", () => {
    const slot = {
      role: "service" as const,
      orientation: "square" as const,
      subject: "Teeth whitening",
      industry: "Dental Clinic",
    };
    const match = scorePhoto({ description: "Patient getting teeth whitening treatment" }, slot);
    const other = scorePhoto({ description: "Empty waiting room chairs" }, slot);
    assert.ok(match > other);
  });

  it("puts a team photo in About rather than a product slot", () => {
    const team = { description: "Three dentists smiling together", kind: "people" as const };
    const about = scorePhoto(team, {
      role: "about",
      orientation: "landscape",
      subject: "Meet our team",
      industry: "Dental",
    });
    const product = scorePhoto(team, {
      role: "product",
      orientation: "square",
      subject: "Electric toothbrush",
      industry: "Dental",
    });
    assert.ok(about >= MIN_FIT_SCORE);
    assert.ok(about > product);
  });
});

describe("assignBest", () => {
  it("settles the strongest pairs first instead of letting the first slot grab everything", () => {
    // Slot 0 likes both photos a little; slot 1 only fits photo 0.
    const table = [
      [6, 5],
      [9, -1],
    ];
    const placed = assignBest({
      slotCount: 2,
      photoCount: 2,
      score: (s, p) => table[s][p],
    });
    assert.deepEqual(
      placed.map(({ slot, photo }) => [slot, photo]),
      [
        [0, 1],
        [1, 0],
      ]
    );
  });

  it("uses each photo once and leaves slots without a fit empty", () => {
    const placed = assignBest({
      slotCount: 3,
      photoCount: 1,
      score: () => 10,
    });
    assert.equal(placed.length, 1);
  });

  it("skips pairs below the fit threshold", () => {
    const placed = assignBest({ slotCount: 1, photoCount: 1, score: () => MIN_FIT_SCORE - 1 });
    assert.equal(placed.length, 0);
  });
});

describe("assignImportedImages", () => {
  it("places each customer photo where its content fits and never repeats one", () => {
    const blueprint = dentalBlueprint();
    const imported = [
      photo("logo", { description: "Bright Smile logo", tags: ["logo"], kind: "graphic", quality: "good" }),
      photo("team", {
        description: "Three dentists in scrubs smiling in the clinic",
        tags: ["dentist", "team"],
        kind: "people",
        quality: "good",
      }),
      photo(
        "whitening",
        {
          description: "Patient in a dental chair during teeth whitening",
          tags: ["teeth", "whitening", "dental chair"],
          kind: "work",
          quality: "good",
        },
        "square"
      ),
      photo("reception", {
        description: "Modern dental clinic reception interior",
        tags: ["clinic", "reception"],
        kind: "place",
        quality: "good",
      }),
    ];

    assignImportedImages(blueprint, imported);
    const [hero, about, services] = blueprint.pages[0].sections;

    assert.equal(hero.selectedImage?.url, upload("reception"));
    assert.equal(about.selectedImage?.url, upload("team"));
    assert.equal(services.itemImages?.[0]?.url, upload("whitening"));

    const used = [hero.selectedImage, about.selectedImage, ...(services.itemImages ?? [])]
      .map((img) => img?.url)
      .filter(Boolean);
    assert.equal(new Set(used).size, used.length, "a photo was placed twice");
    assert.ok(!used.includes(upload("logo")), "the logo was placed as a photo");
  });

  it("leaves a slot for stock instead of forcing an unrelated photo into it", () => {
    const blueprint = dentalBlueprint();
    assignImportedImages(blueprint, [
      photo("portrait", {
        description: "Close portrait of a smiling woman",
        tags: ["woman"],
        kind: "portrait",
        quality: "good",
      }),
    ]);
    const services = blueprint.pages[0].sections[2];
    assert.ok(!services.itemImages?.some((img) => img?.url === upload("portrait")));
  });

  it("uses an unlabelled, unanalysed photo only for a broad section photo", () => {
    const blueprint = dentalBlueprint();
    assignImportedImages(blueprint, [photo("unknown", undefined)]);
    const [hero, , services] = blueprint.pages[0].sections;
    assert.equal(hero.selectedImage?.url, upload("unknown"));
    assert.ok(!services.itemImages?.some(Boolean));
  });
});

describe("releaseRetitledItemPhotos", () => {
  it("drops stock photos whose item title changed and keeps uploads", () => {
    const section = dentalBlueprint().pages[0].sections[2];
    section.itemImages = [
      { provider: "pexels", url: "https://images.pexels.com/1.jpg", altText: "whitening" },
      { provider: "upload", url: upload("cleaning"), altText: "cleaning" },
    ];
    releaseRetitledItemPhotos(section, {
      ...section.content,
      itemTitles: ["Invisalign", "Deep cleaning"],
    });
    assert.equal(section.itemImages[0], null);
    assert.equal(section.itemImages[1]?.url, upload("cleaning"));
  });
});
