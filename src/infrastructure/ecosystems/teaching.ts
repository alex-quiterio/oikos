import type { TeachDto } from './dto';

/**
 * "Teach this" guides, one per ecosystem. They look at the system through its energy and nutrient flows.
 * Written for ages 12 to 16. `look` lists flow or control ids to highlight on the map.
 *
 * The notes say what the map shows. They are not measurements, and they say so where the map is silent.
 */
export const TEACHING: Record<string, TeachDto> = {
  montado: {
    bigIdea:
      'Sunlight is captured once, by oaks, grass and clover. From there energy only moves forward, from one eater to the next, and much of it is lost as heat on the way. Nutrients are different. They go round and round, through fungi, soil microbes, dung and carcasses, and back to the roots.',
    questions: [
      {
        t: 'Where does the energy come in, and who captures it?',
        x: 'Find the arrows that start at the sun. Who gets them?',
        look: [
          'sun>oak:energy',
          'sun>grass:energy',
          'sun>leg:energy',
        ],
        notice:
          'Only plants take energy from the sun. Every animal and fungus on this map lives on energy that a plant captured first.',
      },
      {
        t: 'Follow the energy from grass to a lynx.',
        x: 'Count the steps. What do you think happens to the energy at each step?',
        look: [
          'sun>grass:energy',
          'grass>rab:energy',
          'rab>lynx:energy',
        ],
        notice:
          'Three steps. At each one most of the energy is lost, as heat, movement and waste, so only a small part reaches the next eater. That is why a woodland holds many plants, fewer rabbits and very few lynx.',
      },
      {
        t: 'Where does an oak get nitrogen and phosphorus?',
        x: 'It cannot get them from the sun. Follow the arrows into the oak.',
        look: [
          'myco>oak:nitrogen',
          'myco>oak:phosphorus',
          'oak>myco:energy',
          'rock>myco:phosphorus',
          'air>leg:nitrogen',
        ],
        notice:
          'Through fungi on its roots, which it pays with sugar. The fungi get phosphorus from rock and nitrogen from litter and from clover. Energy (sugar) is traded for nutrients.',
      },
      {
        t: 'How do nutrients get back to the soil?',
        x: 'An animal dies, or leaves dung. Where do its nutrients go next?',
        look: [
          'deer>dung:nitrogen',
          'dung>grass:nitrogen',
          'vul>litter:phosphorus',
          'oak>litter:phosphorus',
          'litter>bact:phosphorus',
        ],
        notice:
          'Dung, fallen leaves and carcasses all end up in the litter. Dung beetles bury some, microbes break the rest down, and roots take it up again. Nutrients are recycled. Energy is not.',
      },
    ],
    activities: [
      {
        t: 'Remove the rabbits',
        predict: 'Who is hurt most, and who barely notices?',
        remove: ['rab'],
        notice:
          'The lynx and the eagle fall furthest, because on this map rabbits are almost their only energy source. Jays and oaks barely notice. A web is fragile where one link carries a lot of the energy. (Real eagles can switch to other prey. The map does not show that.)',
      },
      {
        t: 'Cut the fungi',
        predict: 'The oak still has full sunlight. Is it safe?',
        remove: ['myco'],
        notice:
          'No. Without the fungi the oak loses its nitrogen and phosphorus, and the loss runs through the whole web. Sunlight is not enough without the nutrients.',
      },
      {
        t: 'A drought year',
        predict: 'Which flows shrink first, and who feels it most?',
        scenario: 'drought',
        notice:
          'Grass and clover capture about half as much energy, and the animals that eat them fall with them. Jays, which depend on acorns, and earthworms, which depend on litter, are among the most affected. Less energy at the bottom means less at every step above.',
      },
    ],
  },

  veluwe: {
    bigIdea:
      'On poor sandy soil, sunlight is free and nutrients are scarce. Heather wins because it is good at getting scarce nutrients out of the soil. Nitrogen falling from the sky changes the rules, because it is a nutrient flow that did not exist at this size before.',
    questions: [
      {
        t: 'What is scarce here, energy or nutrients?',
        x: 'Compare how the plants get sunlight with how they get nitrogen and phosphorus.',
        look: [
          'rock>myco:phosphorus',
          'myco>heath:nitrogen',
          'myco>heath:phosphorus',
        ],
        notice:
          'The sun is free. Nutrients are not. Heather depends on fungi to get them out of the humus and the sand.',
      },
      {
        t: 'Where does extra nitrogen come from?',
        x: 'Look for arrows that start in the air.',
        look: [
          'air>heath:nitrogen',
          'air>grass:nitrogen',
          'air>pine:nitrogen',
        ],
        notice:
          'From the air. Ammonia from farming and nitrogen oxides from traffic settle on the heath. It is a new nutrient flow added by people.',
      },
      {
        t: 'Who benefits from extra nitrogen?',
        x: 'More of a nutrient sounds good. Is it good for everyone?',
        look: ['air>grass:nitrogen', 'grass>heath:ctl'],
        notice:
          'Grasses use it faster than heather and then crowd the heather out. More of a nutrient is not always better, because it can help the wrong species.',
      },
      {
        t: 'How do grazers move nutrients around?',
        x: 'Follow a sheep or a deer from where it eats to where it leaves dung.',
        look: [
          'heath>sheep:energy',
          'sheep>litter:nitrogen',
          'deer>litter:nitrogen',
          'heath>deer:energy',
        ],
        notice:
          'They eat in one place and leave dung in another, so nutrients get moved and concentrated.',
      },
    ],
    activities: [
      {
        t: 'Add nitrogen from the air',
        predict: 'Which plant wins, and who feels the change next?',
        scenario: 'nitrogen-deposition',
        notice:
          'Grasses rise and heather falls to about half. The heather beetle, which eats it, falls too, and the fungi and the trees feel it through the nutrients they share with heather. The extra nutrient changes who wins, and the change spreads through the web.',
      },
      {
        t: 'Stop the grazing',
        predict: 'What was holding the grasses back?',
        scenario: 'grazing-stops',
        notice:
          'Grazing removes energy from the grass. Without it grasses rise and press on the heather. The map does not show scrub and trees taking over, which is the next step in real life.',
      },
    ],
  },

  westerpark: {
    bigIdea:
      'A park pond is mostly fed from outside: leaves from the trees, rain and canal water, and bread from people. People are an energy and nutrient source here. The question is whether the nutrients end up in water plants, which keep the water clear, or in algae, which turn it green.',
    questions: [
      {
        t: 'What feeds the pond from outside?',
        x: 'Look for arrows that start outside the water.',
        look: [
          'trees>mud:energy',
          'people>mallard:energy',
          'runoff>algae:nitrogen',
          'runoff>algae:phosphorus',
          'people>lawn:nitrogen',
        ],
        notice:
          'Leaves, runoff and canal water, bread, and dog waste on the lawn. Almost nothing in the pond is made from sunlight alone.',
      },
      {
        t: 'Where does a piece of bread go?',
        x: 'Follow it from the hand to the algae.',
        look: [
          'people>mallard:energy',
          'mallard>mud:nitrogen',
          'mallard>mud:phosphorus',
          'mud>algae:phosphorus',
        ],
        notice:
          'A duck eats it, the nutrients leave as droppings, sink into the mud and are released again as phosphate that feeds algae. Bread works like a slow fertiliser for the water.',
      },
      {
        t: 'What keeps the water clear?',
        x: 'Look at the grey dashed arrows. Who holds whom in check?',
        look: [
          'zoo>algae:ctl',
          'macro>algae:ctl',
          'roach>zoo:ctl',
          'algae>macro:ctl',
        ],
        notice:
          'Water fleas graze algae and water plants take up nutrients. Bottom-feeding fish eat the water fleas, and algae shade the water plants. Each pushes the pond toward clear or green.',
      },
      {
        t: 'Where does the pond’s energy go when it leaves the water?',
        x: 'Midge larvae live in the mud. What happens when they grow up?',
        look: [
          'benth>emerg:energy',
          'emerg>spider:energy',
          'spider>songb:energy',
          'emerg>lawn:nitrogen',
        ],
        notice:
          'The larvae become flying insects, which spiders on the bank catch, and small birds eat the spiders. Energy and nutrients leave the pond for the land. How much leaves this way is debated.',
      },
      {
        t: 'Who eats the fish, and why does it matter?',
        x: 'Count the steps from algae to a heron.',
        look: [
          'algae>zoo:energy',
          'zoo>roach:energy',
          'roach>heron:energy',
          'roach>cormorant:energy',
          'roach>perch:energy',
        ],
        notice:
          'Algae, then water fleas, then fish, then herons and cormorants. Four steps. A heron needs a lot of pond to live on.',
      },
    ],
    activities: [
      {
        t: 'Heavy bread feeding',
        predict: 'Does the pond end up clear or green?',
        scenario: 'bread-feeding',
        notice:
          'Algae rise and the water plants fall: the pond tips toward green. Birds and rats rise too. The nutrients came from outside, and the pond cannot use them without the algae taking over.',
      },
      {
        t: 'A fish kill',
        predict:
          'Losing fish sounds bad. What happens to the water, and to the herons?',
        scenario: 'fish-kill',
        notice:
          'The water can clear, because the fish that ate the water fleas are gone, but herons and cormorants lose their food. What is good for one part is bad for another.',
      },
      {
        t: 'Dredge the pond',
        predict:
          'Removing mud removes stored nutrients. Who else is affected?',
        scenario: 'dredging',
        notice:
          'Less phosphorus is released from the mud, but the bottom animals and plants go too, and the insects that leave the pond, the spiders and the small birds lose some of their food.',
      },
    ],
  },

  savanna: {
    bigIdea:
      'Fire is an energy flow too. It burns the grass that the herds did not eat. Grazers, fire and elephants all take energy out of the grass, and each returns nutrients in a different form: dung, ash and carcasses.',
    questions: [
      {
        t: 'Who takes the energy in grass?',
        x: 'Find every arrow that leaves the grass.',
        look: [
          'grass>wilde:energy',
          'grass>gaz:energy',
          'grass>termite:energy',
          'grass>fire:energy',
        ],
        notice:
          'Herds, termites and fire. If the herds eat less, more grass is left, and fire takes more of it.',
      },
      {
        t: 'How does a dead wildebeest feed the grass?',
        x: 'Follow the carcass. Who eats it, and who leaves what behind?',
        look: [
          'wilde>lion:energy',
          'wilde>vul:energy',
          'wilde>litter:nitrogen',
          'hyena>litter:phosphorus',
          'vul>litter:phosphorus',
        ],
        notice:
          'Lions, hyenas and vultures take the energy. What they leave, in droppings and bones, returns nitrogen and phosphorus to the soil. Phosphorus from bones comes back through hyena droppings.',
      },
      {
        t: 'Why are termite mounds special?',
        x: 'Termites eat dead grass. Where do the nutrients end up?',
        look: [
          'grass>termite:energy',
          'litter>termite:energy',
          'termite>grass:nitrogen',
        ],
        notice:
          'Termites gather dead plant matter into one place. The mound becomes a rich patch of soil where plants grow differently.',
      },
      {
        t: 'What does fire give back?',
        x: 'Fire destroys plants. Does it return anything?',
        look: [
          'fire>litter:nitrogen',
          'grass>fire:energy',
          'wilde>fire:ctl',
        ],
        notice:
          'Ash returns some nutrients at once. Herds and fire compete for the same energy in the grass, so fewer herds mean more fire.',
      },
    ],
    activities: [
      {
        t: 'The herds crash',
        predict: 'What happens to the fire, and to the trees?',
        scenario: 'wildebeest-crash',
        notice:
          'Less grazing leaves more grass, more fuel and more fire. Fire presses on young trees. The map shows direction only. The real result depends on rain.',
      },
      {
        t: 'Poison the vultures',
        predict:
          'Will a map of energy and nutrients show a big effect?',
        scenario: 'vulture-loss',
        notice:
          'Only a small one. The effects that matter most, carcasses lingering and disease, are not energy or nutrient flows on this map. A flow map is one lens and can miss important things.',
      },
    ],
  },

  amazon: {
    bigIdea:
      'The soil has almost no phosphorus left, yet the forest is huge. The trick is recycling. Fungi catch nutrients from falling litter before the rain washes them away, and a small gift from outside, dust blown from the Sahara, tops up the losses.',
    questions: [
      {
        t: 'Where does the forest get phosphorus if the soil has almost none?',
        x: 'Find the arrows that bring phosphorus in, and the ones that pass it around.',
        look: [
          'soil>myco:phosphorus',
          'litter>myco:phosphorus',
          'dust>litter:phosphorus',
          'myco>canopy:phosphorus',
        ],
        notice:
          'Mostly from the forest’s own litter, caught by fungi. Only a small share is new, mainly dust from the Sahara. Most of the phosphorus has been used many times before.',
      },
      {
        t: 'How short is the recycling loop?',
        x: 'Follow a leaf from the canopy back to a root.',
        look: [
          'canopy>litter:energy',
          'litter>bact:energy',
          'litter>myco:nitrogen',
          'myco>canopy:nitrogen',
        ],
        notice:
          'Leaves fall, rot and are taken up again within months. A short loop loses little.',
      },
      {
        t: 'What do leaf-cutter ants do to the flow?',
        x: 'They carry leaves away. Where do the nutrients end up?',
        look: [
          'canopy>ant:energy',
          'ant>litter:nitrogen',
          'ant>litter:phosphorus',
          'ant>canopy:ctl',
        ],
        notice:
          'They move a lot of leaf energy into their nests and leave rich waste piles. Nutrients end up concentrated in a few places.',
      },
      {
        t: 'How many steps from a leaf to a jaguar?',
        x: 'Trace two different routes.',
        look: [
          'canopy>agouti:energy',
          'agouti>jaguar:energy',
          'canopy>monkey:energy',
          'monkey>harpy:energy',
        ],
        notice:
          'Two or three steps. Each step loses most of the energy, which is why top predators are rare.',
      },
    ],
    activities: [
      {
        t: 'Less Saharan dust',
        predict: 'Does the forest feel it at once?',
        scenario: 'dust-decline',
        notice:
          'Only a little on this map, because the forest holds large stores of phosphorus in trees and litter. Slow flows have slow effects. The map cannot show how long the stores last.',
      },
      {
        t: 'Hunt out the agoutis',
        predict: 'Will the standing forest change?',
        scenario: 'agouti-loss',
        notice:
          'Not at once. The trees that are already there stay. What falls is the supply of new seedlings of the trees that only agoutis spread. The effect shows over decades.',
      },
    ],
  },

  tundra: {
    bigIdea:
      'In the cold, things decompose slowly, so nutrients, especially nitrogen, stay locked in dead plants and frozen soil. Warming speeds up the release, and a store that was closed starts to open. This is also an energy flow, because old plant carbon is stored energy.',
    questions: [
      {
        t: 'Why is nitrogen so scarce?',
        x: 'Look at where nitrogen comes from, and how fast it is released.',
        look: [
          'air>moss:nitrogen',
          'litter>bact:energy',
          'litter>myco:nitrogen',
        ],
        notice:
          'Little enters from the air, mostly through moss. Cold slows the microbes that release it from litter, so it stays locked in peat.',
      },
      {
        t: 'What feeds the foxes and owls?',
        x: 'Follow the energy from the sun to an owl.',
        look: [
          'sun>sedge:energy',
          'sedge>lemming:energy',
          'lemming>fox:energy',
          'lemming>owl:energy',
        ],
        notice:
          'A short chain: sedge, lemming, predator. When the middle link crashes, both predators lose most of their energy source.',
      },
      {
        t: 'Who spreads nutrients around?',
        x: 'Animals eat in one place and leave droppings in another.',
        look: [
          'goose>litter:nitrogen',
          'fox>litter:nitrogen',
          'caribou>litter:nitrogen',
        ],
        notice:
          'Geese, foxes and caribou all fertilise the ground. Fox dens become small nutrient hotspots.',
      },
      {
        t: 'What is in the freezer?',
        x: 'Permafrost is frozen soil. What happens if it thaws?',
        look: [
          'perma>bact:energy',
          'bact>carbon:energy',
          'perma>bact:ctl',
        ],
        notice:
          'Permafrost is a large store of old plant carbon, which is stored energy. Thaw hands it to microbes, which release it to the air as carbon dioxide and methane.',
      },
    ],
    activities: [
      {
        t: 'A lemming crash',
        predict: 'Who suffers, and who switches food?',
        scenario: 'lemming-crash',
        notice:
          'Owls lose most of their food. Foxes can switch to goose eggs and ptarmigan, and the scenario assumes they do, so the nesting birds pay for the lemming crash. How far predators can switch is an open question.',
      },
      {
        t: 'Thaw the permafrost',
        predict: 'What happens to the flow of carbon to the air?',
        scenario: 'permafrost-thaw',
        notice:
          'The flow of carbon from microbes to the atmosphere gets thicker, because microbes now have old carbon to eat. The map shows direction only. How much, how fast and as which gas is uncertain, and the size here is an assumption.',
      },
    ],
  },

  'salmon-rainforest': {
    bigIdea:
      'Most of a salmon’s body was built from the ocean. When it spawns and dies, it moves ocean energy and nutrients uphill, into the river and the forest. Salmon are a delivery system between two ecosystems.',
    questions: [
      {
        t: 'Where did the salmon’s energy come from?',
        x: 'Look at the arrow that feeds the salmon.',
        look: ['ocean>salmon:energy'],
        notice:
          'From the ocean, where it spent years growing. A river stream cannot feed that many large fish. The salmon bring the energy home.',
      },
      {
        t: 'How do ocean nutrients get into a tree?',
        x: 'Follow a fish from the river into a trunk.',
        look: [
          'salmon>bear:energy',
          'bear>litter:nitrogen',
          'litter>soil:nitrogen',
          'soil>spruce:nitrogen',
        ],
        notice:
          'A bear carries a fish into the forest, the carcass rots, fungi and microbes release its nitrogen, and the tree takes it up. Each step is a transfer.',
      },
      {
        t: 'Who else delivers?',
        x: 'Look for other animals that eat salmon and then leave droppings.',
        look: [
          'salmon>wolf:energy',
          'salmon>gull:energy',
          'wolf>litter:nitrogen',
          'gull>litter:nitrogen',
        ],
        notice:
          'Wolves, eagles and ravens also carry salmon. How much each one moves is uncertain.',
      },
      {
        t: 'What does a carcass feed?',
        x: 'Look in the stream and on the land.',
        look: [
          'salmon>alg:nitrogen',
          'alg>inv:energy',
          'inv>fry:energy',
          'litter>fly:energy',
          'fly>songb:energy',
        ],
        notice:
          'In the stream it feeds algae, then insects, then young salmon. On land it feeds flies, then songbirds. One fish feeds many chains.',
      },
    ],
    activities: [
      {
        t: 'The run collapses',
        predict: 'Who feels it first, and who feels it last?',
        scenario: 'run-collapse',
        notice:
          'Bears, wolves and eagles lose energy first. Trees feel it later, through slower nutrient flows. A short chain reacts fast, a long one slowly.',
      },
      {
        t: 'Remove the bears',
        predict:
          'The fish are still there. Why does the forest lose?',
        scenario: 'no-bears',
        notice:
          'Fewer carcasses reach the forest floor, so less nitrogen and phosphorus get to the soil. The fish are the supply, and the bears are the transport.',
      },
    ],
  },

  'wadden-sea': {
    bigIdea:
      'The tide brings plankton and nutrients to a shallow sea twice a day, and the mud keeps them. Tiny algae on the mud feed worms and shellfish, and shellfish feed birds that fly thousands of kilometres. The mud is the pantry.',
    questions: [
      {
        t: 'Who captures the energy, and where is the light?',
        x: 'There are producers in the water and on the mud.',
        look: [
          'sun>phyto:energy',
          'sun>diat:energy',
          'sun>zost:energy',
        ],
        notice:
          'Algae floating in the water, algae on the mud surface, and eelgrass. The mud is a producer too, when the tide is out.',
      },
      {
        t: 'Where does the mud’s food come from?',
        x: 'Dead algae sink. What happens to them?',
        look: [
          'phyto>detr:energy',
          'diat>detr:energy',
          'detr>worm:energy',
          'detr>bact:energy',
        ],
        notice:
          'Dead algae and eelgrass settle into the mud as detritus. Worms and microbes eat it, and the energy goes up the web from there.',
      },
      {
        t: 'How do shellfish carry energy to birds?',
        x: 'Trace the path from water to a bird.',
        look: [
          'phyto>cockle:energy',
          'cockle>knot:energy',
          'cockle>oyc:energy',
          'mussel>eider:energy',
        ],
        notice:
          'Shellfish filter plankton from the water, and birds eat the shellfish. A migrating bird’s fuel comes from the mud.',
      },
      {
        t: 'Where are nutrients recycled?',
        x: 'Look at the nutrient arrows that start in the mud.',
        look: [
          'bact>diat:nitrogen',
          'worm>bact:nitrogen',
          'detr>bact:phosphorus',
        ],
        notice:
          'Microbes in the mud, helped by burrowing worms that bring in oxygen, release nutrients back to the algae within the mud itself.',
      },
    ],
    activities: [
      {
        t: 'Cockles fail',
        predict: 'Who depends on cockles most?',
        scenario: 'cockle-failure',
        notice:
          'The oystercatcher, knot and others that eat cockles lose energy. They may switch to worms or mussels, which is not shown on the map.',
      },
      {
        t: 'Lose the mussel beds',
        predict: 'The beds filter plankton. What changes?',
        scenario: 'mussel-bed-loss',
        notice:
          'Eiders and crabs lose food. Cockles gain a little, because the mussels no longer filter as much plankton out of the water. A change in one flow can help a neighbour. Habitat, which is not a flow, is lost too and is not shown.',
      },
    ],
  },

  'kelp-forest': {
    bigIdea:
      'Kelp is a fast-growing producer fuelled by light and by cold, nitrogen-rich water from the deep. Most of what it grows is not eaten alive. It drifts to the seabed and feeds the bottom. The questions are who eats the kelp, and who holds that eater in check.',
    questions: [
      {
        t: 'What limits how fast kelp grows?',
        x: 'It has light. What else does it need?',
        look: ['sun>kelp:energy', 'nutr>kelp:nitrogen'],
        notice:
          'Light and nitrate. Warm surface water holds less nitrate, so a marine heatwave is a nutrient problem for kelp.',
      },
      {
        t: 'Where does the kelp’s energy go?',
        x: 'Find every arrow that leaves the kelp.',
        look: [
          'kelp>urch:energy',
          'kelp>amph:energy',
          'kelp>detr:energy',
          'detr>bact:energy',
        ],
        notice:
          'Some is eaten alive by urchins and small grazers. Much is shed and drifts to the seabed, where animals and microbes use it. Dead kelp feeds the bottom.',
      },
      {
        t: 'Who controls the urchins?',
        x: 'The energy arrow goes one way. Which way does the effect on the kelp go?',
        look: [
          'urch>otter:energy',
          'otter>urch:ctl',
          'star>urch:ctl',
          'crab>urch:ctl',
          'urch>kelp:ctl',
        ],
        notice:
          'The energy goes from urchin to otter, but the effect on kelp runs the other way: otters keep urchins down, so the kelp survives. A predator can protect a plant two steps away.',
      },
      {
        t: 'How do nutrients come back?',
        x: 'Kelp is shed into the water. Where do its nutrients go?',
        look: [
          'kelp>detr:nitrogen',
          'detr>bact:energy',
          'bact>kelp:nitrogen',
          'otter>detr:nitrogen',
        ],
        notice:
          'Shed kelp carries nitrogen to the seabed, microbes release it, and some returns to the kelp. The deep, cold water that brings new nitrate is the main supply.',
      },
    ],
    activities: [
      {
        t: 'Remove the sea otters',
        predict: 'Who gains, and who loses?',
        scenario: 'otter-loss',
        notice:
          'Urchins rise and kelp falls. Removing a predator can make its prey boom, and what the prey eats collapses. (Real reefs can flip abruptly to bare rock. This map shows only the direction.)',
      },
      {
        t: 'A heatwave and sea star wasting',
        predict:
          'Two changes at once. One removes a predator, the other changes nutrients. Which matters more?',
        scenario: 'star-wasting',
        notice:
          'Both push kelp down: less nitrate means less growth, and fewer sea stars means more urchins. The map cannot say how much is due to each. That is an open question in real kelp forests.',
      },
    ],
  },

  'coral-reef': {
    bigIdea:
      'A reef is a rainforest in a desert: very high production in water with almost no nutrients. It works through recycling and partnerships. Corals farm algae inside their bodies, fish ferry nutrients between habitats, and sponges turn dissolved matter into food.',
    questions: [
      {
        t: 'How does a coral get its energy?',
        x: 'A coral is an animal. Why does it need sunlight?',
        look: [
          'sun>zoox:energy',
          'zoox>coral:energy',
          'zoo>coral:energy',
        ],
        notice:
          'Algae living inside the coral capture sunlight and pass sugars to it. Catching plankton adds a smaller part. A coral is part animal and part plant.',
      },
      {
        t: 'How does the coral pay the algae back?',
        x: 'The partnership goes both ways.',
        look: [
          'coral>zoox:nitrogen',
          'coral>zoox:phosphorus',
          'grunt>coral:nitrogen',
        ],
        notice:
          'The coral’s waste is the algae’s fertiliser, and resting fish add more. Waste from one partner feeds the other. Nothing is wasted.',
      },
      {
        t: 'How do fish move nutrients?',
        x: 'Fish rest in one place and feed in another.',
        look: [
          'sgr>grunt:energy',
          'grunt>coral:nitrogen',
          'grunt>coral:phosphorus',
        ],
        notice:
          'Grunts feed in seagrass at night and rest on coral by day, so they carry nutrients from one habitat to another in clear, nutrient-poor water.',
      },
      {
        t: 'Who competes for space, and who decides?',
        x: 'Algae and coral both need sunlight.',
        look: [
          'sun>turf:energy',
          'turf>parrot:energy',
          'parrot>turf:ctl',
          'turf>coral:ctl',
        ],
        notice:
          'Fast-growing algae overgrow coral unless grazers eat them. Grazers are what hold the algae back.',
      },
    ],
    activities: [
      {
        t: 'Bleaching',
        predict:
          'The coral loses its algae. What happens to its energy?',
        scenario: 'bleaching',
        notice:
          'The main energy source falls, so the coral starves unless it can catch enough plankton. Fish and other animals that depend on coral suffer next.',
      },
      {
        t: 'Fish out the grazers',
        predict: 'Who takes over the space?',
        scenario: 'herbivore-loss',
        notice:
          'Algae rise and press on coral. The nutrients were already there. What changed is who eats the algae.',
      },
    ],
  },

  'hydrothermal-vent': {
    bigIdea:
      'There is no sunlight. The energy comes from chemicals in hot water. Bacteria burn sulfide with oxygen, much as we burn food. That oxygen was made by photosynthesis near the surface, so a vent is not quite independent of the sun.',
    questions: [
      {
        t: 'What replaces the sun?',
        x: 'Find the arrows that start the web.',
        look: ['vent>mat:energy', 'vent>symb:energy'],
        notice:
          'Hot water from the seafloor carries sulfide. Bacteria get energy from it, just as plants get it from light. This is called chemosynthesis.',
      },
      {
        t: 'What does the oxygen do?',
        x: 'Sulfide on its own is not enough.',
        look: ['sea>mat:energy', 'sea>symb:energy'],
        notice:
          'Oxygen is what the bacteria burn the sulfide with. It comes from the surface, where plants and algae make it. So the vent still depends on sunlight, from far away.',
      },
      {
        t: 'How does a tubeworm eat with no mouth?',
        x: 'It has a partner living inside it.',
        look: ['symb>tube:energy', 'tube>symb:nitrogen'],
        notice:
          'Bacteria living inside the worm turn sulfide into food for it, and the worm supplies shelter and nutrients. It is another energy-for-nutrients partnership.',
      },
      {
        t: 'How is the energy passed up?',
        x: 'Trace a path from a bacterial mat to a fish.',
        look: [
          'mat>limpet:energy',
          'limpet>crab:energy',
          'crab>fish:energy',
        ],
        notice:
          'Mats, then grazers, then crabs, then fish. Short chains, because there is not much energy to share.',
      },
    ],
    activities: [
      {
        t: 'The vent fades',
        predict: 'How fast does the community starve?',
        scenario: 'vent-fades',
        notice:
          'Everything that depends on vent chemistry falls, from bacteria up. Vents are short-lived. Animals survive by sending larvae to find new ones, which is not an energy flow but is what keeps the community alive.',
      },
      {
        t: 'Less oxygen',
        predict:
          'The vent still pours out sulfide. Does the energy supply hold up?',
        scenario: 'low-oxygen',
        notice:
          'Not entirely. The bacteria need both sulfide and oxygen, and the smaller supply limits them.',
      },
    ],
  },
};
