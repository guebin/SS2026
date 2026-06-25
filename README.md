# SS2026 — 통계적 사고와 사회 (Statistics for Thinking and Society)

A [Quarto](https://quarto.org) web book restoring the JBNU eNook lecture
material *통계적 사고와 사회* (한경수), based on *Statistics: Unlocking the
Power of Data* (Lock5).

**Live site:** https://guebin.github.io/SS2026/

## Contents

- **Chapters 0–5** — introduction, data collection, describing data,
  sampling distributions & confidence intervals, hypothesis testing, references.
- **Data** — 29 Lock5 datasets, each browsable in an embedded spreadsheet.
- **Widgets** — interactive spreadsheet (Univer), distribution calculator
  (jStat), R calculator (WebR), and a JupyterLite R/Python practice environment.

## Publishing

This repository holds the **published static site** under `docs/`.
GitHub Pages serves it from `main` / `docs` (note the `.nojekyll` file so that
Quarto's `*_files/` assets are not stripped by Jekyll).

To republish: re-render the source project (`quarto render`), copy the
resulting `_book/` into `docs/`, then commit and push.

---

Built with Quarto. Datasets © Lock5 (<https://www.lock5stat.com/>).
