# Magic Mirror

Magic Mirror is a lightweight, browser-based smart mirror interface. It is
designed to run on a display behind a two-way mirror, but it can also be
opened in any modern browser as a personal information dashboard.

The interface is intentionally minimal: a black background, white text, a
large clock, date information, a monthly calendar, weather details, and a
voice assistant named Elsa.

## Features

### Clock and date

- Displays the current time in a large, high-contrast format.
- Displays the current day, date, month, and year in Italian.
- Updates continuously while the page is open.

### Monthly calendar

- Generates a calendar for the current month.
- Uses Italian weekday abbreviations (`Lun`, `Mar`, `Mer`, `Gio`, `Ven`,
  `Sab`, `Dom`).
- Highlights the current day with a white border.

### Weather

- Shows the current weather for **Figline Valdarno** by default.
- Uses the OpenWeatherMap API with metric units and Italian descriptions.
- Displays:
  - City name
  - Weather description
  - Weather icon
  - Current temperature
  - Feels-like temperature
- Refreshes automatically every 10 minutes.
- The city can be changed by voice, for example:
  - `Ehi Elsa, meteo a Roma`
  - `Ehi Elsa, tempo a Milano`

Weather icons are stored locally in the [`img/`](./img)
folder for clear weather, clouds, rain, drizzle, thunderstorms, snow, and
mist.

### Voice assistant: Elsa

The application continuously listens for an Italian wake phrase. Supported
variations include `Ehi Elsa`, `Hey Elsa`, and similar pronunciations.

After the wake phrase is detected, Elsa listens for one command and replies
using the browser's Italian speech-synthesis voice when one is available.
While she is listening, the mirror receives a visual active-state effect.

Supported commands include:

- **Set a timer**
  - `Ehi Elsa, imposta un timer di 5 minuti`
  - `Ehi Elsa, timer di 30 secondi`
  - Supported units are seconds, minutes, and hours.
- **Delete a timer**
  - `Ehi Elsa, cancella timer numero 1`
  - `Ehi Elsa, elimina timer 1`
- **Ask for the weather**
  - `Ehi Elsa, meteo a Firenze`
  - `Ehi Elsa, tempo a Londra`
- **Ask for the time**
  - `Ehi Elsa, che ora è?`
- **Ask for the date**
  - `Ehi Elsa, che giorno è?`

Multiple timers can be active at the same time. Each timer is shown on the
screen with its number and a `HH:MM:SS` countdown. Elsa announces when a timer
starts and when it expires.

## Vertical-screen and mirrored-screen design

This project is thought for a **vertical (portrait) screen**, such as a
wall-mounted monitor or tablet placed behind a mirror. The layout is arranged
as a tall dashboard:

- The clock and date occupy the upper area.
- The calendar and weather are presented as two side-by-side information
  panels.
- Voice-assistant messages and timer output are placed below the main
  information.
- The black background and white text are suitable for a dark mirror surface.

For a physical magic mirror, place a display behind a two-way mirror and open
the application in a kiosk-style browser window. The content is not flipped by
the application itself: if the display or mirror installation requires a
horizontal flip, enable that option in the operating system, display driver,
browser kiosk configuration, or monitor settings.

The current styling does not include a dedicated responsive breakpoint for
landscape screens. Portrait orientation is therefore the recommended
installation format. The layout can still be previewed on a normal desktop
browser.

## Requirements

- A modern browser with support for:
  - JavaScript
  - `fetch`
  - Web Speech API speech recognition
  - Web Speech API speech synthesis
- Internet access for weather requests and the Google Fonts stylesheet.
- A valid OpenWeatherMap API key.
- A microphone for voice commands.
- Speaker output if spoken responses are desired.

Speech recognition and speech synthesis support varies by browser. Chromium
based browsers generally provide the most compatible implementation of the
Web Speech APIs. The browser may also require microphone permission and a
user interaction before audio can be played.

## Running the project

The browser interface is served by a small Node.js server. The server keeps
the OpenWeatherMap API key on the server side and exposes only a local
`/api/weather` endpoint to the browser. The API key is therefore no longer
included in the published JavaScript.

1. Clone the repository.
2. Install Node.js 18 or newer.
3. Install the dependencies:

   ```bash
   npm install
   ```

4. Copy `.example.env` to `.env`.
5. Put your private OpenWeatherMap key in `.env`:

   ```env
   OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
   ```

6. Start the application:

   ```bash
   npm start
   ```

7. Open `http://localhost:3000` in a supported browser.

Do not open `index.html` directly with a `file://` URL: the weather request
must pass through the Node.js server.

The `.env` file is ignored by Git and must never be committed. The
`.example.env` file is safe to publish and documents the required variable.
If the API key that was previously embedded in the client code was used
outside this private project, revoke it and create a replacement key in
OpenWeatherMap.

For a mirror installation, configure the browser to open the local server URL
in full-screen or kiosk mode when the device starts. On a hosted deployment,
configure `OPENWEATHERMAP_API_KEY` as a platform secret/environment variable;
do not upload `.env`.

## Project structure

```text
.
├── index.html       # Main page structure and dashboard containers
├── main.js          # Clock, calendar, weather, timers, and Elsa
├── server.js        # Static server and secure weather API proxy
├── style.css        # Dark mirror theme and portrait-oriented layout
├── .example.env     # Public environment-variable template
├── .gitignore       # Excludes .env and dependencies from Git
├── package.json      # Node.js metadata and start script
└── img/             # Local weather SVG icons
```

## Configuration

The default weather city is configured in `main.js`:

```js
window.mirrorCity = {
    current: "Figline Valdarno",
    previous: null
};
```

The weather API key is read by `server.js` from the
`OPENWEATHERMAP_API_KEY` environment variable. It is never read by
`main.js`, which calls the server-side `/api/weather` proxy instead. Keep
`.env` private and use `.example.env` when documenting the required
configuration.

The interface text, wake phrases, timer parsing, supported weather icons, and
voice settings are all implemented in `main.js`. Visual changes can be made in
`style.css`; the main containers are defined in `index.html`.

## Known limitations

- Weather depends on the OpenWeatherMap service and an available network
  connection.
- Weather API failures are not currently rendered as a dedicated error state
  in the dashboard.
- Voice commands depend on browser support, microphone permission, and
  recognition accuracy.
- Commands are currently designed for Italian.
- The page does not persist timers or the selected city after a reload.
- There is no task-list implementation yet even though the HTML contains a
  `tasks` container.
- The server must be configured with `OPENWEATHERMAP_API_KEY` before weather
  requests can succeed.
