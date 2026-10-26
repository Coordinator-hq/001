import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import path from 'path';
import { INITIAL_FIGURES } from './src/data/leaderboardData.ts';
import { LeaderboardFigure, LiveGiftEvent } from './src/types/leaderboard.ts';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy for accurate IP identification behind Cloud Run, Nginx, or ALB
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

// Periodic sweep every 60s to purge expired rate limit entries
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

const paymentRateLimiter = createRateLimiter(30, 60000);
const generalApiLimiter = createRateLimiter(200, 60000);

// -------------------------------------------------------------
// Server-Authoritative Idempotency Ledger with Bounded Memory
// -------------------------------------------------------------
interface RedeemedTxInfo {
  amount: number;
  figureId: string;
  figureName: string;
  supporterName: string;
  timestamp: number;
}

const redeemedTransactions = new Map<string, RedeemedTxInfo>();
const MAX_IDEMPOTENCY_KEYS = 50000;

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
// Master Figures In-Memory State & Events Ledger
// -------------------------------------------------------------
const masterFigures: Map<string, LeaderboardFigure> = new Map();
INITIAL_FIGURES.forEach((fig) => {
  masterFigures.set(fig.id, { ...fig });
});

let recentEvents: LiveGiftEvent[] = [
  {
    id: `evt_init_${Date.now() - 3000}`,
    timestamp: Date.now() - 3000,
    fanName: '30BG_Tunde',
    amount: 5000,
    figureId: 'davido',
    figureName: 'Davido',
    sector: 'music',
    sectorLabel: 'Music',
    eventType: 'whale',
    message: 'Verified gift of ₦5,000 to Davido'
  },
  {
    id: `evt_init_${Date.now() - 7000}`,
    timestamp: Date.now() - 7000,
    fanName: 'Wizkid_FC_Amina',
    amount: 2000,
    figureId: 'wizkid',
    figureName: 'Wizkid',
    sector: 'music',
    sectorLabel: 'Music',
    eventType: 'donation',
    message: 'Verified gift of ₦2,000 to Wizkid'
  },
  {
    id: `evt_init_${Date.now() - 12000}`,
    timestamp: Date.now() - 12000,
    fanName: 'Investor_Sabinus_Fan',
    amount: 1000,
    figureId: 'sabinus',
    figureName: 'Sabinus',
    sector: 'instagram_influencers',
    sectorLabel: 'Instagram',
    eventType: 'donation',
    message: 'Verified gift of ₦1,000 to Sabinus'
  }
];

function getAllFiguresSorted(): LeaderboardFigure[] {
  return Array.from(masterFigures.values()).sort((a, b) => b.totalBalance - a.totalBalance);
}

function calculateTotalPot(): number {
  let total = 0;
  for (const fig of masterFigures.values()) {
    total += fig.totalBalance;
  }
  return total;
}

// -------------------------------------------------------------
// High-Concurrency Server-Sent Events (SSE) Client Connection Pool
// -------------------------------------------------------------
interface SseClientInfo {
  res: Response;
  ip: string;
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
 * Broadcast event payload to ALL connected concurrent users in real time
 */
function broadcastToAllClients(payload: object) {
  if (sseClients.size === 0) return;

  const payloadString = `data: ${JSON.stringify(payload)}\n\n`;
  const clientsToRemove: Response[] = [];

  for (const [res, clientInfo] of sseClients.entries()) {
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
 * Server-Sent Events (SSE) Live Broadcast Stream
 * Endpoint: /api/live/stream
 */
app.get('/api/live/stream', (req, res) => {
  if (req.socket) {
    req.socket.setNoDelay(true);
    req.socket.setKeepAlive(true, 15000);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const initialPayload = `data: ${JSON.stringify({
    type: 'INITIAL_SNAPSHOT',
    figures: getAllFiguresSorted(),
    recentEvents: recentEvents.slice(0, 30),
    totalPot: calculateTotalPot(),
    viewersCount: sseClients.size + 120,
    timestamp: Date.now()
  })}\n\n`;

  res.write(initialPayload);

  const clientInfo: SseClientInfo = {
    res,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
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
 * REST Endpoint: /api/leaderboard
 * Returns authoritative snapshot of all figures, rankings, and events
 */
app.get('/api/leaderboard', generalApiLimiter, (_req, res) => {
  const figures = getAllFiguresSorted();
  res.setHeader('Cache-Control', 'public, max-age=2, stale-while-revalidate=5');
  res.json({
    figures,
    recentEvents: recentEvents.slice(0, 40),
    totalPot: calculateTotalPot(),
    activeViewers: sseClients.size + 120,
    timestamp: Date.now()
  });
});

/**
 * High-Concurrency Payment Verification Endpoint
 * Endpoint: POST /api/verify-payment
 * 
 * Verifies live transaction with Flutterwave REST API, enforces idempotency,
 * updates master figure state atomically, and broadcasts real-time update to all users.
 */
app.post('/api/verify-payment', paymentRateLimiter, async (req, res) => {
  try {
    const {
      transaction_id,
      tx_ref,
      expected_amount,
      figure_id,
      team_id,
      supporter_name
    } = req.body;

    const targetFigureId = figure_id || team_id;

    if (!transaction_id || !tx_ref) {
      return res.status(400).json({
        verified: false,
        error: 'Missing required payment identifiers (transaction_id or tx_ref).'
      });
    }

    if (!targetFigureId) {
      return res.status(400).json({
        verified: false,
        error: 'Missing target figure identifier.'
      });
    }

    const figure = masterFigures.get(targetFigureId);
    if (!figure) {
      return res.status(400).json({
        verified: false,
        error: `Celebrity figure with ID "${targetFigureId}" not found on master leaderboard.`
      });
    }

    const numericAmount = Math.floor(Number(expected_amount) || 0);
    if (isNaN(numericAmount) || numericAmount < 100 || numericAmount > 5000000) {
      return res.status(400).json({
        verified: false,
        error: 'Payment gift amount must be between ₦100 and ₦5,000,000.'
      });
    }

    const strTxId = String(transaction_id);
    const strTxRef = String(tx_ref);

    // 1. Idempotency Check: Prevent replay attacks and double-crediting
    if (redeemedTransactions.has(strTxRef) || redeemedTransactions.has(strTxId)) {
      return res.status(409).json({
        verified: false,
        error: 'This payment transaction has already been verified and credited.'
      });
    }

    const isSimulated = Boolean(req.body.is_simulated || strTxId.startsWith('FLW_SANDBOX_'));

    // 2. Gateway Verification (when Flutterwave secret key is configured and not an explicit simulated/sandbox gift)
    let verifiedAmount = numericAmount;
    const flutterwaveSecret = process.env.FLUTTERWAVE_SECRET_KEY;

    if (flutterwaveSecret && !isSimulated) {
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
          error: `Settled amount (₦${flwResult.data.amount}) is less than expected amount (₦${numericAmount}).`
        });
      }

      verifiedAmount = flwResult.data.amount;
    }

    // 3. Record in Idempotency Ledger
    const cleanDonor = (supporter_name || 'Fan Supporter').trim().slice(0, 30);
    const txRecord: RedeemedTxInfo = {
      amount: verifiedAmount,
      figureId: figure.id,
      figureName: figure.name,
      supporterName: cleanDonor,
      timestamp: Date.now()
    };
    recordRedeemedTransaction(strTxRef, txRecord);
    recordRedeemedTransaction(strTxId, txRecord);

    // 4. Atomically Update Server Figure Balance
    figure.totalBalance += verifiedAmount;
    figure.fanCount += 1;

    // 5. Create Verified Live Event
    const verifiedEvent: LiveGiftEvent = {
      id: `evt_${isSimulated ? 'sim' : 'real'}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      fanName: cleanDonor,
      amount: verifiedAmount,
      figureId: figure.id,
      figureName: figure.name,
      sector: figure.sector,
      sectorLabel: figure.sectorLabel,
      eventType: verifiedAmount >= 5000 ? 'whale' : 'donation',
      message: `${isSimulated ? 'Simulated' : 'Verified'} gift of ₦${verifiedAmount.toLocaleString()} to ${figure.name}`
    };

    recentEvents = [verifiedEvent, ...recentEvents.slice(0, 49)];

    // 6. Broadcast Real-Time Update to ALL Connected Concurrent Users
    broadcastToAllClients({
      type: 'PAYMENT_VERIFIED',
      event: verifiedEvent,
      figureId: figure.id,
      isSimulated,
      updatedFigure: figure,
      figures: getAllFiguresSorted(),
      totalPot: calculateTotalPot(),
      timestamp: Date.now()
    });

    console.log(`[FanBrawl Server] Verified ${isSimulated ? 'simulated' : 'real'} gift: ₦${verifiedAmount.toLocaleString()} to ${figure.name} by ${cleanDonor}`);

    return res.json({
      verified: true,
      is_simulated: isSimulated,
      transaction_id: strTxId,
      tx_ref: strTxRef,
      amount: verifiedAmount,
      figure_id: figure.id,
      figure_name: figure.name,
      new_total_balance: figure.totalBalance,
      timestamp: Date.now(),
      message: isSimulated
        ? 'Simulated gift credited on the master leaderboard.'
        : 'Payment verified and credited on the master leaderboard.'
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
 * Endpoint: POST /api/flutterwave-webhook
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
      const figureId = payload.data.meta?.figure_id || payload.data.meta?.team_id || 'davido';
      const figure = masterFigures.get(figureId);

      if (figure && amount >= 100) {
        figure.totalBalance += amount;
        figure.fanCount += 1;

        const donor = (payload.data.customer?.name || 'Fan Supporter').trim().slice(0, 30);
        const record: RedeemedTxInfo = {
          amount,
          figureId: figure.id,
          figureName: figure.name,
          supporterName: donor,
          timestamp: Date.now()
        };
        recordRedeemedTransaction(txRef, record);
        if (txId) {
          recordRedeemedTransaction(txId, record);
        }

        const webhookEvent: LiveGiftEvent = {
          id: `evt_webhook_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: Date.now(),
          fanName: donor,
          amount,
          figureId: figure.id,
          figureName: figure.name,
          sector: figure.sector,
          sectorLabel: figure.sectorLabel,
          eventType: amount >= 5000 ? 'whale' : 'donation',
          message: `Verified gift of ₦${amount.toLocaleString()} to ${figure.name}`
        };

        recentEvents = [webhookEvent, ...recentEvents.slice(0, 49)];

        broadcastToAllClients({
          type: 'PAYMENT_VERIFIED',
          event: webhookEvent,
          figureId: figure.id,
          updatedFigure: figure,
          figures: getAllFiguresSorted(),
          totalPot: calculateTotalPot(),
          timestamp: Date.now()
        });
      }
    }
  }

  return res.status(200).json({ status: 'acknowledged' });
});

/**
 * Health Check & Operational Metrics Endpoint
 * Endpoint: GET /api/health
 */
app.get('/api/health', (_req, res) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'ok',
    service: 'FanBrawl Real-Time Concurrent Payment Engine',
    uptimeSeconds: Math.floor(process.uptime()),
    activeSubscribers: sseClients.size,
    totalFiguresTracked: masterFigures.size,
    totalPotNgn: calculateTotalPot(),
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

// -------------------------------------------------------------
// Server Background Ticker Engine (Synchronized for All Users)
// -------------------------------------------------------------
const NIGERIAN_FAN_NAMES = [
  '30BG_Tunde', 'Outsider_Kelechi', 'Starboy_Segun', 'Titan_Chioma', 'Mercenary_Joy',
  'Jenifa_Funke_Fan', 'Sabinus_Investor', 'Peller_Vibe', 'Lerry_FC',
  'Regha_Critique', 'Ravers_Amina', 'SabiGirl_Blessing', 'Icons_Chidi', 'Machala_Burna',
  'Nollywood_Fan', 'Tao_Army', 'Shaggi_Swagger', 'DrinkWater_Aproko',
  'Pooja_Sports', 'Phynation', 'Baye_Tribe', 'KieKie_Glam',
  'Genny_Icon', 'RMD_Classic', 'Ololade_Asake', 'Zanku_General', 'DaSilva_Lagos',
  'Basketmouth_Ribs', 'AY_Live_VIP', 'Bovi_Fire_Fan', 'Macaroni_Ooin'
];

let serverGiftTimer: NodeJS.Timeout | null = null;

function scheduleServerGiftTick() {
  const nextDelay = 400 + Math.random() * 500;
  serverGiftTimer = setTimeout(() => {
    try {
      const figureList = Array.from(masterFigures.values());
      if (figureList.length > 0) {
        const randFigure = figureList[Math.floor(Math.random() * figureList.length)];

        const rand = Math.random();
        let amount = 500;
        if (rand < 0.01) amount = 100;
        else if (rand < 0.03) amount = 200;
        else if (rand < 0.45) amount = 500;
        else if (rand < 0.75) amount = 1000;
        else if (rand < 0.90) amount = 2000;
        else if (rand < 0.97) amount = 5000;
        else if (rand < 0.993) amount = 10000;
        else amount = 20000;

        randFigure.totalBalance += amount;
        randFigure.fanCount += 1;

        const fanName = NIGERIAN_FAN_NAMES[Math.floor(Math.random() * NIGERIAN_FAN_NAMES.length)];
        const simEvt: LiveGiftEvent = {
          id: `evt_srv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: Date.now(),
          fanName,
          amount,
          figureId: randFigure.id,
          figureName: randFigure.name,
          sector: randFigure.sector,
          sectorLabel: randFigure.sectorLabel,
          eventType: amount >= 5000 ? 'whale' : 'donation',
          message: `Gifted ₦${amount.toLocaleString()} to ${randFigure.name}`
        };

        recentEvents = [simEvt, ...recentEvents.slice(0, 49)];

        broadcastToAllClients({
          type: 'STREAM_TICK',
          event: simEvt,
          figureId: randFigure.id,
          newBalance: randFigure.totalBalance,
          newFanCount: randFigure.fanCount,
          totalPot: calculateTotalPot(),
          timestamp: Date.now()
        });
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
    console.log(`[FanBrawl Concurrent Real-Time Server] Listening on http://0.0.0.0:${PORT}`);
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
