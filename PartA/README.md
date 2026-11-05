# Part A — Husky Calculator

## Description

A two-page calculator application with Northeastern email sign-in, client-side session handling, and four basic arithmetic operations.

## Features

- jQuery validation on keyup and blur for Northeastern email and password.
- Disabled sign-in button until both fields are valid; generic credential errors and an animated success state.
- Session storage by default, or local storage when “Remember me” is selected.
- Calculator page authentication check, personalized greeting, and animated logout.
- Add, subtract, multiply, and divide using one shared arrow function.
- Validation for empty, malformed, non-finite, decimal, and negative number input; division by zero is handled.
- Responsive layout and accessible field/error messaging.

## Technologies

HTML5, CSS3 (Flexbox and Grid), JavaScript ES6+, and jQuery 3.7.1.

## Demo credentials

Use either account; both use the same demo password:

| Email | Password |
|---|---|
| `alex.johnson@northeastern.edu` | `Password123!` |
| `jordan.lee@northeastern.edu` | `Password123!` |

These are demo-only hardcoded credentials and must not be used for real accounts.

## How to run

Open `login.html` in a modern browser while connected to the internet so the page can load jQuery from its CDN. Sign in with a demo account, then use the operation buttons on the calculator page. Choosing “Remember me” keeps the demo session in local storage; otherwise it lasts only for the browser tab session.

## Bonus features

- Accessible live regions and `aria-invalid` feedback.
- Results are rounded to a readable precision, and non-finite results are rejected.
- Keyboard-friendly focus indicators.
