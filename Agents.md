# Ender Games — Agent & Architecture Guide

> A multipurpose Discord bot built with **discord.js v14**, backed by **MongoDB**, and running on **Node.js (ESM)**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Bot Lifecycle](#bot-lifecycle)
- [Commands](#commands)
  - [Anigame Donations](#anigame-donations)
  - [Misc](#misc)
  - [Reminders](#reminders)
- [Data Access Layer (DAO)](#data-access-layer-dao)
- [Utilities](#utilities)
- [Configuration & Environment](#configuration--environment)
- [Data Models](#data-models)
- [Adding a New Command](#adding-a-new-command)
- [Running the Bot](#running-the-bot)

---

## Overview

**Ender Games** is a multipurpose Discord bot designed for gaming communities. Its primary features include:

- **Anigame Donation Tracking** — Automatically intercepts the Anigame bot's donation-success embeds and logs gold donations per member, with admin overrides and weekly reset capabilities.
- **Rock Paper Scissors (RPS)** — An interactive, button-based PvP game with persistent win/loss tracking stored in MongoDB.
- **Reminders** — A slash-command–based reminders panel (WIP).
- **General Utilities** — `ping`, `help`, and an extensible command framework.

---

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Runtime        | Node.js v23+ (ESM modules)         |
| Bot Framework  | discord.js v14                      |
| Database       | MongoDB (via `mongodb` driver v7)   |
| Env Management | `dotenv`                            |
| Linting        | ESLint v9                           |

---

## Project Structure

```
ender-games-js/
├── commands/
│   ├── AnigameDonations/
│   │   ├── AddDonation.js        # Admin: manually add a member's donation
│   │   ├── ResetWeekly.js        # Admin: deduct weekly amount from all members
│   │   └── viewAnigameDonations.js  # View donation leaderboard
│   ├── Reminders/
│   │   └── reminders.js          # Slash command: show reminders panel
│   └── misc/
│       ├── help.js               # List all commands / command details
│       ├── ping.js               # Simple latency check
│       └── rps.js                # Rock Paper Scissors (PvP, button-based)
├── DAO/
│   ├── AnigameDonationsDAO.js    # MongoDB queries for donation data
│   └── rps.js                    # MongoDB queries for RPS scores
├── utils/
│   ├── AnigameDonationsManager.js # Business logic for donation tracking
│   ├── constants.js              # Shared enums (DonationTypes)
│   ├── helper.js                 # General-purpose helpers
│   └── rps.js                    # RPS game logic, UI components, scoring
├── config.js                     # Centralised config from env vars
├── deploy-commands.js            # One-off script to register slash commands
├── index.js                      # Entry point — client setup & event handlers
├── models.json                   # Example data model / schema reference
├── package.json
└── .env / .env.dev               # Environment variables (not committed)
```

---

## Bot Lifecycle

The startup sequence in `index.js` follows this order:

1. **Database Connection** — Connects to MongoDB using the URI from environment variables and pings the database to confirm connectivity.
2. **Channel Prefetch** — Fetches all Anigame donation channel IDs from the database so the bot knows which channels to monitor.
3. **Client Initialisation** — Creates a `discord.js` `Client` with a broad set of gateway intents (guilds, members, messages, reactions, DMs, presence, voice, etc.).
4. **Command Loading** — Dynamically reads all `.js` files from each subfolder in `commands/` and registers them in a `Collection` keyed by command name.
5. **Event Handlers**:
   - `ClientReady` — Logs the bot's tag on successful login.
   - `MessageCreate` — The core message handler:
     - Checks if the message is in a donation channel → auto-logs donations.
     - Checks for the configured prefix → routes to the matching command.
     - Enforces guild-only, permissions, required arguments, and cooldowns before executing.
6. **Login** — Authenticates with the Discord API using the bot token.

---

## Commands

### Anigame Donations

| Command         | Usage                             | Permission    | Description                                    |
| --------------- | --------------------------------- | ------------- | ---------------------------------------------- |
| `AddDonation`   | `h.adddonation @user <amount>`    | Administrator | Manually log a donation for a mentioned member |
| `ResetWeekly`   | `h.resetweekly <amount>`          | Administrator | Deduct the weekly required amount from all members |
| `Donations`     | `h.donations`                     | Clan Member   | View donation leaderboard with dues            |

**Auto-logging**: When the Anigame bot (`571027211407196161`) posts a donation-success embed in a tracked channel, the bot parses the summoner name and gold amount via regex, resolves the Discord user, and logs the donation automatically.

### Misc

| Command | Usage              | Cooldown | Description                               |
| ------- | ------------------ | -------- | ----------------------------------------- |
| `ping`  | `h.ping`           | —        | Replies "Pong." for a simple health check |
| `help`  | `h.help [command]` | —        | Lists all commands or details for one     |
| `rps`   | `h.rps @user`      | 5s       | Starts a Rock Paper Scissors match with interactive buttons. Tracks persistent scores per player pair. |

### Reminders

| Command     | Usage         | Type          | Description                    |
| ----------- | ------------- | ------------- | ------------------------------ |
| `reminders` | `/reminders`  | Slash Command | Shows the reminders panel (WIP)|

---

## Data Access Layer (DAO)

### `AnigameDonationsDAO.js`

| Function                          | Description                                                |
| --------------------------------- | ---------------------------------------------------------- |
| `findMemberInDonations(conn, id)` | Finds a member across all donation records                 |
| `getDonations(conn, serverId)`    | Retrieves the full donation document for a server          |
| `getAnigameDonationChannelByServer(conn, serverId)` | Gets the tracked donation channel for a specific server |
| `getAnigameDonationChannels(conn)` | Returns all tracked donation channel IDs across all servers |
| `resetWeeklyDonation(conn, ...)`   | Decrements all member amounts and pushes a reset log entry |

### `rps.js` (DAO)

| Function                              | Description                                        |
| ------------------------------------- | -------------------------------------------------- |
| `rpsDAO.getScore(conn, playerId, opponentId)` | Retrieves (or initialises) a player's score against a specific opponent |
| `rpsDAO.updateWinner(conn, winner, loser)`    | Increments the winner's score against the loser    |

---

## Utilities

### `AnigameDonationsManager.js`

Core business logic for donation tracking:

- **`logDonation`** — Intercepts Anigame bot embeds, extracts summoner name + gold via regex, resolves the Discord member, and persists the donation.
- **`logDonationInDb`** — Writes a donation record (amount + log entry) to MongoDB.
- **`updateMemberOrAddNew`** — Upserts: increments an existing member's total or inserts a new member document.
- **`buildDonationsViewEmbed`** — Constructs a rich embed showing donation standings and due members.
- **`resetWeeklyDonation`** — Deducts the weekly requirement from all members and logs the reset.

### `rps.js` (Utility)

RPS game engine:

- **`ANSWER_RPS`** — Maps each choice to the choice it beats.
- **`row`** — Pre-built `ActionRowBuilder` with Rock / Paper / Scissors buttons.
- **`declareWinner`** — Determines the match result, updates scores in MongoDB, and edits the game message.
- **`getScores`** — Fetches both players' scores for the head-to-head display.

### `helper.js`

| Function       | Description                                     |
| -------------- | ----------------------------------------------- |
| `getUserId`    | Extracts a user ID from a mention string        |
| `formatAmount` | Formats a number with locale-aware separators   |
| `getNumbers`   | Filters an args array down to numeric values    |

### `constants.js`

```js
DonationTypes = { None: 0, Self: 1, Admin: 2 }
```

---

## Configuration & Environment

All configuration flows through `config.js`, which reads from environment variables:

| Variable        | Config Key       | Purpose                           |
| --------------- | ---------------- | --------------------------------- |
| `BOT_PREFIX`    | `prefix`         | Command prefix (e.g. `h.`)       |
| `CLIENT_ID`     | `clientId`       | Discord application client ID     |
| `GUILD_ID`      | `guildId`        | Target guild for dev/testing      |
| `BOT_TOKEN`     | `token`          | Discord bot authentication token  |
| `DATABASE_URI`  | `database.URI`   | MongoDB connection string         |
| `DATABASE_NAME` | `database.DB`    | MongoDB database name             |

**Environment files**:
- `.env` — Production environment
- `.env.dev` — Development environment

---

## Data Models

### Server / Anigame Donations (MongoDB `server` collection)

```json
{
  "ServerId": "<discord_guild_id>",
  "AnigameDonations": [
    {
      "Channel": "<channel_id>",
      "Amount": 0,
      "Members": [
        {
          "Id": "<discord_user_id>",
          "amount": 0,
          "Logs": [
            {
              "Date": "ISO-8601",
              "Amount": 0,
              "Link": "https://discord.com/channels/...",
              "type": 1
            }
          ]
        }
      ],
      "Logs": [
        {
          "Date": "ISO-8601",
          "Amount": 0,
          "By": "<admin_user_id>"
        }
      ]
    }
  ]
}
```

### RPS Scores (MongoDB `rps` collection)

```json
{
  "player": "<discord_user_id>",
  "opponent": [
    {
      "id": "<opponent_user_id>",
      "score": 0
    }
  ]
}
```

### Reminders (Planned — from `models.json`)

```json
{
  "member": "<discord_user_id>",
  "reminders": {
    "izzi": {
      "vote": { "enabled": true, "active": true, "sendWhere": "channel", ... },
      "lottery": { ... },
      "raid": { ... }
    },
    "anigame": {
      "vote": { ... }
    }
  }
}
```

---

## Adding a New Command

1. **Create a file** in the appropriate `commands/<category>/` folder.

2. **Export the required properties**:

```js
const name = 'mycommand';             // Must be lowercase
const description = 'What it does';
const usage = '<arg1> <arg2>';         // Optional
const haveArgs = true;                 // Optional — enforces argument presence
const guildOnly = true;                // Optional — blocks DM usage
const cooldown = 3;                    // Optional — seconds between uses
const permissions = PermissionFlagsBits.Administrator; // Optional
const aliases = ['mc', 'mycmd'];       // Optional

const execute = async (message, client, conn, args) => {
  // Your command logic here
};

export { name, description, usage, haveArgs, guildOnly, cooldown, permissions, aliases, execute };
```

3. **Restart the bot** — commands are loaded dynamically from the filesystem at startup.

---

## Running the Bot

```bash
# Install dependencies
npm install

# Development (uses .env.dev)
npm run dev

# Production (uses .env)
npm start

# Register slash commands (one-time)
node deploy-commands.js
```

---

## Key Design Decisions

- **Prefix-based commands** (`MessageCreate`) are used for the primary command system, with slash commands reserved for future features like Reminders.
- **Dynamic command loading** — Adding a `.js` file to a `commands/` subfolder auto-registers it; no manual wiring needed.
- **DAO pattern** — Database queries are isolated from business logic, making it straightforward to swap storage backends or add caching.
- **Cooldown system** — Per-user, per-command cooldowns are enforced at the framework level in `index.js`, not within individual commands.
