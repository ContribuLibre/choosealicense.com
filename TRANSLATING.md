# Translating choosealicense.com

The site can be displayed in several languages. The default language (English)
lives at the site root (e.g. `/licenses/mit/`); every other language is generated
from the **same source files** under its own prefix (e.g. `/fr/licenses/mit/`) by
[jekyll-polyglot](https://github.com/untra/polyglot). There is **no per-language
copy of any page or license** — translations are data overlays, and anything that
isn't translated yet automatically falls back to English. A partial translation
never breaks the build.

## Three things, three different skill sets

Translation is split deliberately so the right people work on the right parts, and
so that **legally meaningful text is never translated**.

| Tier | What | Where | Who |
|------|------|-------|-----|
| 1. **Interface** | Buttons, menus, headings, page prose, rule labels | `_data/i18n/<lang>/ui.yml` and `_data/i18n/<lang>/rules.yml` | Anyone fluent in the language |
| 2. **License summaries** (no legal value) | The `description` / `how` / `note` shown *about* a license | `_data/i18n/<lang>/licenses.yml` | Someone comfortable with licensing concepts |
| 3. **License legal text** | The body of `_licenses/*.txt` | — | **Nobody — never translated** |

Why tier 3 is off-limits: a license's operative text is the English (or official)
version. Some licenses have official or semi-official translations with their own
status, and downstream tooling such as [licensee](https://github.com/licensee/licensee)
keys off the canonical text. Translating it here would be misleading and could have
legal consequences, so the legal text is always shown as-is.

## How the files fit together

```
_data/i18n/
  en/ui.yml          # English UI + page prose — the canonical source / base file
  fr/ui.yml          # French UI + page prose
  fr/licenses.yml    # French license summaries  (English = the _licenses/*.txt front matter)
  fr/rules.yml       # French rule labels        (English = _data/rules.yml)
```

English is the source of truth: UI strings live in `en/ui.yml`, license summaries
live in each license's front matter, and rule labels live in `_data/rules.yml`.
Other languages only need to provide what they translate.

## Adding a new language

1. Add the language code to `languages:` in [`_config.yml`](_config.yml).
2. Create `_data/i18n/<code>/ui.yml`. The quickest start is to copy
   `_data/i18n/en/ui.yml` and translate the values (keep the keys).
3. Optionally add `_data/i18n/<code>/licenses.yml` and
   `_data/i18n/<code>/rules.yml` to translate the tier-2 content.

That's it — the new language is built at `/<code>/…`, a selector entry appears, and
the language is offered to matching browsers. Anything you didn't translate shows
in English.

### Keys

* `ui.yml` keys are flat. Keys ending in `_html` contain raw HTML; everything else
  is Markdown. Keep links and anchors (e.g. `#for-users`) intact.
* Placeholders like `%title%`, `%projects%`, `%license%`, `%language%` are
  filled in by the site — keep them.
* `licenses.yml` is keyed by the lowercased SPDX id (e.g. `mit`, `gpl-3.0`).
* `rules.yml` mirrors `_data/rules.yml`: `<group>` → `<tag>` → `{ label, description }`.

A lightweight test (`spec/i18n_spec.rb`) checks that translations only use keys
that exist in English and that license/rule ids are valid. It does **not** require
translations to be complete.

## Translating with Weblate

The files above are plain monolingual YAML, which Weblate handles natively. A
typical component setup:

* **File format:** YAML
* **Monolingual base language file:** `_data/i18n/en/ui.yml`
* **File mask:** `_data/i18n/*/ui.yml`
* **Template for new translations:** `_data/i18n/en/ui.yml`

Add separate components for `rules.yml` (base `_data/rules.yml` is a different
shape, so use a `<lang>/rules.yml` mask with English context) and, for tier-2
contributors, `licenses.yml`. Weblate then opens pull requests against this
repository; maintainers just review and merge — no extra build steps.

## Notes for template authors (polyglot gotchas)

If you edit the templates that build the multilingual links, two non-obvious
[polyglot](https://github.com/untra/polyglot) behaviours can bite — both are
already handled in the codebase, so just don't undo them:

* **Placeholders use `%name%`, not `%{name}`.** They're substituted with Liquid's
  `replace` filter (e.g. `{{ s | replace: '%title%', license.title }}`). A `}` in a
  `replace` argument is read as the end of the `{{ … }}` tag and breaks the build, so
  the brace-free `%name%` form is used everywhere (UI strings, `replace` calls, JS).
* **In `hreflang` `<link>` tags, write `href` before `hreflang`.** Polyglot rewrites
  internal URLs per language but deliberately skips any link matching
  `hreflang="<default_lang>" href=…`. With the reverse order the default language's
  alternate would ship polyglot's internal `ferh=` placeholder instead of `href=`.
  See the comment in [`_includes/header.html`](_includes/header.html).

Also note: polyglot is not a GitHub Pages plugin, so its tags (e.g. `static_href`)
only resolve when the site is built outside Pages' safe mode — i.e. via the Actions
workflow or a local `jekyll serve`/`build`, never the native Pages build.
