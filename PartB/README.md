# Part B — Event Stopwatch

## Description

A responsive, single-page stopwatch for timing named activities and organizing saved sessions by the date of the activity.

## Features

- Large read-only `HH:MM:SS` timer, with start, pause/resume, stop-and-save, and reset controls.
- Date and event-name inputs become disabled for the lifetime of an active (including paused) session.
- jQuery validation for date and event name, including the required character, length, and error-message rules.
- Saved sessions in local storage, newest saved sessions first, with date filtering and all-history statistics.
- Accessible confirmation modal for clearing history and in-page notifications instead of popup alerts.
- Responsive styling, color-coded controls, disabled states, and visually separated history entries.

## Technologies

HTML5, CSS3 (Flexbox and Grid), JavaScript ES6+ (`async`, `await`, Promises, `setInterval`, and `clearInterval`), and jQuery 3.7.1.

## How to run

Open `index.html` in a modern browser while connected to the internet so the page can load jQuery from its CDN. Select the activity date, enter an event name, and start timing. Saved history is local to the current browser.

## Bonus features

- History filtering leaves overall statistics unchanged, so they always describe all saved sessions.
- A confirmation dialog protects against accidentally clearing history.
- Activity names are rendered as text, and corrupt/unavailable browser storage is reported visibly.
