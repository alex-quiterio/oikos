import type {
  ControlTuple,
  EcosystemDto,
  EvidenceCode,
  FlowTuple,
  SourceDto,
} from './dto';
import {
  HORN_FLOWS,
  HORN_PRODUCTION,
  type HornHabitat,
  type HornValue,
} from './horn2017.generated';

/**
 * Intertidal flats of the Wadden Sea, the Netherlands, Germany and Denmark.
 *
 * Flows between the producers, the animals living in the mud and the birds are calibrated to Horn et al.
 * (2017), a study of six intertidal habitats of the north-eastern German Wadden Sea. Their sizes come from the
 * paper's network files (data/sources/horn2017), weighted by habitat area and put on a 1 to 5 log scale.
 * Fish, seals and nutrients are not in the paper, and stay the author's estimates.
 *
 * Evidence: E documented, L likely, D debated, U unknown.
 */
const FLAT = 'M0 420 Q200 405 400 425 T800 415 T1200 430';
const REF = 'horn2017';

// --- turning the paper's carbon flows into the 1 to 5 weights of this atlas --------------------------
const SMALLEST = 0.5; // mgC m-2 d-1 and below is weight 1
const LARGEST = 3400; // about the largest value in the paper, the production of mud algae
const weightOf = (v: number): number => {
  const w =
    1 +
    (4 * Math.log10(Math.max(v, SMALLEST) / SMALLEST)) /
      Math.log10(LARGEST / SMALLEST);
  return Math.round(Math.min(5, w) * 10) / 10;
};
const HABITAT: Record<HornHabitat, string> = {
  cockle: 'cockle field',
  razor: 'razor clam field',
  mud: 'mud flat',
  mussel: 'mussel bank',
  sand: 'sand flat',
  seagrass: 'seagrass meadow',
};
const fmt = (x: number): string =>
  x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2);
function detail(v: HornValue, what: string): string {
  const entries = Object.entries(v.byHabitat) as [
    HornHabitat,
    number,
  ][];
  const top = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  return `${what}: ${fmt(v.mean)} mgC m⁻² d⁻¹, an area-weighted mean over six habitats. Highest in the ${HABITAT[top[0]]} (${fmt(top[1])}), present in ${entries.length} of 6 habitats. Network files S1 to S6.`;
}
const src = (v: HornValue, what = 'Flow'): SourceDto => ({
  ref: REF,
  detail: detail(v, what),
});
const get = (key: string): HornValue => {
  const v = HORN_FLOWS[key];
  if (!v) throw new Error(`Horn et al. (2017) has no flow ${key}`);
  return v;
};

/** A flow whose size and existence come from the paper. */
function horn(
  from: string,
  to: string,
  label: string,
  o: { ev?: EvidenceCode; note?: string } = {},
): FlowTuple {
  const v = get(`${from}>${to}`);
  return [
    from,
    to,
    'energy',
    weightOf(v.mean),
    o.ev ?? 'E',
    label,
    o.note,
    src(v),
  ];
}
/** What a producer makes, or in the plankton's case what arrives with the tide. */
function production(
  from: string,
  to: string,
  label: string,
  note?: string,
): FlowTuple {
  const v = HORN_PRODUCTION[to];
  if (!v)
    throw new Error(`Horn et al. (2017) has no production for ${to}`);
  return [
    from,
    to,
    'energy',
    weightOf(v.mean),
    'E',
    label,
    note,
    src(
      v,
      'Production, the "import" of the producer in the network files',
    ),
  ];
}
const LOW_QUALITY =
  'The paper assumes that unused production goes half to export and half to detritus, and rates this low quality.';
/** A flow to detritus. Real, but the paper's size for it rests on assumptions. */
const toDetritus = (from: string, label: string): FlowTuple =>
  horn(from, 'detr', label, { ev: 'L', note: LOW_QUALITY });
/** Nutrients that birds return, sized by the carbon they egest in the paper. Nitrogen is not modelled there. */
function droppings(from: string, label: string): FlowTuple {
  const v = get(`${from}>detr`);
  return [
    from,
    'detr',
    'nitrogen',
    weightOf(v.mean),
    'L',
    label,
    'Sized from the paper’s carbon egestion as a proxy. The paper models carbon only.',
    src(v, 'Carbon egested to detritus, used as a proxy'),
  ];
}

export const waddenSea: EcosystemDto = {
  id: 'wadden-sea',
  name: 'Wadden Sea tidal flats',
  habitat: 'Land and sea',
  place: 'Wadden Sea, the Netherlands, Germany and Denmark',
  intro:
    'A shallow sea that drains twice a day and leaves miles of mud. The tide brings plankton in, the mud grows its own algae, shellfish and worms feed on both, and birds that fly in from the Arctic feed on them. The flows between algae, animals and birds follow a study of six intertidal habitats.',
  flowLabels: { seeds: 'Larvae & spores' },
  references: [
    {
      id: REF,
      short: 'Horn et al. 2017',
      citation:
        'Horn S, de la Vega C, Asmus R, Schwemmer P, Enners L, Garthe S, et al. (2017) Interaction between birds and macrofauna within food webs of six intertidal habitats of the Wadden Sea. PLoS ONE 12(5): e0176381.',
      url: 'https://doi.org/10.1371/journal.pone.0176381',
      note: 'Carbon-flow networks for six intertidal habitats in the north-eastern German Wadden Sea, sampled 2013 to 2015, with birds as top predators. Fish and seals are not modelled, nitrogen and phosphorus are not covered, and the sizes of flows come from field stocks, literature diets and energy ratios, not from direct measurement of fluxes. Weights here come from the paper’s network files (CC BY), weighted by habitat area and put on a 1 to 5 log scale. Flows to detritus rest on assumptions the authors rate as low quality.',
    },
  ],
  view: {
    w: 1200,
    h: 830,
    sky: 'water',
    bands: [{ d: `${FLAT} V830 H0 Z`, fill: 'seabed' }],
    lines: [FLAT],
    labels: [
      ['Open water at high tide', 16, 28],
      ['Mud and sand flats', 16, 450],
    ],
  },
  nodes: {
    sun: {
      n: 'Sun',
      g: 'store',
      s: 's',
      x: 90,
      y: 60,
      r: 26,
      d: 'Light on shallow water and exposed mud drives the algae and the seagrass.',
    },
    sea: {
      n: 'North Sea and rivers',
      g: 'store',
      s: 's',
      x: 1110,
      y: 80,
      r: 28,
      d: 'The tide brings plankton, nutrients and the larvae of shellfish and fish. The paper finds the flats depend heavily on what the open sea delivers.',
    },
    phyto: {
      n: 'Phytoplankton',
      g: 'alga',
      s: 'c',
      x: 270,
      y: 190,
      r: 26,
      d: 'Drifting algae that arrive with the tide. The main food of cockles and mussels.',
    },
    diat: {
      n: 'Mud algae',
      g: 'alga',
      s: 'c',
      x: 330,
      y: 500,
      r: 28,
      d: 'Microscopic algae that colour the mud surface (microphytobenthos). In the paper they are by far the largest producer on the flats.',
    },
    zost: {
      n: 'Seagrass and seaweed',
      g: 'plant',
      s: 'c',
      x: 160,
      y: 470,
      r: 26,
      d: 'Dwarf eelgrass and seaweeds, which the paper counts together as macrophytes. They feed geese and ducks, and shelter small animals.',
      ks: {
        k: 'foundation',
        s: 'documented',
        t: 'Seagrass beds shelter animals and stabilise sediment, and in the paper they feed geese and wigeon. Much of the Wadden Sea eelgrass has been lost and has been slow to return.',
      },
    },
    goose: {
      n: 'Brent geese',
      g: 'bird',
      s: 'c',
      x: 140,
      y: 330,
      r: 24,
      d: 'Graze seagrass and seaweed. In the paper all of their food on the flats is macrophytes.',
    },
    dabblers: {
      n: 'Wigeon and other dabbling ducks',
      g: 'bird',
      s: 'c',
      x: 250,
      y: 400,
      r: 24,
      d: 'Wigeon, pintail and mallard graze seagrass and seaweed on sand flats and seagrass meadows. In the paper, wigeon are among the heaviest birds on these habitats.',
    },
    detr: {
      n: 'Detritus and mud',
      g: 'store',
      s: 's',
      x: 480,
      y: 620,
      r: 26,
      d: 'Dead algae, droppings and fine particles in the mud. In the paper, much of the mud algae’s unused production is assumed to end up here or leave with the tide.',
    },
    bact: {
      n: 'Mud microbes',
      g: 'fungus',
      s: 'c',
      x: 330,
      y: 730,
      r: 26,
      d: 'Bacteria that break detritus down. Food for worms and mudsnails.',
    },
    snails: {
      n: 'Mudsnails and periwinkles',
      g: 'invert',
      s: 'c',
      x: 410,
      y: 555,
      r: 22,
      d: 'Tiny mudsnails (Peringia) and periwinkles graze the algae film on the mud in huge numbers. In the paper they eat about a sixth of the mud algae’s production.',
      ks: {
        k: 'keystone',
        s: 'proposed',
        t: 'In the paper, mudsnails carry most of the energy from mud algae to animals, and feed knots, shelduck and eiders. Their role as a link is clear. Whether the system depends on them more than on other grazers is not tested.',
      },
    },
    worm: {
      n: 'Lugworms and other worms',
      g: 'invert',
      s: 'c',
      x: 520,
      y: 480,
      r: 26,
      d: 'Lugworms, ragworms and other bristle worms. They eat detritus, microbes and algae, and are the main food of waders.',
    },
    cockle: {
      n: 'Cockles and clams',
      g: 'invert',
      s: 'c',
      x: 700,
      y: 500,
      r: 28,
      d: 'Cockles, Baltic tellins, sand gapers and razor clams. They filter plankton and feed on the mud. In the paper they carry about half of oystercatcher food and about four fifths of knot food.',
      ks: {
        k: 'keystone',
        s: 'proposed',
        t: 'In the paper, clams are the largest food source for knots and oystercatchers, and the authors link the cockle field’s weak redundancy to its reliance on one compartment. Not tested as a removal.',
      },
    },
    mussel: {
      n: 'Blue mussels',
      g: 'invert',
      s: 'c',
      x: 880,
      y: 540,
      r: 30,
      d: 'Dense beds, with Pacific oysters, that filter plankton and shelter other animals. Small in area but very dense: the paper’s mussel bank holds about 290 g of carbon per m², against about 1 g averaged over all the flats.',
      ks: {
        k: 'foundation',
        s: 'documented',
        t: 'Mussel beds form reef-like structures that support other species. The paper finds the mussel bank the most active and most import-dependent of the six habitats.',
      },
    },
    shrimp: {
      n: 'Brown shrimp',
      g: 'invert',
      s: 'c',
      x: 480,
      y: 330,
      r: 24,
      d: 'Come in with the tide to feed on small animals. Their flows are small in the paper, which counts them only as part of the benthos.',
    },
    plaice: {
      n: 'Plaice and flatfish',
      g: 'fish',
      s: 'c',
      x: 640,
      y: 330,
      r: 26,
      d: 'Young flatfish use the shallows as a nursery. Fish are not modelled in the paper, so their flows here are the author’s estimates.',
    },
    crab: {
      n: 'Shore crabs',
      g: 'invert',
      s: 'c',
      x: 700,
      y: 650,
      r: 24,
      d: 'Eat young shellfish, snails and worms.',
      ks: {
        k: 'keystone',
        s: 'proposed',
        t: 'Crabs can strongly affect how many young shellfish survive in a year, especially after mild winters. In the paper their flows are modest.',
      },
    },
    knot: {
      n: 'Red knot',
      g: 'bird',
      s: 'c',
      x: 860,
      y: 330,
      r: 24,
      d: 'A long-distance migrant. In the paper knots eat mostly small clams, with some mudsnails, and were counted on sand flats and seagrass meadows.',
    },
    oyc: {
      n: 'Oystercatcher',
      g: 'bird',
      s: 'c',
      x: 1000,
      y: 420,
      r: 26,
      d: 'Takes cockles and other clams, worms and some mussels. In the paper, clams are about half of its food and worms most of the rest.',
    },
    waders: {
      n: 'Dunlin, curlew, godwit and other waders',
      g: 'bird',
      s: 'c',
      x: 790,
      y: 430,
      r: 26,
      d: 'Probing waders. In the paper they take most of the energy that birds get from worms: about four fifths of what they eat.',
    },
    shelduck: {
      n: 'Shelduck',
      g: 'bird',
      s: 'c',
      x: 965,
      y: 515,
      r: 22,
      d: 'Eats mudsnails above all. In the paper about two thirds of its food is snails.',
    },
    eider: {
      n: 'Eider',
      g: 'bird',
      s: 'c',
      x: 1060,
      y: 590,
      r: 24,
      d: 'Sea ducks that dive for mussels, cockles and snails. In the paper they were counted on mussel banks, cockle fields, razor clam fields and mud flats.',
    },
    seal: {
      n: 'Harbour seal',
      g: 'mammal',
      s: 'c',
      x: 1050,
      y: 230,
      r: 28,
      d: 'Rests on sandbanks at low tide and feeds on fish, especially flatfish. Not modelled in the paper.',
    },
  },
  flows: [
    // energy in: mud algae and seagrass from the sun, plankton with the tide
    production(
      'sun',
      'diat',
      'photosynthesis at low tide',
      'Gross production of the mud algae is the biggest flow in the paper.',
    ),
    production('sun', 'zost', 'photosynthesis'),
    production(
      'sea',
      'phyto',
      'plankton arrives with the tide',
      'The paper treats phytoplankton as an import and finds the cockle field and mussel bank strongly dependent on it.',
    ),
    // what eats the producers
    horn('phyto', 'cockle', 'filtered from the water'),
    horn('phyto', 'mussel', 'filtered from the water', {
      note: 'Small on average over all the flats, because mussel banks cover little area. In the mussel bank itself this is the largest consumption flow.',
    }),
    horn('diat', 'snails', 'grazed from the mud surface'),
    horn('diat', 'worm', 'eaten with the sediment'),
    horn('diat', 'cockle', 'taken from the mud surface'),
    horn('zost', 'goose', 'grazing'),
    horn('zost', 'dabblers', 'grazing', {
      note: 'Wigeon and other dabbling ducks feed almost entirely on seagrass and seaweed in the paper.',
    }),
    // detritus and microbes
    horn('detr', 'worm', 'eaten with the sediment'),
    horn('detr', 'snails', 'detritus eaten'),
    horn('detr', 'cockle', 'particles taken in'),
    horn('detr', 'bact', 'decomposition', {
      note: 'The same in all six habitats in the paper, so it is an input assumption, not a result.',
    }),
    horn('bact', 'worm', 'microbes eaten'),
    horn('bact', 'snails', 'microbes eaten'),
    toDetritus('diat', 'dead cells and unused production'),
    toDetritus('snails', 'droppings and dead snails'),
    toDetritus('cockle', 'droppings and dead shellfish'),
    toDetritus('worm', 'droppings and dead worms'),
    // animals to animals
    horn('snails', 'worm', 'snails eaten by worms'),
    horn('worm', 'shrimp', 'small worms eaten'),
    horn('shrimp', 'worm', 'shrimp eaten by worms'),
    horn('cockle', 'crab', 'young cockles'),
    horn('snails', 'crab', 'snails eaten'),
    horn('worm', 'crab', 'worms eaten'),
    horn('mussel', 'crab', 'young mussels', {
      note: 'Small on average, but large in the mussel bank.',
    }),
    // birds
    horn('worm', 'waders', 'worms probed from the mud'),
    horn('cockle', 'waders', 'small shellfish swallowed'),
    horn('snails', 'waders', 'snails eaten'),
    horn('crab', 'waders', 'small crabs eaten'),
    horn('cockle', 'oyc', 'cockles opened'),
    horn('worm', 'oyc', 'worms probed from the mud'),
    horn('mussel', 'oyc', 'mussels opened'),
    horn('cockle', 'knot', 'small shellfish swallowed whole', {
      note: 'In the paper, knots were counted only on sand flats and seagrass meadows.',
    }),
    horn('snails', 'knot', 'snails eaten'),
    horn('snails', 'shelduck', 'snails eaten'),
    horn('cockle', 'shelduck', 'small shellfish eaten'),
    horn('snails', 'eider', 'snails eaten'),
    horn('cockle', 'eider', 'shellfish eaten'),
    horn('mussel', 'eider', 'diving for mussels', {
      note: 'Small on average, but about 10 mgC per m² per day on the mussel bank, where eiders are most numerous.',
    }),
    // outside the paper: fish and seals
    [
      'worm',
      'plaice',
      'energy',
      3,
      'E',
      'worms and tails',
      'Fish are not modelled in the paper. The author’s estimate.',
    ],
    [
      'cockle',
      'plaice',
      'energy',
      2,
      'E',
      'siphon tips nipped',
      'Not in the paper. The author’s estimate.',
    ],
    [
      'shrimp',
      'plaice',
      'energy',
      2,
      'L',
      'small shrimp',
      'Not in the paper. The author’s estimate.',
    ],
    [
      'plaice',
      'seal',
      'energy',
      3,
      'E',
      'flatfish',
      'Seals are not modelled in the paper. The author’s estimate.',
    ],
    // nitrogen (not in the paper, except the proxy for what birds return)
    [
      'sea',
      'phyto',
      'nitrogen',
      3,
      'E',
      'nitrate and ammonium from rivers and sea',
    ],
    [
      'sea',
      'diat',
      'nitrogen',
      2,
      'L',
      'nutrients in the water over the flats',
    ],
    ['sea', 'zost', 'nitrogen', 1, 'L', 'nutrients in the water'],
    [
      'bact',
      'diat',
      'nitrogen',
      3,
      'E',
      'ammonium regenerated in the mud',
    ],
    [
      'worm',
      'bact',
      'nitrogen',
      2,
      'E',
      'burrowing mixes oxygen and nutrients',
    ],
    ['cockle', 'diat', 'nitrogen', 2, 'L', 'excretion'],
    ['snails', 'diat', 'nitrogen', 1.5, 'L', 'excretion'],
    ['seal', 'detr', 'nitrogen', 1, 'L', 'droppings'],
    droppings('goose', 'droppings'),
    droppings('dabblers', 'droppings'),
    droppings('waders', 'droppings'),
    droppings('shelduck', 'droppings'),
    droppings('oyc', 'droppings'),
    droppings('knot', 'droppings'),
    droppings('eider', 'droppings'),
    // phosphorus
    [
      'sea',
      'phyto',
      'phosphorus',
      2,
      'L',
      'phosphate from rivers and sea',
    ],
    [
      'detr',
      'bact',
      'phosphorus',
      2,
      'E',
      'organic phosphorus released',
    ],
    [
      'bact',
      'diat',
      'phosphorus',
      2,
      'L',
      'phosphate regenerated in the mud',
    ],
    // larvae and spores
    [
      'sea',
      'mussel',
      'seeds',
      3,
      'E',
      'larvae settle from the plankton',
    ],
    [
      'sea',
      'cockle',
      'seeds',
      3,
      'E',
      'larvae settle from the plankton',
    ],
    [
      'sea',
      'plaice',
      'seeds',
      3,
      'E',
      'young fish drift in to the nursery',
    ],
    [
      'sea',
      'shrimp',
      'seeds',
      2,
      'L',
      'young shrimp arrive with the tide',
    ],
    ['mussel', 'sea', 'seeds', 3, 'E', 'larvae exported'],
    ['cockle', 'sea', 'seeds', 3, 'E', 'larvae exported'],
    // unknown
    [
      'worm',
      'zost',
      'nitrogen',
      1,
      'U',
      'burrowing effects on eelgrass?',
    ],
    [
      'mussel',
      'diat',
      'nitrogen',
      1,
      'U',
      'mussel droppings fertilising nearby algae?',
    ],
  ],
  controls: [
    [
      'oyc',
      'cockle',
      'release',
      0.5,
      'L',
      'oystercatchers can hold back cockle numbers',
      'Birds eat a large share of the clam production in the paper’s cockle field, sand flat and seagrass meadow. Whether that limits cockle numbers is not tested.',
    ],
    ['knot', 'cockle', 'release', 0.3, 'L', 'knots take small clams'],
    ['waders', 'worm', 'release', 0.4, 'L', 'waders take worms'],
    [
      'eider',
      'mussel',
      'release',
      0.3,
      'L',
      'eiders thin mussel beds',
    ],
    [
      'crab',
      'mussel',
      'release',
      0.4,
      'L',
      'crabs take young mussels',
    ],
    [
      'crab',
      'cockle',
      'release',
      0.4,
      'L',
      'crabs take young cockles',
    ],
    [
      'mussel',
      'phyto',
      'pressure',
      0.3,
      'L',
      'dense mussels strip plankton',
    ],
    [
      'snails',
      'diat',
      'balance',
      0.4,
      'L',
      'mudsnails graze mud algae',
      'About a sixth of the mud algae’s production in the paper.',
    ],
    [
      'plaice',
      'shrimp',
      'release',
      0.3,
      'D',
      'flatfish may limit shrimp',
      'Predation by fish on shrimp is documented, but its role in setting shrimp numbers is debated.',
    ],
  ] satisfies ControlTuple[],
  stories: [
    {
      t: 'Whole map',
      nodes: null,
      x: 'Everything at once. Amber lines carry energy, teal nitrogen, magenta phosphorus, violet larvae. Grey dashed lines are controls, who holds whom in check. Flows between algae, animals and birds follow a study of six habitats.',
    },
    {
      t: 'From mud to bird',
      nodes: [
        'sun',
        'diat',
        'snails',
        'detr',
        'worm',
        'cockle',
        'waders',
        'oyc',
        'knot',
        'shelduck',
      ],
      x: 'The mud grows its own algae, and mudsnails graze them. Worms and shellfish eat algae and detritus. Waders eat worms, and oystercatchers and knots eat shellfish and snails. The energy of the mud ends up in birds that fly in from the Arctic.',
    },
    {
      t: 'Brought by the tide',
      nodes: [
        'sea',
        'phyto',
        'mussel',
        'cockle',
        'oyc',
        'knot',
        'eider',
      ],
      x: 'Cockles and mussels filter plankton that the tide brings in. In the paper these are the habitats most dependent on imports, with only about 1% to 2% of their carbon flow recycled inside.',
    },
    {
      t: 'Seagrass, geese and wigeon',
      nodes: ['sun', 'zost', 'goose', 'dabblers', 'detr', 'bact'],
      x: 'Seagrass and seaweed feed geese and wigeon, which in the paper live almost entirely on them. Most seagrass has been lost and has been slow to return, so these birds are exposed.',
    },
    {
      t: 'The nursery',
      nodes: [
        'plaice',
        'shrimp',
        'worm',
        'cockle',
        'crab',
        'seal',
        'sea',
      ],
      x: 'Young flatfish and shrimp drift in, feed on worms and shellfish, and leave as adults. The paper does not model fish or seals, so this part is the author’s estimate.',
    },
  ],
  questions: [
    {
      t: 'How much do shellfish limit knots and oystercatchers?',
      x: 'In the paper clams are about four fifths of knot food and half of oystercatcher food. Whether food limits their numbers is a different question, and not answered here.',
      ids: [
        'cockle>knot:energy',
        'cockle>oyc:energy',
        'oyc>cockle:ctl',
      ],
    },
    {
      t: 'What happens to the mud algae that nothing eats?',
      x: 'In the paper about half of the mud algae’s production is unused. The authors assume half goes to the sediment and half is carried out by the tide, and rate this low quality.',
      ids: [
        'diat>detr:energy',
        'diat>snails:energy',
        'snails>diat:ctl',
      ],
    },
    {
      t: 'Which habitat matters for which bird?',
      x: 'Knots and wigeon were counted on sand flats and seagrass meadows. Eiders on mussel banks and cockle fields. Waders on all of them. The map shows the average over all the flats, so these differences are hidden.',
      ids: [
        'cockle>knot:energy',
        'zost>dabblers:energy',
        'mussel>eider:energy',
        'worm>waders:energy',
      ],
    },
    {
      t: 'What did the loss of mussel beds change besides the fishery?',
      x: 'Beds filter water and shelter other species. The knock-on effects are only partly known.',
      ids: ['mussel>phyto:ctl', 'mussel>eider:energy'],
    },
    {
      t: 'Why has seagrass not come back?',
      x: 'Water clarity, sediment and disturbance have all been suggested. No single answer has settled it.',
      ids: ['sun>zost:energy', 'worm>zost:nitrogen'],
    },
    {
      t: 'How much nitrogen and phosphorus come from rivers versus the sea?',
      x: 'The paper models carbon only, so these flows are the author’s estimates. The balance has changed over time with river clean-up.',
      ids: ['sea>phyto:nitrogen', 'sea>phyto:phosphorus'],
    },
    {
      t: 'Do fish limit shrimp?',
      x: 'Plausible. Not shown to set shrimp numbers, and fish are not in the paper.',
      ids: ['plaice>shrimp:ctl', 'shrimp>plaice:energy'],
    },
  ],
  omitted:
    'Left out for now: fish and seals beyond the nursery sketch (the paper does not model them), meiofauna, gulls, barnacles and other bank animals, salt marshes, dunes and islands, spoonbills and terns, grey seals, lugworm and cockle fisheries, plankton blooms, gas extraction, and people, whose harvests and dredging have shaped the flats. The map averages six habitats by area. Individual habitats differ a lot.',
  care: {
    why: 'The Wadden Sea is among the largest unbroken systems of tidal flats in the world. Millions of birds stop here to feed on their journeys between the Arctic and Africa.',
    status:
      'A UNESCO World Heritage Site. Fishing, dredging, gas extraction, climate change and invasive species are all discussed. Flows between benthos and birds follow a 2013 to 2015 study in the German Wadden Sea. Fish, seals and nutrients are the author’s estimates. Check current monitoring before relying on this page.',
  },
  scenarios: [
    {
      id: 'reference',
      name: 'Reference state',
      summary:
        'An average intertidal flat of the study site, with shellfish, worms, plants and birds all present. Weights follow the paper where it gives them.',
      abundance: {},
      factors: {},
      assumes: [],
      unknowns: [],
    },
    {
      id: 'mussel-bed-loss',
      name: 'Mussel beds lost',
      summary:
        'Natural mussel beds have declined in parts of the Wadden Sea, through fishing, poor spatfall and storms. Here they fall to a fifth.',
      abundance: { mussel: 0.2 },
      factors: {},
      assumes: [
        ['E', 'Mussel beds have declined in parts of the sea.'],
        ['L', 'Mussels fall to about 20% of the reference level.'],
      ],
      unknowns: [
        'How eiders and oystercatchers switch to other foods.',
        'How water clarity and plankton change without beds.',
        'How fast beds return, which depends on young mussels settling after cold winters.',
      ],
    },
    {
      id: 'cockle-failure',
      name: 'Cockle failure',
      summary:
        'Poor spat years and low shellfish stocks leave less for the birds that depend on them.',
      abundance: { cockle: 0.2 },
      factors: {},
      assumes: [
        ['E', 'Cockle stocks vary strongly between years.'],
        [
          'L',
          'Cockles and other clams fall to about 20% of the reference level.',
        ],
      ],
      unknowns: [
        'How far birds can switch to worms, snails or mussels. The paper gives diets in one year, not what birds do when food fails.',
        'Whether the birds’ condition on the Arctic breeding grounds follows.',
        'Whether crabs and shrimp are the cause or the effect.',
      ],
    },
    {
      id: 'seagrass-loss',
      name: 'Seagrass lost',
      summary:
        'Seagrass and seaweed beds shrink. Geese and wigeon, which feed almost only on them in the paper, are the most exposed.',
      abundance: { zost: 0.2 },
      factors: {},
      assumes: [
        ['E', 'Seagrass has been lost from much of the Wadden Sea.'],
        [
          'L',
          'Seagrass and seaweed fall to about 20% of the reference level.',
        ],
      ],
      unknowns: [
        'Whether geese and wigeon switch to land grasses or other foods, which the paper does not cover.',
        'What the loss does to the nursery habitat for young fish, which is not modelled.',
        'Whether seagrass can return without help.',
      ],
    },
    {
      id: 'warm-spring',
      name: 'Warm winters and crabs',
      summary:
        'Mild winters let more crabs and shrimp survive, and fewer young shellfish survive their first year.',
      abundance: { crab: 1.5, shrimp: 1.3 },
      factors: { 'sea>cockle:seeds': 0.4, 'sea>mussel:seeds': 0.5 },
      assumes: [
        [
          'L',
          'Crabs rise by half and shrimp by a third after mild winters.',
        ],
        [
          'L',
          'Fewer young cockles and mussels settle and survive (40% and 50%).',
        ],
      ],
      unknowns: [
        'How much of the shellfish decline comes from predation rather than temperature alone.',
        'Whether new warm-water species change the picture.',
        'How the effect compounds over several mild winters.',
      ],
    },
  ],
};
