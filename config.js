require("dotenv").config();

module.exports = {
  RABBITMQ_USER: process.env.RABBITMQ_USER,
  RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD,
  RABBITMQ_HOST: process.env.RABBITMQ_HOST,
};
