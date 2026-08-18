import type { Office } from "@/lib/types"

export const EEB_OFFICES: Office[] = [
  {
    id: "eeb-ocd",
    name: "Office of the Campus Director",
    shortName: "OCD",
    room: "1F",
    guides: [
      {
        id: "eeb-ocd-guide",
        title: "Campus Director",
        content:
          "The office of the Campus Director, who oversees the overall operations and administration of the campus.",
      },
    ],
    notes: [
      {
        id: "eeb-ocd-note",
        content: "Visit during office hours for appointments and concerns.",
        color: "yellow",
      },
    ],
  },
  {
    id: "eeb-accreditation",
    name: "Accreditation Office",
    shortName: "Accre",
    room: "1F",
    guides: [
      {
        id: "eeb-accreditation-guide",
        title: "Accreditation",
        content:
          "Handles accreditation matters and documentation for the campus and its programs.",
      },
    ],
    notes: [
      {
        id: "eeb-accreditation-lices",
        content: "Accre is where you can buy ID laces.",
        color: "blue",
      },
    ],
  },
  {
    id: "eeb-int-lab",
    name: "Internet Laboratory",
    shortName: "Int Lab",
    room: "1F",
    guides: [
      {
        id: "eeb-int-lab-guide",
        title: "Internet Laboratory",
        content:
          "Provides internet access and online research facilities for students.",
      },
    ],
    notes: [
      {
        id: "eeb-int-lab-note",
        content: "Log in with your student account when using the lab.",
        color: "green",
      },
    ],
  },
  {
    id: "eeb-ict",
    name: "ICT Office",
    shortName: "ICT",
    room: "1F",
    guides: [
      {
        id: "eeb-ict-guide",
        title: "ICT Office",
        content:
          "Holds the campus server and the network system, and handles information technology concerns.",
      },
    ],
    notes: [
      {
        id: "eeb-ict-note",
        content: "Report connectivity or account issues here.",
        color: "yellow",
      },
    ],
  },
  {
    id: "eeb-com-lab",
    name: "Computer Laboratory",
    shortName: "Com Lab",
    room: "1F",
    guides: [
      {
        id: "eeb-com-lab-guide",
        title: "Computer Laboratory",
        content:
          "Equipped with computer units for student use, classes, and examinations.",
      },
    ],
    notes: [
      {
        id: "eeb-com-lab-note",
        content: "Reserve a workstation before your scheduled session.",
        color: "blue",
      },
    ],
  },
  {
    id: "eeb-ogc",
    name: "Office of Guidance and Counseling",
    shortName: "OGC",
    room: "2F",
    guides: [
      {
        id: "eeb-ogc-guide",
        title: "Guidance & Counseling",
        content:
          "Provides guidance, counseling, and student welfare services.",
      },
    ],
    notes: [
      {
        id: "eeb-ogc-note",
        content: "Counseling sessions are private and confidential.",
        color: "pink",
      },
    ],
  },
  {
    id: "eeb-faculty-1",
    name: "Faculty 1",
    shortName: "Faculty 1",
    room: "2F",
    guides: [
      {
        id: "eeb-faculty-1-guide",
        title: "Guest Lecturers",
        content: "A lounge used purely by guest lecturers.",
      },
    ],
    notes: [
      {
        id: "eeb-faculty-1-guests",
        content: "Purely guest lecturers are lounged here.",
        color: "yellow",
      },
    ],
  },
  {
    id: "eeb-library",
    name: "Library",
    shortName: "Library",
    room: "2F",
    guides: [
      {
        id: "eeb-library-guide",
        title: "Library",
        content:
          "Offers reading and study areas, reference materials, and book borrowing services.",
      },
    ],
    notes: [
      {
        id: "eeb-library-hours",
        content: "The library is open from Monday to Thursday only.",
        color: "blue",
      },
      {
        id: "eeb-library-attendance",
        content:
          "Entering students must enter their SR-Code on the computer beside the door for attendance/record purposes.",
        color: "yellow",
      },
      {
        id: "eeb-library-bags",
        content:
          "Place your bags and other belongings on the designated shelves and make sure they are properly arranged.",
        color: "yellow",
      },
      {
        id: "eeb-library-borrow",
        content:
          "If you need to borrow a book or tablet, ask assistance from the assigned librarian.",
        color: "yellow",
      },
      {
        id: "eeb-library-take-home",
        content:
          "If you need to take a book home, make sure to log the borrowing transaction for record purposes and leave your Student ID with the librarian.",
        color: "yellow",
      },
      {
        id: "eeb-library-silence",
        content:
          "Keep your voice low and maintain silence inside the library to avoid disturbing other students.",
        color: "yellow",
      },
      {
        id: "eeb-library-care",
        content:
          "Always keep the library clean, organized, and treat all books, tablets, and other facilities with care.",
        color: "green",
      },
    ],
  },
  {
    id: "eeb-room-6",
    name: "EEB room 6",
    shortName: "EEB 6",
    room: "2F",
    guides: [
      {
        id: "eeb-room-6-guide",
        title: "Classroom",
        content: "A classroom on the second floor used for lectures and classes.",
      },
    ],
    notes: [
      {
        id: "eeb-room-6-note",
        content: "Keep the room clean and return chairs after use.",
        color: "yellow",
      },
    ],
  },
  {
    id: "eeb-admin",
    name: "Administrative Office",
    shortName: "Admin",
    room: "2F",
    guides: [
      {
        id: "eeb-admin-guide",
        title: "Administrative Office",
        content:
          "Handles administrative matters, records, and general office concerns.",
      },
    ],
    notes: [
      {
        id: "eeb-admin-note",
        content: "Set an appointment with the admin staff for requests.",
        color: "green",
      },
    ],
  },
]
