# MOK SEO Search Console — API extract (5 November 2026)

**Source:** Connected Windsor.ai `searchconsole` connector for `https://www.mokcarrental.com/`. **Data window:** 7 October–3 November 2026 inclusive. This is a read-only API extract, not a manually verified Google Search Console dashboard export.

## Search Analytics queries

Connector returned 106 query rows. Search Console may withhold anonymized queries and aggregation changes when dimensions are included; **query-row totals must not be treated as complete site totals.**

| Query classification (manual, approximate) | Visible query rows | Clicks in visible rows | Impressions in visible rows |
|---|---:|---:|---:|
| MOK Car Rental brand phrases | 1 | 0 | 2 |
| Other queries | 105 | 5 | 612 |

Classification uses 'MOK Car Rental' / 'mokcarrental' phrases only; ambiguous queries like 'mok car' are not assumed to be branded. The connector's native `branded_vs_nonbranded` dimension marked even 'mok car rental' as nonbranded on this pull, so its native classification was not used.

### Top visible queries by impressions

| Query | Clicks | Impressions | Avg position |
|---|---:|---:|---:|
| car rental johor bahru | 0 | 109 | 41.8 |
| car rental jb | 0 | 56 | 35.5 |
| car rental johor bahru airport | 0 | 30 | 42.2 |
| car rental johor | 0 | 27 | 50.1 |
| johor car rental | 0 | 24 | 39.4 |
| cheap car rental johor bahru | 0 | 23 | 45.9 |
| johor bahru car rental | 1 | 22 | 35 |
| johor bahru car rentals | 0 | 21 | 32.8 |
| long term car rental johor bahru | 0 | 20 | 38.4 |
| car rent johor | 0 | 17 | 47 |
| car rental in johor bahru | 0 | 14 | 42.9 |
| car rental johor bahru with driver | 0 | 13 | 23.5 |
| car rental johor airport | 0 | 11 | 49.2 |
| jb car rental | 0 | 11 | 43.5 |
| luxury car rental johor bahru | 0 | 11 | 19.1 |
| car rental with driver johor bahru | 0 | 10 | 34.1 |
| alphard rental jb | 0 | 8 | 7.8 |
| johor bahru car hire | 0 | 7 | 40.1 |
| car hire in johor bahru | 0 | 6 | 39.8 |
| car hire johor bahru | 0 | 6 | 41 |
| car rental senai airport | 0 | 6 | 50.3 |
| rent car johor bahru | 0 | 6 | 41 |
| car rental malaysia jb | 0 | 5 | 47.4 |
| cheap car rental in johor bahru | 0 | 5 | 50.6 |
| rent a car johor bahru | 0 | 5 | 49.4 |
| sewa kereta jb singapore | 0 | 5 | 48.8 |
| alquiler de autos cerca de estación johor bahru station | 0 | 4 | 40.3 |
| best car rental johor bahru | 0 | 4 | 15.8 |
| car rental in jb | 0 | 4 | 33.3 |
| jb car rental for singaporean | 0 | 4 | 18.5 |

## Search Analytics landing pages

Connector returned 1 page rows. Page-level totals also differ from query-dimension totals.

| Landing page | Clicks | Impressions | Avg position |
|---|---:|---:|---:|
| https://www.mokcarrental.com/ | 26 | 950 | 27.8 |

## Sitemap status / Page Indexing / canonical status

Sitemap fields returned 1 record(s), but no usable sitemap URL or submission timestamps; the available row had a null path and zero counts. This **does not establish a healthy sitemap**.

**Unavailable via this connection:** the Google Search Console Page Indexing report; the Google-selected canonical field from URL Inspection; live URL Inspection results; and URL Inspection 'Request Indexing' actions.

## T1 / T2 follow-up for authorized Google Search Console operator

1. In Google Search Console, select `https://www.mokcarrental.com/`. Export **Indexing → Pages** and **Sitemaps**, including indexed/not-indexed reasons, affected URLs, and submission/last-read results.
2. Use **URL Inspection** on `/`, `/senai-airport-car-rental`, and `/toyota-alphard-rental-jb`; record Google-selected canonical and last crawl separately for each page.
3. Use **Request Indexing** for those three URLs if the inspected properties and access allow it. Record request outcome and timestamps; do not claim the request guarantees recrawl or new search titles.
4. Reconcile complete Search Console site totals with these API samples; do not extrapolate query-row counts into total traffic.

## Changes and scope

No indexing requests, DNS changes, SEO content rewrites, PWA changes, or Production changes were made by generating this report.