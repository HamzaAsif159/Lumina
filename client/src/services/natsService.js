import { connect, JSONCodec, consumerOpts } from "nats.ws";

const jc = JSONCodec();
let nc = null;
let activeNotificationSub = null;
let isSubscribing = false;

export const natsService = {
  async connect() {
    if (nc && !nc.isClosed()) return nc;
    try {
      nc = await connect({ servers: [import.meta.env.VITE_NATS_URL] });
      console.log("✅ NATS WebSocket Connected");
      return nc;
    } catch (err) {
      console.error("❌ NATS Connection Error:", err);
      throw err;
    }
  },

  subscribeToChat(userId, onMessage) {
    if (!nc) return;
    const sub = nc.subscribe(`user.${userId}.chat`);
    (async () => {
      for await (const m of sub) {
        onMessage(jc.decode(m.data));
      }
    })();
    return sub;
  },

  async subscribeToNotifications(userId, onNotification) {
    if (!nc || isSubscribing) return;

    if (activeNotificationSub) {
      return activeNotificationSub;
    }

    isSubscribing = true;

    try {
      const js = nc.jetstream();
      const opts = consumerOpts();
      opts.durable(`user_${userId}_notifications`);
      opts.manualAck();
      opts.ackExplicit();
      opts.deliverTo(`user_${userId}_deliver`);

      const sub = await js.subscribe(`user.${userId}.notifications`, opts);
      activeNotificationSub = sub;

      (async () => {
        for await (const m of sub) {
          onNotification(jc.decode(m.data));
          m.ack();
        }
      })();
      return sub;
    } catch (err) {
      console.error("❌ JetStream Subscription Error:", err);
    } finally {
      isSubscribing = false;
    }
  },

  async disconnect() {
    if (nc) {
      activeNotificationSub = null;
      await nc.close();
      nc = null;
    }
  },
};
