/**
 * Everything the site says about Echelon and its programs lives here, so a
 * season change is an edit to this file rather than to page markup.
 *
 * `verify` notes appear only in review mode. Resolve each one, then set
 * `review` to false before publishing.
 */

export const site = {
  review: true,
  name: "Echelon Community Athletics",
  legalName: "Echelon Community Athletics Inc.",
  url: "https://echeloncommunity.ca",
  email: "hello@echeloncommunity.ca",
  emailVerify: "Create this mailbox on echeloncommunity.ca (Cloudflare Email Routing is free) before launch.",
  corporationNumber: "1832701-7",
  incorporated: "20 October 2026",
  region: "Durham Region, Ontario",
  vision: "A place to play for everyone, in every community we reach.",
  mission:
    "Echelon Community Athletics Inc. promotes physical health, active living, and community connection through accessible recreational sports programs.",
  registerUrl: "https://www.pbsocial.ca/zubairs-leagues/schedule",
  registerVerify:
    "Create a separate Echelon organization on PB Social and point this link at it. Don't rename “Zubair's Leagues”: it is the default org every PB Social user joins.",
};

export type Who = "kids" | "adults" | "older";
export type LineId = "pickleball" | "youth" | "active" | "leagues" | "events";

export const whoLabels: Record<Who, string> = {
  kids: "Kids & teens",
  adults: "Adults",
  older: "55+",
};

export interface Line {
  id: LineId;
  name: string;
  short: string;
  /** Status of the line as a whole, shown on the homepage. */
  open: boolean;
}

/** Program lines: the five parts of the brand mark, in the order it steps up. */
export const lines: Line[] = [
  { id: "pickleball", name: "Pickleball", short: "Learn the game, then keep playing it.", open: true },
  { id: "youth", name: "Youth & Camps", short: "Day camps and after-school sport.", open: false },
  { id: "active", name: "Active 55+", short: "Daytime play at a friendly pace.", open: false },
  { id: "leagues", name: "Adult Leagues", short: "Volleyball, badminton and more.", open: false },
  { id: "events", name: "Events", short: "Socials, tournaments and team days.", open: false },
];

export const towns = [
  "Ajax",
  "Bowmanville",
  "Courtice",
  "Oshawa",
  "Pickering",
  "Port Perry",
  "Uxbridge",
  "Whitby",
] as const;

export interface Fact {
  label: string;
  value: string;
  verify?: string;
}

export interface Program {
  id: string;
  line: LineId;
  title: string;
  summary: string;
  who: Who[];
  activities: string[];
  status: "open" | "interest";
  /** Towns where it runs. Interest programs are region-wide. */
  where: string[];
  facts: Fact[];
  href?: string;
  verify?: string;
}

const PICKLEBALL_TOWNS = ["Whitby", "Ajax", "Oshawa", "Courtice", "Bowmanville", "Port Perry"];

export const programs: Program[] = [
  {
    id: "pickleball-learn",
    line: "pickleball",
    title: "Learn‑to‑play pickleball",
    summary:
      "An hour of coaching, then an hour of real games. Built for people who have never played, and for anyone who wants their game to feel easier.",
    who: ["adults", "older"],
    activities: ["Pickleball"],
    status: "open",
    where: PICKLEBALL_TOWNS,
    facts: [
      { label: "Format", value: "1 hr coaching + 1 hr games" },
      { label: "Length", value: "5 weekly sessions", verify: "Taken from the posters. Confirm for the current season." },
      { label: "Price", value: "$135", verify: "Taken from the posters. Confirm, and whether HST applies once Echelon registers." },
      { label: "Venue", value: "School gymnasiums" },
    ],
    href: "/programs/pickleball/",
    verify: "Confirm each town has a current or recent Echelon session (taken from poster files).",
  },
  {
    id: "youth-camps",
    line: "youth",
    title: "Multi-sport day camps",
    summary:
      "Week-long camps for school breaks: a different sport every day, games that build skills, and counsellors who keep it fun.",
    who: ["kids"],
    activities: ["Multi-sport"],
    status: "interest",
    where: [],
    facts: [{ label: "When", value: "Summer and March Break" }],
    verify: "Planned, not running. Tell families only what is decided; no dates or prices until staffing, safeguarding and insurance are in place.",
  },
  {
    id: "youth-afterschool",
    line: "youth",
    title: "After-school sport",
    summary: "Weekly sessions after the bell. Learn a new sport each term with friends from your area.",
    who: ["kids"],
    activities: ["Multi-sport", "Pickleball"],
    status: "interest",
    where: [],
    facts: [{ label: "When", value: "Weekdays after school" }],
  },
  {
    id: "active-55",
    line: "active",
    title: "Active 55+ daytime play",
    summary:
      "Daytime pickleball and movement sessions at a comfortable pace. Come for the game, stay for the company.",
    who: ["older"],
    activities: ["Pickleball", "Movement"],
    status: "interest",
    where: [],
    facts: [{ label: "When", value: "Weekday daytimes" }],
  },
  {
    id: "adult-leagues",
    line: "leagues",
    title: "Adult rec leagues",
    summary:
      "Co-ed volleyball, badminton and basketball in the same gyms we already use. Sign up solo or bring a team.",
    who: ["adults"],
    activities: ["Volleyball", "Badminton", "Basketball"],
    status: "interest",
    where: [],
    facts: [{ label: "When", value: "Weeknight evenings" }],
  },
  {
    id: "events",
    line: "events",
    title: "Socials and tournaments",
    summary:
      "Round-robins, season finales and community play days. A good first visit if you want to see what Echelon is like.",
    who: ["kids", "adults", "older"],
    activities: ["Pickleball", "Events"],
    status: "interest",
    where: [],
    facts: [{ label: "When", value: "A few times a season" }],
  },
];

export const activities = [...new Set(programs.flatMap((p) => p.activities))];

export const lineName = (id: LineId) => lines.find((l) => l.id === id)!.name;
