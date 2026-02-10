import { connect, JSONCodec } from "nats";

let natsConn;
let js;
const jc = JSONCodec();

export const initNATS = async () => {
  try {
    const natsUrl = process.env.NATS_URL || "nats://localhost:4222";

    natsConn = await connect({
      servers: natsUrl,
      reconnect: true,
      maxReconnectAttempts: -1,
    });

    js = natsConn.jetstream();
    const jsm = await natsConn.jetstreamManager();
    const streamName = "NOTIFICATIONS";

    const streamConfig = {
      name: streamName,
      subjects: ["user.*.notifications"],
      storage: "file",
      max_age: 86400000000000,
      discard: "old",
    };

    try {
      await jsm.streams.info(streamName);
      await jsm.streams.update(streamName, streamConfig);
      console.log(`NATS: Stream "${streamName}" synchronized.`);
    } catch (err) {
      await jsm.streams.add(streamConfig);
      console.log(`NATS: Stream "${streamName}" created.`);
    }

    natsConn.closed().then((err) => {
      console.log(
        `NATS connection closed ${err ? "with error: " + err.message : ""}`,
      );
    });
  } catch (err) {
    console.error("NATS Init Error:", err);
    throw err;
  }
};

export const publish = (subject, payload) => {
  if (!natsConn) return;
  natsConn.publish(subject, jc.encode(payload));
};

export const publishToStream = async (subject, payload) => {
  if (!js) return;
  try {
    return await js.publish(subject, jc.encode(payload));
  } catch (err) {
    console.error("JetStream Publish Error:", err);
  }
};

export { natsConn, js };
