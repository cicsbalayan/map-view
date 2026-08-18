import type { Office } from "@/lib/types"

export const CANTEEN_OFFICES: Office[] = [
  {
    id: "canteen-stall-1",
    name: "Stall 1",
    shortName: "Stall 1",
    guides: [
      {
        id: "canteen-stall-1-drinks-guide",
        title: "Drinks",
        content:
          "The drink counter serving milk teas, milkshakes, and other beverages made to order.",
      },
    ],
    notes: [
      {
        id: "canteen-stall-1-drinks",
        content:
          "A drink shop serving beverages, milk teas, milkshakes, and other drinks.",
        color: "blue",
      },
      {
        id: "canteen-stall-1-garbage",
        content: "Please return your garbage to the disposal bin after eating.",
        color: "yellow",
      },
    ],
  },
  {
    id: "canteen-stall-2",
    name: "Stall 2",
    shortName: "Stall 2",
    guides: [
      {
        id: "canteen-stall-2-eatery-guide",
        title: "Eatery",
        content:
          "Serves a variety of cooked foods and rice meals. Hot dishes are prepared through the day.",
      },
    ],
    notes: [
      {
        id: "canteen-stall-2-eatery",
        content: "An eatery offering a variety of foods.",
        color: "green",
      },
      {
        id: "canteen-stall-2-garbage",
        content: "Please return your garbage to the disposal bin after eating.",
        color: "yellow",
      },
    ],
  },
  {
    id: "canteen-stall-3",
    name: "Stall 3",
    shortName: "Stall 3",
    guides: [
      {
        id: "canteen-stall-3-street-food-guide",
        title: "Street Food",
        content:
          "Grab-and-go street food like kwek-kwek, fishball, squidball, and kikiam, served with dipping sauces.",
      },
    ],
    notes: [
      {
        id: "canteen-stall-3-street-food",
        content:
          "A street food shop serving kwek-kwek, fishball, squidball, kikiam, and more.",
        color: "yellow",
      },
      {
        id: "canteen-stall-3-garbage",
        content: "Please return your garbage to the disposal bin after eating.",
        color: "yellow",
      },
    ],
  },
  {
    id: "canteen-rotc-storage",
    name: "ROTC Office",
    shortName: "ROTC",
    guides: [
      {
        id: "canteen-rotc-storage-cadets",
        title: "Cadet Officers",
        content:
          "Serves as the headquarters for the cadet officers, where planning, briefings, and unit meetings are held.",
      },
      {
        id: "canteen-rotc-storage-gear",
        title: "Equipment & Uniforms",
        content:
          "ROTC items such as uniforms and training equipment are stored here. Cadets sign out items before activities and return them after.",
      },
    ],
    notes: [
      {
        id: "canteen-rotc-storage-items",
        content:
          "Serves as the ROTC office where most of the cadet officers and ROTC items, including uniforms and equipment, are kept.",
        color: "yellow",
      },
      {
        id: "canteen-rotc-dmst",
        content:
          "Also known as DMST (Department of Military Science and Tactics).",
        color: "blue",
      },
      {
        id: "canteen-rotc-restricted",
        content:
          "Prohibited for regular students. Must be accompanied by a ROTC officer if there is any agenda inside the DMST.",
        color: "pink",
      },
    ],
  },
]
