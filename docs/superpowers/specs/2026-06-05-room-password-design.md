# Room Password Protection — Design Spec

**Date:** 2026-06-05
**Status:** Approved

## Overview

Add optional password protection to study rooms so room creators can restrict access. Rooms with passwords show a lock indicator in the room list. Non-creator users must enter the correct password to join.

## Design Decisions

- **Creator bypass:** The room creator skips password verification when re-entering their own room (`creatorId === userId`)
- **Immutable password:** Password is set at creation only, cannot be modified or removed afterwards

## Backend Changes

### Database

`rooms` table — new column:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `password` | VARCHAR(255) | YES | NULL | bcrypt hash; NULL = no password |

### Sequelize Model (`backend/src/models/Room.ts`)

Add `password` field: `DataTypes.STRING`, `allowNull: true`, `defaultValue: null`.

### API Routes (`backend/src/routes/rooms.ts`)

**`GET /api/rooms`** — Include `hasPassword: !!room.password` in each room object. Never return the raw hash.

**`POST /api/rooms`** — Accept optional `password` in body:
- If provided: validate 4-16 characters, bcrypt hash (cost 10), store in DB
- If empty/absent: store NULL

**`POST /api/rooms/:id/join`** — Accept optional `password` in body:
- If room has no password → allow join (existing behavior)
- If room has password AND `req.user.id === room.creatorId` → allow join (creator bypass)
- If room has password AND `req.user.id !== room.creatorId` → verify bcrypt.compare; return 403 `{ error: 'Incorrect password' }` on failure

No other routes change.

### Dependencies

Add `bcrypt` (or `bcryptjs`) to `backend/package.json`.

## Frontend Changes

### Types (`src/types/index.ts`)

Add `hasPassword: boolean` to `Room` interface.

### API Functions (`src/utils/api.ts`)

- `createRoom()` — add `password?: string` to data param
- `joinRoom()` — add `password?: string` to data param

### StudyRoomList.vue

**Create dialog form:**
- New field: `form.password` (string, optional)
- Password input in dialog (type=password with show/hide toggle)
- Validation: if non-empty, 4-16 characters
- Clear on dialog close

**Room cards:**
- Show 🔒 icon next to room name when `hasPassword === true`
- Show 🔓 icon (or nothing) when `hasPassword === false`
- Small red tag "加密" next to online count for password-protected rooms

**Join flow:**
- On card click: if `room.hasPassword` → open `<JoinPasswordDialog>` (child component inside StudyRoomList)
- If not → call `joinRoom()` and emit `enterRoom` as before

### JoinPasswordDialog.vue (new component)

- Props: `visible: boolean`, `roomName: string`, `roomId: number`
- Emits: `close`, `joined`
- States: idle, verifying, error (wrong password)
- On submit: call `joinRoom(roomId, password)`, on success emit `joined`, on 403 show "Wrong password" error
- Enter key submits; cancel clears and closes
- On `joined` → parent (StudyRoomList) emits `enterRoom(roomId)`

## Socket.IO

No changes. Password verification happens in REST before socket `room:join` is emitted.

## Error Handling

| Scenario | Response |
|---|---|
| Missing password for protected room | 403 `{ error: 'Password required' }` |
| Wrong password | 403 `{ error: 'Incorrect password' }` |
| Password too short (< 4) | 400 `{ error: 'Password must be 4-16 characters' }` |
| Password too long (> 16) | 400 `{ error: 'Password must be 4-16 characters' }` |

## Files Changed

| File | Change |
|---|---|
| `backend/src/models/Room.ts` | Add `password` field |
| `backend/src/routes/rooms.ts` | Modify create, join, list routes |
| `backend/package.json` | Add bcryptjs dependency |
| `src/types/index.ts` | Add `hasPassword` to Room |
| `src/utils/api.ts` | Add password params |
| `src/views/StudyRoomList.vue` | Password field, lock icons, join flow, hosts JoinPasswordDialog |
| `src/components/JoinPasswordDialog.vue` | **New** — password prompt component |
