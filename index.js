const express = require("express");
const amqp = require("amqplib");
const {
  RABBITMQ_HOST,
  RABBITMQ_PASSWORD,
  RABBITMQ_USER,
} = require("./config.js");

const app = express();
app.use(express.json());
let channel;

const connectAMQP = async () => {
  let retryCount = 0;
  try {
    const conn = await amqp.connect(
      `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}`
    );
    console.log("Connected to the queue!");
    channel = await conn.createChannel();
    await channel.assertExchange("comm", "direct", { durable: true });
    await channel.prefetch(1);
    await channel.assertQueue("comm_whatsapp", { durable: true });
    await channel.bindQueue("comm_whatsapp", "comm", "communication");
  } catch (e) {
    console.error(e);
    retryConnectAMQP(retryCount);
  }
};

const retryConnectAMQP = (retryCount = 0) => {
  if (retryCount > 5) {
    console.log("Maximum retry count reached. Unable to connect to the queue.");
    return;
  }

  console.log(
    `Retrying to connect to the queue in 5 seconds... Retry count: ${retryCount} of 5`
  );
  setTimeout(() => {
    connectAMQP();
  }, 5000);
};

const sendWhatsAppMessage = async (message) => {
  const queue = "comm_whatsapp";
  try {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Message sent to queue: ${message}`);
  } catch (e) {
    console.error(e);
  }
};

app.post("/communication/whatsapp", (req, res) => {
  const { phoneNumber, message } = req.body;
  sendWhatsAppMessage({ phoneNumber, message });
  res.status(200).send({ status: "success", data: { phoneNumber, message } });
});

app.listen(3020, () => {
  console.log("Server is running on http://localhost:3020");
});

connectAMQP();
