import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable trust proxy so client IP is accurately obtained behind reverse proxies (Cloud Run, Vercel, Nginx, ALB)
app.set('trust proxy', 1);

// Parse JSON payloads with strict limit to prevent payload bombs
app.use(express.json({ limit: '100kb' }));

// -------------------------------------------------------------
// High-Concurrency Rate Limiter with Automatic Garbage Collection
// -------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestCounts = new Map<string, RateLimitRecord>();
const MAX_RATE_LIMIT_ENTRIES = 50000;

// Periodic sweep every 60 seconds to purge expired rate limit entries and prevent memory leaks
const sweepInterval = setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now > record.resetTime) {
      ipRequestCounts.delete(ip);
    }
  }
  if (ipRequestCounts.size > MAX_RATE_LIMIT_ENTRIES) {
    let toDelete = ipRequestCounts.size - MAX_RATE_LIMIT_ENTRIES;
    for (const key of ipRequestCounts.keys()) {
      if (toDelete <= 0) break;
      ipRequestCounts.delete(key);
      toDelete--;
    }
  }
}, 60000);

if (sweepInterval.unref) {
  sweepInterval.unref();
}

/**
 * High-performance sliding-window rate limiter factory
 */
function createRateLimiter(maxRequests: number, windowMs: number = 60000) {
  return (req: Request, res: Response, next: () => void) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowData = ipRequestCounts.get(ip);

    if (!windowData || now > windowData.resetTime) {
      ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (windowData.count >= maxRequests) {
      res.setHeader('Retry-After', Math.ceil((windowData.resetTime - now) / 1000));
      return res.status(429).json({
        error: 'Too many requests. Please slow down.',
        retryAfterSeconds: Math.ceil((windowData.resetTime - now) / 1000)
      });
    }

    windowData.count++;
    next();
  };
}

const paymentRateLimiter = createRateLimiter(20, 60000);
const generalApiLimiter = createRateLimiter(150, 60000);

// -------------------------------------------------------------
// Server-Authoritative Idempotency Ledger with Bounded Memory
// -------------------------------------------------------------
interface RedeemedTxInfo {
  amount: number;
  team_id: string;
  match_id: string;
  timestamp: number;
}

const redeemedTransactions = new Map<string, RedeemedTxInfo>();
const MAX_IDEMPOTENCY_KEYS = 30000;

function recordRedeemedTransaction(key: string, data: RedeemedTxInfo) {
  if (redeemedTransactions.size >= MAX_IDEMPOTENCY_KEYS) {
    const firstKey = redeemedTransactions.keys().next().value;
    if (firstKey) {
      redeemedTransactions.delete(firstKey);
    }
  }
  redeemedTransactions.set(key, data);
}

const pruneIdempotencyInterval = setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [key, item] of redeemedTransactions.entries()) {
    if (item.timestamp < cutoff) {
      redeemedTransactions.delete(key);
    }
  }
}, 15 * 60000);

if (pruneIdempotencyInterval.unref) {
  pruneIdempotencyInterval.unref();
}

// -------------------------------------------------------------
// Multi-Matchup Data Architecture
// -------------------------------------------------------------
interface SharedTeam {
  id: string;
  name: string;
  tag: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  logoUrl?: string;
  totalBalance: number;
  fanCount: number;
  previousRank: number;
  currentRank: number;
  boostMultiplier: number;
  passiveIncomePerSec: number;
  championshipWins: number;
  isUserFavored?: boolean;
}

interface SharedFanEvent {
  id: string;
  timestamp: number;
  fanName: string;
  amount: number;
  teamId: string;
  teamName: string;
  matchId?: string;
  eventType: 'donation' | 'whale';
  message: string;
}

interface ServerMatchup {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: 'live' | 'upcoming' | 'completed';
  durationSeconds: number;
  endsAt: number;
  viewersCount: number;
  teams: SharedTeam[];
  recentEvents: SharedFanEvent[];
}

// In-Memory Master Registry for Multiple Matchups
const matchupsRegistry = new Map<string, ServerMatchup>([
  [
    'diamond_vs_babs',
    {
      id: 'diamond_vs_babs',
      title: 'Diamond King vs Babs Cardini',
      subtitle: 'Grand Magicians Derby',
      category: 'Magic & Illusion',
      status: 'live',
      durationSeconds: 600,
      endsAt: Date.now() + 600 * 1000,
      viewersCount: 3840,
      teams: [
        {
          id: 'diamond_king',
          name: 'Diamond King',
          tag: 'DK',
          primaryColor: '#EF4444',
          accentColor: '#F87171',
          bgGradient: 'from-red-500/20 via-rose-500/10 to-transparent',
          totalBalance: 14200,
          previousRank: 1,
          currentRank: 1,
          fanCount: 18,
          boostMultiplier: 1.0,
          passiveIncomePerSec: 0,
          championshipWins: 1,
          isUserFavored: true
        },
        {
          id: 'babs_cardini',
          name: 'Babs Cardini',
          tag: 'BABS',
          primaryColor: '#3B82F6',
          accentColor: '#60A5FA',
          bgGradient: 'from-blue-500/25 via-indigo-500/10 to-transparent',
          totalBalance: 13800,
          previousRank: 2,
          currentRank: 2,
          fanCount: 16,
          boostMultiplier: 1.0,
          passiveIncomePerSec: 0,
          championshipWins: 1
        }
      ],
      recentEvents: [
        {
          id: 'evt_init_1',
          timestamp: Date.now() - 4000,
          fanName: 'Ibrahim M.',
          amount: 1000,
          teamId: 'babs_cardini',
          teamName: 'Babs Cardini',
          matchId: 'diamond_vs_babs',
          eventType: 'donation',
          message: 'Gifted ₦1,000 to Babs Cardini'
        },
        {
          id: 'evt_init_2',
          timestamp: Date.now() - 9000,
          fanName: 'Tunde A.',
          amount: 500,
          teamId: 'diamond_king',
          teamName: 'Diamond King',
          matchId: 'diamond_vs_babs',
          eventType: 'donation',
          message: 'Gifted ₦500 to Diamond King'
        }
      ]
    }
  ],
  [
    'wizkid_vs_davido',
    {
      id: 'wizkid_vs_davido',
      title: 'Wizkid vs Davido',
      subtitle: 'Afrobeats Super Derby',
      category: 'Music & Culture',
      status: 'live',
      durationSeconds: 900,
      endsAt: Date.now() + 850 * 1000,
      viewersCount: 7420,
      teams: [
        {
          id: 'wizkid',
          name: 'Wizkid FC',
          tag: 'WIZ',
          primaryColor: '#10B981',
          accentColor: '#34D399',
          bgGradient: 'from-emerald-500/25 via-teal-500/10 to-transparent',
          totalBalance: 28500,
          previousRank: 1,
          currentRank: 1,
          fanCount: 42,
          boostMultiplier: 1.0,
          passiveIncomePerSec: 0,
          championshipWins: 3,
          isUserFavored: true
        },
        {
          id: 'davido',
          name: 'Davido 30BG',
          tag: '30BG',
          primaryColor: '#8B5CF6',
          accentColor: '#A78BFA',
          bgGradient: 'from-purple-500/25 via-indigo-500/10 to-transparent',
          totalBalance: 26000,
          previousRank: 2,
          currentRank: 2,
          fanCount: 39,
          boostMultiplier: 1.0,
          passiveIncomePerSec: 0,
          championshipWins: 2
        }
      ],
      recentEvents: [
        {
          id: 'evt_wiz_1',
          timestamp: Date.now() - 3000,
          fanName: 'Amina K.',
          amount: 2000,
          teamId: 'wizkid',
          teamName: 'Wizkid FC',
          matchId: 'wizkid_vs_davido',
          eventType: 'donation',
          message: 'Gifted ₦2,000 to Wizkid FC'
        }
      ]
    }
  ],
  [
    'peller_vs_carterefe',
    {
      id: 'peller_vs_carterefe',
      title: 'Peller vs Carter Efe',
      subtitle: 'Lagos Live Stream Battle',
      category: 'Creators & Streaming',
      status: 'live',
      durationSeconds: 720,
      endsAt: Date.now() + 680 * 1000,
      viewersCount: 4190,
      teams: [
        {
          id: 'peller',
          name: 'Peller Dynasty',
          tag: 'PELL',
          primaryColor: '#F59E0B',
          accentColor: '#FBBF24',
          bgGradient: 'from-amber-500/25 via-orange-500/10 to-transparent',
          totalBalance: 16500,
          previousRank: 1,
          currentRank: 1,
          fanCount: 25,
          boostMultiplier: 1.0,
          passiveIncomePerSec: 0,
          championshipWins: 1,
          isUserFavored: true
        },
        {
          id: 'carterefe',
          name: 'Carter Machala',
          tag: 'MACH',
          primaryColor: '#EC4899',
          accentColor: '#F472B6',
          bgGradient: 'from-pink-500/25 via-rose-500/10 to-transparent',
          totalBalance: 15500,
          previousRank: 2,
          currentRank: 2,
          fanCount: 23,
          boostMultiplier: 1.0,
          passiveIncomePerSec: 0,
          championshipWins: 1
        }
      ],
      recentEvents: [
        {
          id: 'evt_pel_1',
          timestamp: Date.now() - 2500,
          fanName: 'Chidi O.',
          amount: 1000,
          teamId: 'peller',
          teamName: 'Peller Dynasty',
          matchId: 'peller_vs_carterefe',
          eventType: 'donation',
          message: 'Gifted ₦1,000 to Peller Dynasty'
        }
      ]
    }
  ]
]);

// -------------------------------------------------------------
// High-Concurrency Multi-Channel SSE Connection Pool
// -------------------------------------------------------------
interface SseClientInfo {
  res: Response;
  ip: string;
  matchId: string;
  connectedAt: number;
  consecutiveSlowWrites: number;
}

const sseClients = new Map<Response, SseClientInfo>();

function removeSseClient(res: Response) {
  if (sseClients.has(res)) {
    sseClients.delete(res);
    try {
      if (!res.writableEnded) {
        res.end();
      }
    } catch {
      // Socket already destroyed
    }
  }
}

/**
 * Broadcast match state update specifically to viewers of that match
 */
function broadcastMatchUpdate(matchId: string, newEvent?: SharedFanEvent) {
  if (sseClients.size === 0) return;

  const match = matchupsRegistry.get(matchId);
  if (!match) return;

  const totalPot = match.teams[0].totalBalance + match.teams[1].totalBalance;
  const payloadString = `data: ${JSON.stringify({
    matchId,
    teams: match.teams,
    totalPot,
    newEvent: newEvent || null,
    viewersCount: match.viewersCount,
    timestamp: Date.now()
  })}\n\n`;

  const clientsToRemove: Response[] = [];

  for (const [res, clientInfo] of sseClients.entries()) {
    if (clientInfo.matchId !== matchId) continue;

    try {
      if (res.writableEnded || res.destroyed) {
        clientsToRemove.push(res);
        continue;
      }

      const writeOk = res.write(payloadString);
      if (!writeOk) {
        clientInfo.consecutiveSlowWrites++;
        if (clientInfo.consecutiveSlowWrites > 5) {
          clientsToRemove.push(res);
        }
      } else {
        clientInfo.consecutiveSlowWrites = 0;
      }
    } catch {
      clientsToRemove.push(res);
    }
  }

  for (const deadClient of clientsToRemove) {
    removeSseClient(deadClient);
  }
}

/**
 * Server-Sent Events (SSE) Live Broadcast Stream per Match
 * Endpoint: /api/battle/stream?matchId=<id>
 */
app.get('/api/battle/stream', (req, res) => {
  const matchId = (req.query.matchId as string) || 'diamond_vs_babs';
  const match = matchupsRegistry.get(matchId) || matchupsRegistry.get('diamond_vs_babs')!;

  if (req.socket) {
    req.socket.setNoDelay(true);
    req.socket.setKeepAlive(true, 15000);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const totalPot = match.teams[0].totalBalance + match.teams[1].totalBalance;
  const initialPayload = `data: ${JSON.stringify({
    matchId: match.id,
    teams: match.teams,
    totalPot,
    recentEvents: match.recentEvents.slice(0, 25),
    viewersCount: match.viewersCount,
    timestamp: Date.now()
  })}\n\n`;

  res.write(initialPayload);

  const clientInfo: SseClientInfo = {
    res,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    matchId: match.id,
    connectedAt: Date.now(),
    consecutiveSlowWrites: 0
  };
  sseClients.set(res, clientInfo);

  const cleanup = () => removeSseClient(res);
  req.on('close', cleanup);
  req.on('end', cleanup);
  req.on('error', cleanup);
  res.on('close', cleanup);
  res.on('finish', cleanup);
  res.on('error', cleanup);
});

// Heartbeat ping every 20 seconds
const heartbeatInterval = setInterval(() => {
  if (sseClients.size === 0) return;
  const pingMessage = ': ping\n\n';
  const deadClients: Response[] = [];

  for (const [res] of sseClients.entries()) {
    try {
      if (res.writableEnded || res.destroyed) {
        deadClients.push(res);
      } else {
        res.write(pingMessage);
      }
    } catch {
      deadClients.push(res);
    }
  }

  for (const dead of deadClients) {
    removeSseClient(dead);
  }
}, 20000);

if (heartbeatInterval.unref) {
  heartbeatInterval.unref();
}

/**
 * List all active matchups: /api/matches
 */
app.get('/api/matches', generalApiLimiter, (_req, res) => {
  const matchesList = Array.from(matchupsRegistry.values()).map(m => {
    const totalPot = m.teams[0].totalBalance + m.teams[1].totalBalance;
    const matchSubscribers = Array.from(sseClients.values()).filter(c => c.matchId === m.id).length;
    return {
      id: m.id,
      title: m.title,
      subtitle: m.subtitle,
      category: m.category,
      status: m.status,
      durationSeconds: m.durationSeconds,
      endsAt: m.endsAt,
      viewersCount: m.viewersCount + matchSubscribers,
      totalPot,
      teams: m.teams
    };
  });

  res.setHeader('Cache-Control', 'public, max-age=2, stale-while-revalidate=5');
  res.json({
    matches: matchesList,
    totalActiveViewers: matchesList.reduce((sum, m) => sum + m.viewersCount, 0),
    timestamp: Date.now()
  });
});

/**
 * REST endpoint for specific match state: /api/battle/state?matchId=<id>
 */
app.get('/api/battle/state', generalApiLimiter, (req, res) => {
  const matchId = (req.query.matchId as string) || 'diamond_vs_babs';
  const match = matchupsRegistry.get(matchId) || matchupsRegistry.get('diamond_vs_babs')!;
  const totalPot = match.teams[0].totalBalance + match.teams[1].totalBalance;
  const matchSubscribers = Array.from(sseClients.values()).filter(c => c.matchId === match.id).length;

  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.json({
    matchId: match.id,
    title: match.title,
    teams: match.teams,
    totalPot,
    recentEvents: match.recentEvents.slice(0, 25),
    activeSubscribers: matchSubscribers,
    timestamp: Date.now()
  });
});

/**
 * Detailed Health Check & Operational Metrics endpoint
 */
app.get('/api/health', (_req, res) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'ok',
    service: 'FanBrawl Multi-Match High-Concurrency Engine',
    uptimeSeconds: Math.floor(process.uptime()),
    activeSubscribers: sseClients.size,
    totalMatchups: matchupsRegistry.size,
    memory: {
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024))
    },
    rateLimiterActiveIps: ipRequestCounts.size,
    idempotencyKeysCount: redeemedTransactions.size,
    timestamp: new Date().toISOString(),
    hasSecretKey: Boolean(process.env.FLUTTERWAVE_SECRET_KEY)
  });
});

/**
 * Live Payment Verification Endpoint
 * Securely queries Flutterwave REST API to verify live transactions before crediting balances
 */
app.post('/api/verify-payment', paymentRateLimiter, async (req, res) => {
  try {
    const { transaction_id, tx_ref, expected_amount, team_id, match_id } = req.body;

    if (!transaction_id || !tx_ref) {
      return res.status(400).json({
        verified: false,
        error: 'Missing required payment identifiers (transaction_id or tx_ref).'
      });
    }

    const targetMatchId = match_id || 'diamond_vs_babs';
    const match = matchupsRegistry.get(targetMatchId);
    if (!match) {
      return res.status(400).json({
        verified: false,
        error: `Match ${targetMatchId} not found.`
      });
    }

    const teamExists = match.teams.some(t => t.id === team_id);
    if (!teamExists) {
      return res.status(400).json({
        verified: false,
        error: `Invalid team identifier (${team_id}) for match ${targetMatchId}.`
      });
    }

    const numericAmount = Math.floor(Number(expected_amount) || 0);
    if (isNaN(numericAmount) || numericAmount < 100 || numericAmount > 5000000) {
      return res.status(400).json({
        verified: false,
        error: 'Payment amount must be between ₦100 and ₦5,000,000.'
      });
    }

    // Idempotency check
    const strTxId = String(transaction_id);
    const strTxRef = String(tx_ref);

    if (redeemedTransactions.has(strTxRef) || redeemedTransactions.has(strTxId)) {
      return res.status(409).json({
        verified: false,
        error: 'This transaction has already been verified and credited.'
      });
    }

    // Live Flutterwave REST API Verification
    let verifiedAmount = numericAmount;
    const flutterwaveSecret = process.env.FLUTTERWAVE_SECRET_KEY;

    if (flutterwaveSecret) {
      const flwResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${strTxId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${flutterwaveSecret.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      const flwResult = (await flwResponse.json()) as {
        status: string;
        message?: string;
        data?: {
          status: string;
          currency: string;
          amount: number;
          tx_ref: string;
        };
      };

      if (!flwResponse.ok || flwResult.status !== 'success' || !flwResult.data) {
        return res.status(400).json({
          verified: false,
          error: `Flutterwave verification failed: ${flwResult.message || 'Transaction could not be verified'}`
        });
      }

      if (flwResult.data.status !== 'successful') {
        return res.status(400).json({
          verified: false,
          error: `Payment status is ${flwResult.data.status}, not successful.`
        });
      }

      if (flwResult.data.currency !== 'NGN') {
        return res.status(400).json({
          verified: false,
          error: `Currency mismatch: expected NGN, received ${flwResult.data.currency}.`
        });
      }

      if (flwResult.data.amount < numericAmount) {
        return res.status(400).json({
          verified: false,
          error: `Settled amount (₦${flwResult.data.amount}) does not match expected amount (₦${numericAmount}).`
        });
      }

      verifiedAmount = flwResult.data.amount;
    }

    // Record transaction
    const record: RedeemedTxInfo = {
      amount: verifiedAmount,
      team_id,
      match_id: targetMatchId,
      timestamp: Date.now()
    };
    recordRedeemedTransaction(strTxRef, record);
    recordRedeemedTransaction(strTxId, record);

    // Atomic update to match state
    match.teams = match.teams.map((t) => {
      if (t.id === team_id) {
        return {
          ...t,
          totalBalance: t.totalBalance + verifiedAmount,
          fanCount: t.fanCount + 1
        };
      }
      return t;
    });

    match.teams = [...match.teams].sort((a, b) => b.totalBalance - a.totalBalance).map((t, idx) => ({
      ...t,
      previousRank: t.currentRank,
      currentRank: idx + 1
    }));

    const creditedTeam = match.teams.find((t) => t.id === team_id);
    const realFanEvt: SharedFanEvent = {
      id: `evt_real_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      fanName: 'Real Fan',
      amount: verifiedAmount,
      teamId: team_id,
      teamName: creditedTeam?.name || 'Team',
      matchId: targetMatchId,
      eventType: verifiedAmount >= 5000 ? 'whale' : 'donation',
      message: `Gifted ₦${verifiedAmount.toLocaleString()} to ${creditedTeam?.name || 'Team'}`
    };

    match.recentEvents = [realFanEvt, ...match.recentEvents.slice(0, 39)];

    // Broadcast to that match's viewers instantly
    broadcastMatchUpdate(targetMatchId, realFanEvt);

    return res.json({
      verified: true,
      transaction_id: strTxId,
      tx_ref: strTxRef,
      amount: verifiedAmount,
      team_id,
      match_id: targetMatchId,
      timestamp: Date.now(),
      message: 'Transaction successfully verified and attested by server.'
    });
  } catch (error) {
    console.error('[FanBrawl Backend] Payment verification exception:', error);
    return res.status(500).json({
      verified: false,
      error: 'Internal server error while verifying payment.'
    });
  }
});

/**
 * Flutterwave Webhook Listener
 */
app.post('/api/flutterwave-webhook', (req, res) => {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
  const signature = req.headers['verif-hash'];

  if (secretHash && signature !== secretHash) {
    return res.status(401).json({ error: 'Unauthorized webhook request.' });
  }

  const payload = req.body;
  if (payload && payload.data && payload.data.status === 'successful') {
    const txRef = String(payload.data.tx_ref || '');
    const txId = String(payload.data.id || '');
    const amount = Number(payload.data.amount || 0);

    if (txRef && !redeemedTransactions.has(txRef)) {
      const matchId = payload.data.meta?.match_id || 'diamond_vs_babs';
      const record: RedeemedTxInfo = {
        amount,
        team_id: payload.data.meta?.team_id || 'diamond_king',
        match_id: matchId,
        timestamp: Date.now()
      };
      recordRedeemedTransaction(txRef, record);
      if (txId) {
        recordRedeemedTransaction(txId, record);
      }
    }
  }

  return res.status(200).json({ status: 'acknowledged' });
});

// -------------------------------------------------------------
// Multi-Match Live Simulated Ticker Engine
// -------------------------------------------------------------
const NIGERIAN_FAN_NAMES = [
  'Tunde A.', 'Amina K.', 'Chidi O.', 'Blessing N.', 'Emeka E.', 
  'Zainab B.', 'Femi D.', 'Ngozi P.', 'Ibrahim M.', 'Funke Y.',
  'Damilola S.', 'Kelechi R.', 'Chioma V.', 'Segun T.', 'Halima U.',
  'Babatunde W.', 'Folake M.', 'Uche C.', 'Adeola J.', 'Yusuf G.'
];

let serverGiftTimer: NodeJS.Timeout | null = null;

function scheduleServerGiftTick() {
  const nextDelay = 1500 + Math.random() * 2000;
  serverGiftTimer = setTimeout(() => {
    try {
      // Pick an active match randomly
      const matchKeys = Array.from(matchupsRegistry.keys());
      const selectedMatchKey = matchKeys[Math.floor(Math.random() * matchKeys.length)];
      const match = matchupsRegistry.get(selectedMatchKey);

      if (match && match.teams.length >= 2) {
        const teamA = match.teams[0];
        const teamB = match.teams[1];

        let targetId = teamA.id;
        const diff = teamA.totalBalance - teamB.totalBalance;
        if (diff > 3500) {
          targetId = Math.random() < 0.65 ? teamB.id : teamA.id;
        } else if (diff < -3500) {
          targetId = Math.random() < 0.65 ? teamA.id : teamB.id;
        } else {
          targetId = Math.random() < 0.5 ? teamA.id : teamB.id;
        }

        // Amounts < ₦500 are very rare (<2%)
        const rand = Math.random();
        let amount = 500;
        if (rand < 0.007) amount = 100;
        else if (rand < 0.02) amount = 200;
        else if (rand < 0.42) amount = 500;
        else if (rand < 0.74) amount = 1000;
        else if (rand < 0.90) amount = 2000;
        else if (rand < 0.97) amount = 5000;
        else if (rand < 0.993) amount = 10000;
        else amount = 20000;

        match.teams = match.teams.map((t) => {
          if (t.id === targetId) {
            return {
              ...t,
              totalBalance: t.totalBalance + amount,
              fanCount: t.fanCount + 1
            };
          }
          return t;
        });

        match.teams = [...match.teams].sort((a, b) => b.totalBalance - a.totalBalance).map((t, idx) => ({
          ...t,
          previousRank: t.currentRank,
          currentRank: idx + 1
        }));

        const targetTeam = match.teams.find((t) => t.id === targetId);
        const fanName = NIGERIAN_FAN_NAMES[Math.floor(Math.random() * NIGERIAN_FAN_NAMES.length)];
        const simEvt: SharedFanEvent = {
          id: `evt_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: Date.now(),
          fanName,
          amount,
          teamId: targetId,
          teamName: targetTeam?.name || 'Team',
          matchId: match.id,
          eventType: amount >= 5000 ? 'whale' : 'donation',
          message: `Gifted ₦${amount.toLocaleString()} to ${targetTeam?.name || 'Team'}`
        };

        match.recentEvents = [simEvt, ...match.recentEvents.slice(0, 39)];

        broadcastMatchUpdate(match.id, simEvt);
      }
    } catch (e) {
      console.error('[FanBrawl Engine] Tick error:', e);
    }

    scheduleServerGiftTick();
  }, nextDelay);
}

scheduleServerGiftTick();

// -------------------------------------------------------------
// Server Initialization (Local Dev & Production Container)
// -------------------------------------------------------------
export default app;

async function startServer() {
  if (process.env.VERCEL) {
    // Under Vercel serverless functions, the Express app is exported and invoked by AWS Lambda
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist'), {
      maxAge: '1y',
      immutable: true
    }));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const server = http.createServer(app);

  server.maxHeadersCount = 100;
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  server.on('connection', (socket) => {
    socket.setNoDelay(true);
    socket.setKeepAlive(true, 15000);
  });

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[FanBrawl High-Concurrency Multi-Match Server] Listening on http://0.0.0.0:${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[FanBrawl Server] Received ${signal}. Initiating graceful shutdown...`);

    if (serverGiftTimer) clearTimeout(serverGiftTimer);
    clearInterval(heartbeatInterval);
    clearInterval(sweepInterval);
    clearInterval(pruneIdempotencyInterval);

    for (const [res] of sseClients.entries()) {
      try {
        res.write('event: shutdown\ndata: {"status":"restarting"}\n\n');
        res.end();
      } catch {
        // Ignored
      }
    }
    sseClients.clear();

    server.close(() => {
      console.log('[FanBrawl Server] Closed all network listeners cleanly.');
      process.exit(0);
    });

    setTimeout(() => {
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('uncaughtException', (err) => {
  console.error('[FanBrawl Process] Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FanBrawl Process] Unhandled rejection:', reason);
});

startServer().catch((err) => {
  console.error('[FanBrawl Server] Startup failure:', err);
});
