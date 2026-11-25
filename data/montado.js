/*
 * Ecosystem: cork oak montado, southern Portugal.
 *
 * Every flow carries a confidence code:
 *   E  well documented in this or closely related systems
 *   L  likely: documented elsewhere, plausible here, not measured here
 *   D  debated: published claims exist and are contested
 *   U  unknown: a flow people suspect or ask about, with no solid evidence
 *
 * Weights (1 to 5) are relative guesses for comparing flows on this map.
 * They are not measured fluxes. Only E and L flows enter the scenario model.
 *
 * Edge tuple: [from, to, type, weight, confidence, label, note?]
 * Edge id:    "from>to:type"
 */
(window.ECOSYSTEMS = window.ECOSYSTEMS || []).push({
  id: 'montado',
  name: 'Cork oak montado',
  place: 'Alentejo, southern Portugal',
  intro: 'Read this landscape as one body. Sunlight is the only income. Nitrogen, phosphorus and seeds are the goods being traded, and every arrow is one of those trades. Solid lines are documented, dashed lines are debated, dotted lines with a question mark are guesses.',

  view: {
    w: 1200, h: 830, soilY: 392,
    ground: 'M0 392 Q150 372 300 390 T600 388 T900 392 T1200 382',
    labels: [['Canopy and air', 16, 28], ['Ground line', 16, 364], ['Soil', 16, 420]]
  },

  nodes: {
    sun:   { n: 'Sun',          g: 'pool',   s: 's', x: 90,   y: 70,  r: 26, d: 'The only energy input. Everything that moves on this map is sunlight, captured, stored, then spent.' },
    air:   { n: 'Air (N₂)',     g: 'pool',   s: 's', x: 1110, y: 70,  r: 26, d: 'Mostly nitrogen gas, which almost nothing can use. Only certain bacteria can break the bond and let it into the living web.' },
    rock:  { n: 'Bedrock',      g: 'pool',   s: 's', x: 590,  y: 752, r: 30, d: 'Slowly weathering rock releases phosphate. Many Iberian soils are short of it, which is why a tree may rent a fungus to go and find it.' },
    oak:   { n: 'Cork oak',     g: 'plant',  s: 'c', x: 590,  y: 200, r: 40, d: 'Quercus suber anchors the montado. It pays sugar to fungal partners, drops leaves and bark into the litter, and offers acorns that half the map wants.' },
    grass: { n: 'Grasses',      g: 'plant',  s: 'c', x: 300,  y: 402, r: 26, d: 'Annual grasses and herbs under the trees. Shallow roots, fast growth after autumn rain, and the main food for grazers.' },
    leg:   { n: 'Clovers',      g: 'plant',  s: 'c', x: 440,  y: 412, r: 22, d: 'Clovers and other legumes house rhizobia in root nodules. The bacteria turn nitrogen gas into a form the whole system can use.' },
    myco:  { n: 'Mycorrhizae',  g: 'fungus', s: 'c', x: 590,  y: 572, r: 38, d: 'Fungal threads on oak roots (ectomycorrhizal) and on grass and clover roots (arbuscular). They sit between rock, litter and root: sugar goes in, phosphorus and nitrogen come out. How far the threads link neighbouring plants is an open question.' },
    litter:{ n: 'Leaf litter',  g: 'pool',   s: 's', x: 360,  y: 502, r: 26, d: 'Leaves, bark flakes, twigs and dung on the ground. A slow store that hands nutrients on as it rots.' },
    bact:  { n: 'Soil microbes',g: 'fungus', s: 'c', x: 240,  y: 622, r: 26, d: 'Bacteria and free-living fungi that break litter down into ammonium and phosphate. Their bodies turn over in days, a fast pulse beside the slow tree.' },
    worm:  { n: 'Earthworms',   g: 'invert', s: 'c', x: 800,  y: 622, r: 24, d: 'Earthworms and other soil animals shred litter, mix it into mineral soil, and open channels for water and roots.' },
    cat:   { n: 'Caterpillars', g: 'invert', s: 'c', x: 350,  y: 150, r: 22, d: 'Moth larvae such as the green oak tortrix eat new spring leaves in a short peak. Their droppings (frass) fall as a nutrient pulse.' },
    tit:   { n: 'Blue tits',    g: 'bird',   s: 'c', x: 160,  y: 190, r: 24, d: 'Blue tits time their nestlings to the caterpillar peak. A flush of oak leaf becomes a brood of feathers within weeks.' },
    bat:   { n: 'Bats',         g: 'mammal', s: 'c', x: 230,  y: 322, r: 22, d: 'Bats hunt moths at night and roost in tree hollows and buildings. Their guano moves nutrients from the canopy to roost sites.' },
    jay:   { n: 'Jay',          g: 'bird',   s: 'c', x: 780,  y: 80,  r: 22, d: 'The Eurasian jay carries acorns hundreds of metres and buries them. It recovers most and forgets some, and those can become oaks.' },
    mouse: { n: 'Wood mice',    g: 'mammal', s: 'c', x: 740,  y: 292, r: 22, d: 'Wood mice eat and scatter-hoard acorns and eat underground fungi. Their droppings can carry spores to new roots.' },
    rab:   { n: 'Rabbits',      g: 'mammal', s: 'c', x: 610,  y: 412, r: 28, d: 'The pivot of the Iberian food web. Rabbits graze the understory, dig warrens, and are the main prey of the Iberian lynx and the Spanish imperial eagle.' },
    deer:  { n: 'Deer & pigs',  g: 'mammal', s: 'c', x: 800,  y: 412, r: 28, d: 'Red deer and free-ranging Iberian pigs fatten on acorns in autumn. They move nutrients by eating in one place and dunging in another, and become carrion in the end.' },
    lynx:  { n: 'Iberian lynx', g: 'mammal', s: 'c', x: 1000, y: 422, r: 26, d: 'Feeds mostly on rabbits across its range. Its droppings and kills return nutrients to a handful of places.' },
    eagle: { n: 'Imperial eagle',g:'bird',   s: 'c', x: 990,  y: 170, r: 26, d: 'The Spanish imperial eagle nests in large old trees and takes rabbits as a major prey. Remains and droppings fertilise the ground below.' },
    fox:   { n: 'Foxes',        g: 'mammal', s: 'c', x: 900,  y: 300, r: 24, d: 'An omnivore taking small mammals, rabbits, fruit and insects. Droppings spread seeds and nutrients along its paths.' },
    dung:  { n: 'Dung beetles', g: 'invert', s: 'c', x: 930,  y: 512, r: 20, d: 'Bury dung quickly, moving nitrogen from the surface down to root depth and aerating the soil on the way.' },
    vul:   { n: 'Vultures',     g: 'bird',   s: 'c', x: 1120, y: 262, r: 26, d: 'Griffon vultures find carcasses across wide areas and roost on cliffs and in trees. Their droppings concentrate nutrients from many pastures at a few roosts.' }
  },

  edges: [
    // energy
    ['sun','oak','energy',5,'E','photosynthesis'],
    ['sun','grass','energy',4,'E','photosynthesis'],
    ['sun','leg','energy',2,'E','photosynthesis'],
    ['oak','myco','energy',4,'E','sugars paid to fungal partners','Trees pay a substantial share of their fixed carbon to root fungi. The exact share varies by species, season and site, and is not measured for cork oak here.'],
    ['oak','litter','energy',4,'E','leaves and bark fall'],
    ['oak','cat','energy',2,'E','young leaves eaten'],
    ['oak','mouse','energy',3,'E','acorns'],
    ['oak','jay','energy',3,'E','acorns'],
    ['oak','deer','energy',4,'E','acorns and browse'],
    ['grass','rab','energy',3,'E','grazing'],
    ['grass','deer','energy',2,'E','grazing'],
    ['leg','rab','energy',2,'L','clover and vetch'],
    ['cat','tit','energy',3,'E','caterpillars feed the nestlings'],
    ['cat','bat','energy',2,'L','adult moths caught in flight'],
    ['mouse','fox','energy',2,'L','hunted at night'],
    ['rab','lynx','energy',5,'E','the main prey','Rabbits dominate the lynx diet across its Iberian range. Where rabbits are scarce the lynx takes other prey and does worse.'],
    ['rab','eagle','energy',4,'E','a main prey','Eagles take other prey too. This map has no alternative-prey node, so it overstates how trapped the eagle is.'],
    ['rab','fox','energy',2,'E','kits and adults'],
    ['deer','vul','energy',2,'E','carcasses'],
    ['myco','mouse','energy',2,'L','underground fungi dug up'],
    ['myco','deer','energy',1,'L','mushrooms and truffles'],
    ['myco','bact','energy',2,'L','fungal sugars feed bacteria around the threads'],
    ['litter','bact','energy',4,'E','decomposition'],
    ['litter','worm','energy',3,'E','eaten and ground up'],
    ['bact','worm','energy',2,'L','microbes digested'],
    // nitrogen
    ['air','leg','nitrogen',3,'E','rhizobia fix N₂ in root nodules'],
    ['leg','litter','nitrogen',2,'L','nitrogen-rich litter'],
    ['litter','myco','nitrogen',3,'L','fungi mine organic nitrogen','Documented for ectomycorrhizal fungi in other forests. Its share of the oak nitrogen budget here is not known.'],
    ['bact','myco','nitrogen',2,'L','ammonium released'],
    ['myco','oak','nitrogen',4,'E','nitrogen delivered to roots'],
    ['myco','grass','nitrogen',2,'L','delivered through grass-root fungi'],
    ['deer','dung','nitrogen',4,'E','dung and urine, nitrogen on the move'],
    ['dung','grass','nitrogen',3,'L','dung buried at root depth'],
    ['dung','bact','nitrogen',2,'L','buried dung feeds the microbes'],
    ['rab','grass','nitrogen',2,'L','latrines concentrate nitrogen'],
    ['cat','litter','nitrogen',2,'L','frass pulse in spring'],
    ['bat','litter','nitrogen',2,'L','guano under roost trees'],
    ['lynx','litter','nitrogen',1,'L','droppings and kills'],
    ['eagle','litter','nitrogen',1,'L','prey remains under the nest'],
    ['worm','bact','nitrogen',2,'L','casts of mineral nitrogen'],
    // phosphorus
    ['rock','myco','phos',4,'L','hyphae dissolve phosphate from minerals','Fungi are known to mobilise phosphate from minerals. How much cork oak depends on this instead of recycled litter phosphorus is unknown.'],
    ['rock','bact','phos',2,'L','phosphate-solubilising bacteria'],
    ['bact','myco','phos',3,'L','phosphate released from microbes'],
    ['myco','oak','phos',4,'E','phosphorus delivered to roots'],
    ['myco','grass','phos',2,'E','phosphorus to grass roots'],
    ['myco','leg','phos',2,'E','phosphorus for the nodules'],
    ['oak','litter','phos',3,'E','leaf fall, after the tree reclaims what it can'],
    ['litter','bact','phos',2,'E','organic phosphorus made available'],
    ['vul','litter','phos',2,'L','droppings at roosts','The direction is clear. The size of the transfer is unknown.'],
    // seeds and spores
    ['jay','oak','seeds',4,'E','buries acorns and forgets some'],
    ['mouse','oak','seeds',3,'E','scatter-hoards acorns'],
    ['mouse','myco','seeds',2,'L','fungal spores in droppings'],
    ['rab','grass','seeds',2,'L','seeds in droppings'],
    // debated and unknown
    ['myco','oak','energy',1,'D','carbon shared between neighbouring trees?','Whether common fungal networks move meaningful carbon between neighbouring trees is contested. Treat it as an open question.'],
    ['deer','myco','seeds',1,'U','fungal spores moved by pigs and deer?','Wild pigs eat underground fungi elsewhere. Whether they spread spores in the montado is unstudied here.'],
    ['fox','oak','seeds',1,'U','acorns moved by foxes?'],
    ['bat','oak','energy',1,'U','fewer caterpillars, less leaf loss?','Birds and bats can protect trees by eating leaf-eaters in some forests. Whether that matters for acorn crops here is unknown.']
  ],

  stories: [
    { t: 'Whole map', nodes: null, x: 'Everything at once. Amber lines carry energy, teal carries nitrogen, magenta carries phosphorus and violet carries seeds and spores. Pick a story, a scenario, or click any organism.' },
    { t: 'The underground trade', nodes: ['sun','oak','myco','rock','litter','bact','grass','leg','air'], x: 'The oak has sunlight but needs phosphorus and usable nitrogen. The fungus has the opposite problem. Sugar goes down and minerals come up. Bacteria in clover roots and microbes in the litter keep the market supplied.' },
    { t: 'The acorn economy', nodes: ['oak','jay','mouse','deer','myco','fox'], x: 'Jays, mice, deer and pigs all eat acorns, yet the oak relies on jays and mice to move seeds. Mice also eat fungi and may spread their spores, which closes a loop between oak, mouse and mycorrhiza.' },
    { t: 'One rabbit, many predators', nodes: ['grass','leg','rab','lynx','eagle','fox','litter'], x: 'Rabbits turn grass into prey. The lynx and the eagle each have a heavy arrow into the same animal. Try the rabbit collapse scenario to see who is exposed.' },
    { t: 'The caterpillar peak', nodes: ['oak','cat','tit','bat','litter'], x: 'New oak leaves flush in spring and caterpillars follow. Blue tits breed to meet that peak, and bats take the moths after dark. A few weeks of leaf become the body of a brood.' },
    { t: 'What comes back down', nodes: ['deer','dung','vul','bat','lynx','eagle','litter','bact','worm','grass','myco','cat'], x: 'Every animal ends up as dung, a carcass or a pellet. Dung beetles bury nitrogen, vultures carry it to roosts, and the litter layer turns it back into something roots can take up.' }
  ],

  unknowns: [
    { t: 'Do neighbouring oaks share carbon through fungal threads?', x: 'Published claims point both ways. The map draws it as one debated flow.', edges: ['myco>oak:energy'] },
    { t: 'How much phosphorus comes from rock versus recycled litter?', x: 'Fungi can mine minerals, but the split for cork oak on these soils has not been measured.', edges: ['rock>myco:phos','bact>myco:phos','litter>bact:phos','oak>litter:phos'] },
    { t: 'Do tits and bats protect oaks enough to change acorn crops?', x: 'Plausible from other forests. Not shown for the montado.', edges: ['bat>oak:energy','cat>tit:energy','cat>bat:energy'] },
    { t: 'Who moves fungal spores and acorns besides jays and mice?', x: 'Foxes, pigs and deer may move both. No one has counted.', edges: ['deer>myco:seeds','fox>oak:seeds','mouse>myco:seeds'] },
    { t: 'How large are the landscape-scale nutrient transfers?', x: 'Vultures, large mammals and bats move nutrients between places. The direction is known. The amounts are not.', edges: ['vul>litter:phos','bat>litter:nitrogen','deer>dung:nitrogen'] }
  ],

  omitted: 'Left out for now: ants (major seed harvesters), pollinators, nematodes, protists, viruses, reptiles, amphibians, lichens, and people, whose cork harvest every nine years or so and livestock management shape the whole system.',

  scenarios: [
    {
      id: 'baseline', name: 'Reference state',
      summary: 'An open cork oak montado with moderate grazing. Every weight is a relative guess for comparison.',
      abundance: {}, edges: {}, changes: [], unknowns: []
    },
    {
      id: 'rabbit-collapse', name: 'Rabbit collapse',
      summary: 'Rabbit haemorrhagic disease and myxomatosis have repeatedly crashed Iberian rabbit populations. Here rabbits fall to one tenth.',
      abundance: { rab: 0.1 }, edges: {},
      changes: [
        ['L', 'Rabbit numbers drop to about 10% of the reference state.'],
        ['L', 'Grazing, latrine fertilising and seed carrying fall in proportion.']
      ],
      unknowns: [
        'How fast lynx and eagles switch to other prey. The map has no alternative-prey node, so it overstates how trapped they are.',
        'Whether released grazing pressure raises grass cover, or shrubs move in instead.',
        'How many breeding attempts fail, and how long recovery takes.'
      ]
    },
    {
      id: 'drought', name: 'Drought year',
      summary: 'A dry year cuts understory growth, reduces the acorn crop, and slows the rotting of litter.',
      abundance: { worm: 0.8 },
      edges: { 'sun>grass:energy': 0.5, 'sun>leg:energy': 0.5, 'sun>oak:energy': 0.8, 'oak>mouse:energy': 0.6, 'oak>jay:energy': 0.6, 'oak>deer:energy': 0.6, 'litter>bact:energy': 0.6, 'litter>worm:energy': 0.6 },
      changes: [
        ['E', 'Annual grasses and clovers produce roughly half as much.'],
        ['L', 'Acorn crop falls to about 60%, since acorn output swings with weather.'],
        ['L', 'Decomposition slows when soil is dry.'],
        ['L', 'Cork oak is drought-adapted, so its photosynthesis drops less (80%).']
      ],
      unknowns: [
        'How mycorrhizal exchange changes under drought. Fungi may buffer the tree or compete with it.',
        'Whether jays cache more acorns in poor years.',
        'The size of each factor. They are round numbers chosen to show direction.'
      ]
    },
    {
      id: 'root-disease', name: 'Root disease decline',
      summary: 'Root infection by Phytophthora cinnamomi is a recognised driver of cork and holm oak decline in Iberia, often alongside drought. Here half the oak is lost.',
      abundance: { oak: 0.5 },
      edges: { 'oak>litter:energy': 1.3 },
      changes: [
        ['L', 'Living oak falls to about half.'],
        ['L', 'Dying wood and leaves raise litter input for a while (assumed +30%).']
      ],
      unknowns: [
        'How the fungal partners change when the root system fails.',
        'How long the litter pulse lasts and where its nutrients end up.',
        'Whether neighbouring oaks gain anything from the loss.'
      ]
    },
    {
      id: 'livestock', name: 'Heavy stocking and dewormers',
      summary: 'More deer and pigs than the acorn crop supports, with livestock dosed against parasites. Residues in dung can harm dung beetles.',
      abundance: { deer: 1.6, dung: 0.4 },
      edges: { 'oak>mouse:energy': 0.6, 'oak>jay:energy': 0.6, 'jay>oak:seeds': 0.5, 'mouse>oak:seeds': 0.5 },
      changes: [
        ['L', 'Deer and pigs rise to 160% of the reference state.'],
        ['L', 'Dung beetles fall to 40%, a known effect of some dewormer residues.'],
        ['L', 'Acorns left for mice and jays fall, and seedlings are browsed, so recruitment drops.']
      ],
      unknowns: [
        'Which dewormers, at what doses, in this region.',
        'How compaction and trampling change the fungal network.',
        'How buried versus surface dung changes nitrogen loss. The map shows less burial but not the losses.'
      ]
    }
  ]
});
