# Wedding Invitation — Kustan &amp; Riana

Three files:

| File | What it is |
|---|---|
| `index.html` | The whole website. Self-contained, no build step. |
| `AppsScript.gs` | Code you paste into Google Apps Script so RSVPs reach your sheet. |
| `README.md` | This guide. |

---

## 1. Details already set

The `CONFIG` block at the top of `index.html` (around line 15) is already filled in:

```js
brideName:  "Riana",
groomName:  "Kustan",
initials:   "K&R",                        // on the gold wax seal
dateISO:    "2026-09-12T16:00:00+07:00",  // drives the countdown
dateText:   "Saturday, 12 September 2026",
ceremony:   "16.00 WIB",
reception:  "18.00 WIB — end",
venueName:  "The Royal Jade",
venueArea:  "Season City, Jakarta Barat",
```

Adjust the ceremony/reception times if needed. `dateISO` must keep the shape
`YYYY-MM-DDTHH:MM:SS+07:00` (`+07:00` = WIB).

`seedWishes` is intentionally empty — the wish wall only ever shows wishes
guests actually submit. It reads live from the **Wishes** tab once
`scriptUrl` (step 2) is set; until then it shows a "Be the first to send a
wish" placeholder.

---

## 2. Connect the Google Sheet (5 minutes)

The site cannot write to a spreadsheet directly — Google needs a small script
in the middle. This is the standard way and it's free.

1. Open your guest-list sheet:
   <https://docs.google.com/spreadsheets/d/16qAXuu0pmgA_6t5p8_atVW6RbFTNg0ERc-nqlI7_oEM/edit>
2. Menu: **Extensions → Apps Script**.
3. Delete whatever is in `Code.gs`, then paste in the entire contents of
   **`AppsScript.gs`**. Save (the disk icon).
4. Click **Deploy → New deployment**.
5. Click the gear next to "Select type" → **Web app**.
6. Set:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`  ← must be *Anyone*, not "Anyone with Google account"
7. **Deploy** → **Authorize access** → pick your Google account → "Advanced" →
   "Go to (project name) (unsafe)" → **Allow**.
   (That warning is normal for your own scripts.)
8. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfycb...../exec`
9. Paste it into `index.html`:

```js
scriptUrl:  "https://script.google.com/macros/s/AKfycb...../exec",
```

That's it. The script creates two tabs automatically the first time someone
submits:

**RSVP tab**

| Timestamp | Name | Phone | Attendance | Guests | Message |
|---|---|---|---|---|---|

**Wishes tab**

| Timestamp | Name | Wish |
|---|---|---|

Wedding wishes are also read back from that tab, so every guest sees the same
wall of wishes scrolling across the screen — nothing is hardcoded.

> If you ever edit `AppsScript.gs` later, you must **Deploy → Manage deployments
> → edit (pencil) → Version: New version → Deploy**, otherwise the old code
> keeps running.

---

## 3. Put it online

The site is one HTML file, so hosting is free and takes a minute. Pick one:

- **GitHub Pages** — this repo (`FilbertV/Wedding`) already has the code pushed.
  Go to **Settings → Pages**, set Source to `Deploy from a branch`, branch
  `main`, folder `/ (root)`, Save. Your link will be
  `https://filbertv.github.io/Wedding/`.
- **Netlify Drop** — <https://app.netlify.com/drop>, drag the folder in for an
  instant link.
- **Vercel** — <https://vercel.com/new>, import the `FilbertV/Wedding` repo.

Share the link on WhatsApp / Instagram. Opening it always starts on the sealed
envelope.

### Personalised links (optional)

Add `?to=` and the guest's name to greet them by name on the envelope screen:

```
https://filbertv.github.io/Wedding/?to=Kevin%20%26%20Sarah
```

Shows: *Dear Kevin & Sarah — Click the envelope to open*.
(`%20` = space, `%26` = `&`.)

---

## How it behaves

- **Envelope cover** — gold satin backdrop, floral sprigs, wax seal with "K&R".
  Tap (mobile) or click (desktop) anywhere on the envelope: the seal breaks,
  the flap folds open, the letter rises, a soft gold flash carries you into
  the invitation.
- **Invitation** — names, live countdown to 12 Sep 2026, ceremony/reception
  times, venue (The Royal Jade, Season City) with a "View location" button that
  opens Google Maps.
- **Wedding wishes** — two rows drifting in opposite directions, empty until
  guests submit. Hovering pauses them. A guest's own wish appears immediately
  after submitting.
- **RSVP** — gold button opens a form: name, WhatsApp, attending yes/no,
  number of guests, optional message. It writes straight into your sheet.

If `scriptUrl` is left empty, nothing breaks — submissions just stay on the
guest's own device instead of reaching the sheet. Fill it in before you share
the link.

---

## Small things you may want to change

| What | Where in `index.html` |
|---|---|
| Wish marquee speed | `.track{... animation:slide 46s ...}` and `.track.rev{animation-duration:58s}` — bigger = slower |
| Gold tone | the `:root` variables `--gold-1` … `--gold-5`, plus the `.satin` background |
| Envelope size | `.env-wrap{width:min(88vw,430px)}` |
| Hint text | the `#tapHint` div, currently "Click the envelope to open" |
| Guest count options | the `<select id="rGuests">` options |
