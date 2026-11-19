export const pickleballSeries = [
  {
    name: "Port Perry Learn-to-Play",
    venue: "Port Perry High School",
    schedule: "Mondays, 8–10 p.m. · Nov 2–Dec 21, 2026",
    endsOn: "2026-12-21",
    fee: "$115 by e-transfer or $129.95 by card",
    action: "Join the PB Social waitlist",
    url: "https://www.pbsocial.ca/s/cmvhgr4ph000107js20g04vyi",
  },
  {
    name: "Port Perry Learn-to-Play",
    venue: "Good Shepherd Catholic School",
    schedule: "Thursdays, 8–10 p.m. · Through Dec 10, 2026",
    endsOn: "2026-12-10",
    fee: "$135 by e-transfer or $152.55 by card",
    action: "Check spots on PB Social",
    url: "https://www.pbsocial.ca/s/cmw49svgj000g07jgxojcghng",
  },
  {
    name: "Whitby Learn-to-Play",
    venue: "Anderson Collegiate and Vocational Institute",
    schedule: "Wednesdays, 8–10 p.m. · Nov 4–Dec 2, 2026",
    endsOn: "2026-12-02",
    fee: "$152.55 by card for the remaining series",
    action: "Check spots on PB Social",
    url: "https://www.pbsocial.ca/s/cmvq2k5m3000108jyfak8199m",
  },
  {
    name: "Bowmanville Learn-to-Play",
    venue: "Clarington Central Secondary School",
    schedule: "Tuesdays, 6–8 p.m. · Nov 3–Dec 15, 2026",
    endsOn: "2026-12-15",
    fee: "$135 by e-transfer or $152.55 by card",
    action: "Check spots on PB Social",
    url: "https://www.pbsocial.ca/s/cmvnucgbk000108lc9tg5m7n2",
  },
];

export function pickleballLocalDate() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Toronto", dateStyle: "short" }).format(new Date());
}
