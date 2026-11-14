// Pruebas de la lógica del servidor con una base de datos en memoria.
// Ejecutar: npx tsx scripts/test-core.ts
import { ACTIONS, ApiError, Ctx, DB, Tx } from '../api/_lib/core.js';

const data = new Map<string, any>();
const clone = (v: any) => (v == null ? v : JSON.parse(JSON.stringify(v)));

const memDb: DB = {
  run: async fn => {
    const writes: (() => void)[] = [];
    let wrote = false;
    const readGuard = () => {
      if (wrote) throw new Error('BUG: lectura después de una escritura dentro de la transacción (Firestore no lo permite)');
    };
    const tx: Tx = {
      get: async p => (readGuard(), clone(data.get(p) ?? null)),
      query: async (col, field, value) => {
        readGuard();
        const out: { id: string; data: any }[] = [];
        for (const [k, v] of data) {
          const rest = k.slice(col.length + 1);
          if (k.startsWith(col + '/') && !rest.includes('/') && v[field] === value) out.push({ id: rest, data: clone(v) });
        }
        return out;
      },
      set: (p, d) => ((wrote = true), writes.push(() => data.set(p, clone(d)))),
      update: (p, d) => {
        wrote = true;
        writes.push(() => {
          if (!data.has(p)) throw new Error(`update sobre documento inexistente: ${p}`);
          data.set(p, { ...data.get(p), ...clone(d) });
        });
      },
      delete: p => ((wrote = true), writes.push(() => data.delete(p)))
    };
    const r = await fn(tx);
    writes.forEach(w => w());
    return r;
  }
};

const user = (uid: string, email: string, verified = true): Ctx => ({ uid, email, emailVerified: verified });
const call = (ctx: Ctx, action: string, body: any = {}) => ACTIONS[action](memDb, ctx, { action, ...body });

let passed = 0;
let failed = 0;
const ok = (cond: any, label: string) => {
  if (cond) passed++;
  else {
    failed++;
    console.error('  ✗', label);
  }
};
const rejects = async (p: Promise<any>, status: number, label: string) => {
  try {
    await p;
    failed++;
    console.error('  ✗ debía fallar:', label);
  } catch (e: any) {
    if (e instanceof ApiError && e.status === status) passed++;
    else {
      failed++;
      console.error('  ✗', label, '→', e?.status, e?.message);
    }
  }
};

const run = async () => {
  const creator = user('creator-uid', 'mauricio@ejemplo.com');
  const owner = user('owner-uid', 'dueno@cafe.com');
  const cashier = user('cash-uid', 'caja@cafe.com');
  const ana = user('ana-uid', 'ana@mail.com');
  const beto = user('beto-uid', 'beto@mail.com');
  const intruso = user('x-uid', 'x@mail.com');
  data.set('platformAdmins/creator-uid', { email: creator.email });

  console.log('Plataforma');
  await rejects(call(owner, 'createStore', { storeId: 'cafe', name: 'Café', ownerEmail: owner.email }), 403, 'solo el creador crea comercios');
  await call(creator, 'createStore', { storeId: 'cafe-luna', name: 'Café Luna', ownerEmail: 'Dueno@Cafe.com', subscriptionDueDate: '2026-12-10' });
  ok(data.get('stores/cafe-luna')?.isSystemActive === true, 'comercio creado activo');
  ok(data.get('stores/cafe-luna/staff/dueno@cafe.com')?.role === 'owner', 'dueño asignado (email en minúsculas)');
  await rejects(call(creator, 'createStore', { storeId: 'cafe-luna', name: 'X', ownerEmail: 'a@b.com' }), 409, 'id duplicado');
  await rejects(call(creator, 'createStore', { storeId: 'admin', name: 'X', ownerEmail: 'a@b.com' }), 400, 'id reservado');
  const meOwner = await call(owner, 'me');
  ok(meOwner.staffStores.length === 1 && meOwner.staffStores[0].role === 'owner', 'el dueño ve su comercio');

  console.log('Equipo');
  await call(owner, 'addStaff', { storeId: 'cafe-luna', email: cashier.email, role: 'cashier' });
  await rejects(call(cashier, 'addStaff', { storeId: 'cafe-luna', email: 'otro@x.com' }), 403, 'cajero no agrega personal');
  await rejects(call(owner, 'removeStaff', { storeId: 'cafe-luna', email: owner.email }), 400, 'no se quita al único dueño');
  await rejects(call(user('owner-uid', 'dueno@cafe.com', false), 'addPurchase', { storeId: 'cafe-luna', customerId: 'x', amount: 1 }), 403, 'email sin verificar no es staff');

  console.log('Configuración');
  await call(owner, 'updateStore', { storeId: 'cafe-luna', patch: { pointsPerPeso: 0.1, welcomePoints: 50, referralPoints: 300, isSystemActive: false, ownerPin: 'x' } });
  const st = data.get('stores/cafe-luna');
  ok(st.pointsPerPeso === 0.1 && st.welcomePoints === 50, 'dueño cambia la configuración');
  ok(st.isSystemActive === true && !('ownerPin' in st), 'dueño NO puede reactivarse ni meter campos extra');
  await rejects(call(cashier, 'updateStore', { storeId: 'cafe-luna', patch: { name: 'Hack' } }), 403, 'cajero no configura');
  await call(owner, 'saveReward', { storeId: 'cafe-luna', reward: { title: 'Café', pointsCost: 100, stock: 1 } });
  const rewardId = [...data.keys()].find(k => k.startsWith('stores/cafe-luna/rewards/'))!.split('/').pop();

  console.log('Clientes');
  await rejects(call(ana, 'registerCustomer', { storeId: 'cafe-luna', name: 'Ana', lastName: 'Paz', dni: '12' }), 400, 'DNI inválido');
  const { customer: anaC } = await call(ana, 'registerCustomer', { storeId: 'cafe-luna', name: 'Ana', lastName: 'Paz', dni: '30.111.222', points: 999999 });
  ok(anaC.points === 50 && anaC.dni === '30111222', 'registro con puntos de bienvenida (ignora puntos enviados)');
  await rejects(call(beto, 'registerCustomer', { storeId: 'cafe-luna', name: 'Beto', lastName: 'Gil', dni: '30111222' }), 409, 'DNI duplicado');
  await call(beto, 'registerCustomer', { storeId: 'cafe-luna', name: 'Beto', lastName: 'Gil', dni: '28999888', referralCode: anaC.referralCode });
  ok(data.get('stores/cafe-luna/customers/beto-uid').referredBy === 'ana-uid', 'referido registrado');

  console.log('Caja');
  await rejects(call(intruso, 'addPurchase', { storeId: 'cafe-luna', customerId: 'ana-uid', amount: 1000 }), 403, 'un cliente no puede cargarse compras');
  await rejects(call(ana, 'adjustPoints', { storeId: 'cafe-luna', customerId: 'ana-uid', delta: 5000 }), 403, 'un cliente no puede ajustarse puntos');
  const p1 = await call(cashier, 'addPurchase', { storeId: 'cafe-luna', customerId: 'ana-uid', amount: 1000 });
  ok(p1.movement.points === 100, `compra $1000 x0.1 = 100 pts (dio ${p1.movement.points})`);
  const p0 = await call(cashier, 'addPurchase', { storeId: 'cafe-luna', customerId: 'ana-uid', amount: 5 });
  ok(p0.movement.points === 0, 'compra chica no regala puntos mínimos');
  const pb = await call(cashier, 'addPurchase', { storeId: 'cafe-luna', customerId: 'beto-uid', amount: 2000 });
  ok(pb.movement.points === 200 + 300, 'primera compra del referido suma bono');
  ok(data.get('stores/cafe-luna/customers/ana-uid').points === 50 + 100 + 300, 'quien invitó también recibe el bono');
  const pb2 = await call(cashier, 'addPurchase', { storeId: 'cafe-luna', customerId: 'beto-uid', amount: 2000 });
  ok(pb2.movement.points === 200, 'el bono de referido es una sola vez');

  console.log('Canjes');
  const r1 = await call(ana, 'redeem', { storeId: 'cafe-luna', rewardId });
  ok(data.get('stores/cafe-luna/customers/ana-uid').points === 350, 'canje descuenta puntos');
  ok(data.get(`stores/cafe-luna/rewards/${rewardId}`).stock === 0, 'canje descuenta stock');
  ok(data.get('stores/cafe-luna/customers/ana-uid').tierId === 'bronce' && data.get('stores/cafe-luna/customers/ana-uid').totalEarned === 450, 'canjear no baja el total ganado');
  await rejects(call(ana, 'redeem', { storeId: 'cafe-luna', rewardId }), 400, 'sin stock no se canjea');
  const v1 = await call(cashier, 'validateVoucher', { storeId: 'cafe-luna', code: r1.voucher.code.toLowerCase() });
  ok(v1.success, 'cajero valida el cupón');
  const v2 = await call(cashier, 'validateVoucher', { storeId: 'cafe-luna', code: r1.voucher.code });
  ok(!v2.success, 'un cupón no se entrega dos veces');

  console.log('QR de un solo uso');
  await rejects(call(ana, 'createQr', { storeId: 'cafe-luna', points: 1000 }), 403, 'cliente no genera QR');
  const qr = await call(cashier, 'createQr', { storeId: 'cafe-luna', points: 75, hoursValid: 2 });
  const c1 = await call(ana, 'claimQr', { storeId: 'cafe-luna', code: qr.code });
  ok(c1.points === 75, 'QR suma sus puntos');
  await rejects(call(beto, 'claimQr', { storeId: 'cafe-luna', code: qr.code }), 409, 'QR no se reutiliza');
  await rejects(call(ana, 'claimQr', { storeId: 'cafe-luna', code: 'INVENTADO' }), 404, 'QR inventado no sirve');
  const qrOld = await call(cashier, 'createQr', { storeId: 'cafe-luna', points: 10 });
  data.set(`stores/cafe-luna/qrcodes/${qrOld.code}`, { ...data.get(`stores/cafe-luna/qrcodes/${qrOld.code}`), expiresAt: '2000-01-01T00:00:00Z' });
  await rejects(call(ana, 'claimQr', { storeId: 'cafe-luna', code: qrOld.code }), 410, 'QR vencido');

  console.log('Encuestas y sorteos');
  await call(owner, 'saveSurvey', { storeId: 'cafe-luna', survey: { title: 'Atención', rewardPoints: 20, questions: [{ question: '¿Qué tal?', type: 'text' }] } });
  const surveyId = [...data.keys()].find(k => /stores\/cafe-luna\/surveys\/[^/]+$/.test(k))!.split('/').pop();
  await rejects(call(ana, 'completeSurvey', { storeId: 'cafe-luna', surveyId, answers: {} }), 400, 'encuesta sin respuestas');
  await call(ana, 'completeSurvey', { storeId: 'cafe-luna', surveyId, answers: { q1: 'Bien' } });
  await rejects(call(ana, 'completeSurvey', { storeId: 'cafe-luna', surveyId, answers: { q1: 'Bien' } }), 409, 'encuesta una sola vez');
  await call(owner, 'saveRaffle', { storeId: 'cafe-luna', raffle: { title: 'Brunch', entryCostPoints: 10, endDate: '2099-01-01' } });
  const raffleId = [...data.keys()].find(k => /stores\/cafe-luna\/raffles\/[^/]+$/.test(k))!.split('/').pop();
  await call(ana, 'enterRaffle', { storeId: 'cafe-luna', raffleId, entries: 3 });
  await call(beto, 'enterRaffle', { storeId: 'cafe-luna', raffleId });
  ok(data.get(`stores/cafe-luna/raffles/${raffleId}`).participants.find((p: any) => p.customerId === 'ana-uid').entries === 3, 'chances acumuladas');
  await rejects(call(ana, 'drawRaffle', { storeId: 'cafe-luna', raffleId }), 403, 'cliente no sortea');
  const d = await call(owner, 'drawRaffle', { storeId: 'cafe-luna', raffleId });
  ok(['Ana Paz', 'Beto Gil'].includes(d.winnerName), 'sorteo con ganador');
  await rejects(call(beto, 'enterRaffle', { storeId: 'cafe-luna', raffleId }), 400, 'sorteo cerrado');

  console.log('Ajustes y cancelaciones');
  const before = data.get('stores/cafe-luna/customers/ana-uid').points;
  const adj = await call(owner, 'adjustPoints', { storeId: 'cafe-luna', customerId: 'ana-uid', delta: -999999 });
  ok(adj.movement.points === -before && data.get('stores/cafe-luna/customers/ana-uid').points === 0, 'ajuste no deja saldo negativo y registra lo aplicado');
  await call(owner, 'saveReward', { storeId: 'cafe-luna', reward: { id: rewardId, title: 'Café', pointsCost: 100, stock: 5 } });
  await call(owner, 'adjustPoints', { storeId: 'cafe-luna', customerId: 'beto-uid', delta: 100 });
  const bpts = data.get('stores/cafe-luna/customers/beto-uid').points;
  const r2 = await call(beto, 'redeem', { storeId: 'cafe-luna', rewardId });
  await rejects(call(cashier, 'cancelVoucher', { storeId: 'cafe-luna', voucherId: r2.voucher.id }), 403, 'cajero no cancela canjes');
  await call(owner, 'cancelVoucher', { storeId: 'cafe-luna', voucherId: r2.voucher.id });
  ok(data.get('stores/cafe-luna/customers/beto-uid').points === bpts && data.get(`stores/cafe-luna/rewards/${rewardId}`).stock === 5, 'cancelar devuelve puntos y stock');

  console.log('Suspensión');
  await rejects(call(owner, 'updateSubscription', { storeId: 'cafe-luna', isSystemActive: false }), 403, 'el dueño no toca la suscripción');
  await call(creator, 'updateSubscription', { storeId: 'cafe-luna', isSystemActive: false, suspensionReason: 'Falta de pago' });
  await rejects(call(cashier, 'addPurchase', { storeId: 'cafe-luna', customerId: 'ana-uid', amount: 100 }), 403, 'suspendido: caja bloqueada');
  await rejects(call(ana, 'redeem', { storeId: 'cafe-luna', rewardId }), 403, 'suspendido: canjes bloqueados');
  await call(creator, 'updateSubscription', { storeId: 'cafe-luna', isSystemActive: true });
  await call(cashier, 'addPurchase', { storeId: 'cafe-luna', customerId: 'ana-uid', amount: 100 });
  ok(true, 'reactivado funciona');

  console.log('Niveles');
  await call(owner, 'updateStore', { storeId: 'cafe-luna', patch: { tiers: [{ name: 'Base', minPoints: 0, multiplier: 1 }, { name: 'VIP', minPoints: 500, multiplier: 2 }] } });
  await call(owner, 'adjustPoints', { storeId: 'cafe-luna', customerId: 'beto-uid', delta: 1000 });
  const pv = await call(cashier, 'addPurchase', { storeId: 'cafe-luna', customerId: 'beto-uid', amount: 1000 });
  ok(pv.movement.points === 200, `multiplicador del nivel configurado (dio ${pv.movement.points})`);

  console.log(`\n${passed} pruebas OK, ${failed} fallidas`);
  if (failed) process.exit(1);
};

run().catch(e => {
  console.error(e);
  process.exit(1);
});
