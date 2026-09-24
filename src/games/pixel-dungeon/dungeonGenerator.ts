import type {
  TileType,
  Enemy,
  DungeonItem,
  DungeonRoom,
  Position,
} from './types';

export const DUNGEON_COLS = 26;
export const DUNGEON_ROWS = 20;

export interface DungeonLevel {
  cols: number;
  rows: number;
  tiles: TileType[][];
  rooms: DungeonRoom[];
  playerStart: Position;
  stairsPos: Position;
  enemies: Enemy[];
  items: DungeonItem[];
}

/**
 * Procedurally generates a rogue-like dungeon with rooms, corridors,
 * doors, locked doors, keys, treasure, and enemies.
 */
export function generateDungeonLevel(floor: number): DungeonLevel {
  const cols = DUNGEON_COLS;
  const rows = DUNGEON_ROWS;

  // Initialize all tiles as solid wall
  const tiles: TileType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 'wall' as TileType)
  );

  const rooms: DungeonRoom[] = [];
  const maxRooms = 7;
  const minRoomSize = 4;
  const maxRoomSize = 7;

  // Generate non-overlapping rooms
  for (let attempt = 0; attempt < 60 && rooms.length < maxRooms; attempt++) {
    const w = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
    const h = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
    const x = Math.floor(Math.random() * (cols - w - 2)) + 1;
    const y = Math.floor(Math.random() * (rows - h - 2)) + 1;

    const newRoom: DungeonRoom = {
      x,
      y,
      width: w,
      height: h,
      centerX: Math.floor(x + w / 2),
      centerY: Math.floor(y + h / 2),
    };

    // Check collision with existing rooms (keep 1 tile buffer)
    let overlaps = false;
    for (const r of rooms) {
      if (
        newRoom.x <= r.x + r.width + 1 &&
        newRoom.x + newRoom.width + 1 >= r.x &&
        newRoom.y <= r.y + r.height + 1 &&
        newRoom.y + newRoom.height + 1 >= r.y
      ) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      rooms.push(newRoom);
      // Carve room floor
      for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
          tiles[ry][rx] = 'floor';
        }
      }
    }
  }

  // Connect rooms with corridors
  for (let i = 0; i < rooms.length - 1; i++) {
    const r1 = rooms[i];
    const r2 = rooms[i + 1];

    // Connect r1 and r2 centers with L-shaped dogleg corridor
    let cx = r1.centerX;
    let cy = r1.centerY;
    const targetX = r2.centerX;
    const targetY = r2.centerY;

    // Flip coin to decide whether to go horizontal then vertical or vice versa
    if (Math.random() < 0.5) {
      // Horizontal then vertical
      while (cx !== targetX) {
        tiles[cy][cx] = 'floor';
        cx += cx < targetX ? 1 : -1;
      }
      while (cy !== targetY) {
        tiles[cy][cx] = 'floor';
        cy += cy < targetY ? 1 : -1;
      }
    } else {
      // Vertical then horizontal
      while (cy !== targetY) {
        tiles[cy][cx] = 'floor';
        cy += cy < targetY ? 1 : -1;
      }
      while (cx !== targetX) {
        tiles[cy][cx] = 'floor';
        cx += cx < targetX ? 1 : -1;
      }
    }
  }

  // Add loop corridors between first and last or random pair to avoid strictly linear tunnels
  if (rooms.length >= 4) {
    const rA = rooms[0];
    const rB = rooms[rooms.length - 1];
    let cx = rA.centerX;
    let cy = rA.centerY;
    while (cx !== rB.centerX) {
      tiles[cy][cx] = 'floor';
      cx += cx < rB.centerX ? 1 : -1;
    }
    while (cy !== rB.centerY) {
      tiles[cy][cx] = 'floor';
      cy += cy < rB.centerY ? 1 : -1;
    }
  }

  // Place doors at boundaries between room interiors and corridors
  // A door tile candidate: floor tile with 2 opposing walls and 2 opposing floors
  const doorCandidates: Position[] = [];
  for (let y = 2; y < rows - 2; y++) {
    for (let x = 2; x < cols - 2; x++) {
      if (tiles[y][x] === 'floor') {
        const up = tiles[y - 1][x];
        const down = tiles[y + 1][x];
        const left = tiles[y][x - 1];
        const right = tiles[y][x + 1];

        // Horizontal doorway (walls up & down, floors left & right)
        if (up === 'wall' && down === 'wall' && left === 'floor' && right === 'floor') {
          doorCandidates.push({ x, y });
        }
        // Vertical doorway (walls left & right, floors up & down)
        else if (left === 'wall' && right === 'wall' && up === 'floor' && down === 'floor') {
          doorCandidates.push({ x, y });
        }
      }
    }
  }

  // Turn some candidates into closed doors
  // Shuffle door candidates
  const shuffledDoors = [...doorCandidates].sort(() => Math.random() - 0.5);
  const numDoors = Math.min(shuffledDoors.length, Math.floor(rooms.length * 1.5));
  const placedDoors: Position[] = [];

  for (let i = 0; i < numDoors; i++) {
    const pt = shuffledDoors[i];
    tiles[pt.y][pt.x] = 'door-closed';
    placedDoors.push(pt);
  }

  // Player starts in room 0
  const startRoom = rooms[0];
  const playerStart: Position = {
    x: startRoom.centerX,
    y: startRoom.centerY,
  };

  // Stairs placed in furthest room from start
  let bestDist = -1;
  let exitRoomIndex = rooms.length - 1;
  for (let i = 1; i < rooms.length; i++) {
    const dist =
      Math.hypot(rooms[i].centerX - startRoom.centerX, rooms[i].centerY - startRoom.centerY);
    if (dist > bestDist) {
      bestDist = dist;
      exitRoomIndex = i;
    }
  }

  const exitRoom = rooms[exitRoomIndex];
  const stairsPos: Position = {
    x: exitRoom.centerX,
    y: exitRoom.centerY,
  };
  tiles[stairsPos.y][stairsPos.x] = 'stairs-down';

  // Lock a door leading to a vault or stairs room if doors exist
  let lockedDoorPlaced = false;
  if (placedDoors.length > 0) {
    // Pick a door near exit room or high index room
    const targetDoor = placedDoors[placedDoors.length - 1];
    tiles[targetDoor.y][targetDoor.x] = 'door-locked';
    lockedDoorPlaced = true;
  }

  // Helper to pick random open floor in a room
  const getEmptyFloorInRoom = (
    room: DungeonRoom,
    occupied: Position[]
  ): Position | null => {
    const tries = 30;
    for (let t = 0; t < tries; t++) {
      const rx = Math.floor(Math.random() * (room.width - 2)) + room.x + 1;
      const ry = Math.floor(Math.random() * (room.height - 2)) + room.y + 1;
      if (
        tiles[ry][rx] === 'floor' &&
        !occupied.some((p) => p.x === rx && p.y === ry)
      ) {
        return { x: rx, y: ry };
      }
    }
    return null;
  };

  const occupiedPositions: Position[] = [playerStart, stairsPos];

  // Enemies generation
  const enemies: Enemy[] = [];
  const baseEnemyCount = 3 + Math.min(floor * 2, 10);

  for (let i = 0; i < baseEnemyCount; i++) {
    // Pick a room other than the starting room
    const roomIdx = Math.floor(Math.random() * (rooms.length - 1)) + 1;
    const room = rooms[roomIdx];
    const pos = getEmptyFloorInRoom(room, occupiedPositions);
    if (!pos) continue;

    occupiedPositions.push(pos);

    // Enemy type distribution based on floor
    // Floor 1: mostly bats and goblins, occasional skeleton
    // Floor 2+: more skeletons and stronger goblins
    const roll = Math.random();
    let type: Enemy['type'] = 'goblin';

    if (roll < 0.45) {
      type = 'goblin';
    } else if (roll < 0.75) {
      type = 'bat';
    } else {
      type = 'skeleton';
    }

    let hp = 12;
    let atk = 3;
    let def = 1;
    let name = 'Goblin Scout';
    let color = '#10b981'; // emerald green

    if (type === 'bat') {
      hp = Math.max(6, 6 + Math.floor(floor * 1.5));
      atk = 2 + Math.floor(floor * 0.8);
      def = 0;
      name = 'Dungeon Bat';
      color = '#a855f7'; // purple
    } else if (type === 'goblin') {
      hp = 12 + floor * 3;
      atk = 3 + floor;
      def = 1;
      name = 'Goblin Fighter';
      color = '#22c55e'; // green
    } else if (type === 'skeleton') {
      hp = 18 + floor * 4;
      atk = 5 + floor * 1.2;
      def = 2;
      name = 'Skeleton Knight';
      color = '#e2e8f0'; // bone white
    }

    enemies.push({
      id: `enemy-${floor}-${i}-${Date.now()}`,
      type,
      x: pos.x,
      y: pos.y,
      hp,
      maxHp: hp,
      attack: atk,
      defense: def,
      name,
      color,
      isAggro: false,
      facing: Math.random() < 0.5 ? 'left' : 'right',
    });
  }

  // Items generation
  const items: DungeonItem[] = [];

  // 1. Key (Always guarantee at least 1 key if there is a locked door)
  if (lockedDoorPlaced || Math.random() < 0.7) {
    // Put key in a middle room (not exit room, not start room if possible)
    const keyRoomIdx = rooms.length > 2 ? 1 + Math.floor(Math.random() * (rooms.length - 2)) : 0;
    const pos = getEmptyFloorInRoom(rooms[keyRoomIdx], occupiedPositions);
    if (pos) {
      occupiedPositions.push(pos);
      items.push({
        id: `key-${floor}-${Date.now()}`,
        type: 'key',
        x: pos.x,
        y: pos.y,
        name: 'Dungeon Key',
        value: 1,
        description: 'Unlocks ancient iron doors and treasure vaults.',
      });
    }
  }

  // 2. Health Potions (1-2 per floor)
  const numPotions = 1 + (Math.random() < 0.6 ? 1 : 0);
  for (let i = 0; i < numPotions; i++) {
    const roomIdx = Math.floor(Math.random() * rooms.length);
    const pos = getEmptyFloorInRoom(rooms[roomIdx], occupiedPositions);
    if (pos) {
      occupiedPositions.push(pos);
      items.push({
        id: `potion-${floor}-${i}`,
        type: 'potion',
        x: pos.x,
        y: pos.y,
        name: 'Health Potion',
        value: 28,
        description: 'Restores +28 HP and refreshes stamina.',
      });
    }
  }

  // 3. Equipment upgrades (Weapon or Armor)
  // Each floor offers either a weapon upgrade, armor upgrade, or both
  const offersWeapon = floor % 2 === 1 || Math.random() < 0.5;
  const offersArmor = floor % 2 === 0 || Math.random() < 0.5;

  const weaponNames = [
    'Bronze Shortsword',
    'Steel Broadsword',
    'Silver Longblade',
    'Rune Edge',
    'Mythic Sunblade',
  ];

  const armorNames = [
    'Studded Leather',
    'Chainmail Hauberk',
    'Plate Armor',
    'Dwarven Aegis',
    'Dragon Scale Mail',
  ];

  if (offersWeapon) {
    const roomIdx = Math.floor(Math.random() * (rooms.length - 1)) + 1;
    const pos = getEmptyFloorInRoom(rooms[roomIdx], occupiedPositions);
    if (pos) {
      occupiedPositions.push(pos);
      const tier = Math.min(weaponNames.length - 1, floor);
      items.push({
        id: `weapon-${floor}`,
        type: 'weapon',
        x: pos.x,
        y: pos.y,
        name: weaponNames[tier] || 'Sharp Gladius',
        value: 3,
        description: `Enhances your attack power (+3 ATK).`,
      });
    }
  }

  if (offersArmor) {
    const roomIdx = Math.floor(Math.random() * (rooms.length - 1)) + 1;
    const pos = getEmptyFloorInRoom(rooms[roomIdx], occupiedPositions);
    if (pos) {
      occupiedPositions.push(pos);
      const tier = Math.min(armorNames.length - 1, floor);
      items.push({
        id: `armor-${floor}`,
        type: 'armor',
        x: pos.x,
        y: pos.y,
        name: armorNames[tier] || 'Reinforced Cuirass',
        value: 2,
        description: `Enhances your defense and shields you (+2 DEF).`,
      });
    }
  }

  // 4. Gold Coins / Chests (2 to 4 per floor)
  const numGold = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numGold; i++) {
    const roomIdx = Math.floor(Math.random() * rooms.length);
    const pos = getEmptyFloorInRoom(rooms[roomIdx], occupiedPositions);
    if (pos) {
      occupiedPositions.push(pos);
      const goldAmt = 15 + Math.floor(Math.random() * 25) + floor * 5;
      items.push({
        id: `coin-${floor}-${i}`,
        type: 'coin',
        x: pos.x,
        y: pos.y,
        name: 'Gold Pouch',
        value: goldAmt,
        description: `A bag of gold coins (+${goldAmt} Score).`,
      });
    }
  }

  return {
    cols,
    rows,
    tiles,
    rooms,
    playerStart,
    stairsPos,
    enemies,
    items,
  };
}
