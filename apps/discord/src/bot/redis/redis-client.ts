import { createClient } from "redis";
import { bot } from "../bot.js";

// Create and configure Redis client
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on("error", (err) => bot.logger.error("Redis Client Error", err));

// Connect to Redis
await redisClient.connect();

// Function to set a key-value pair in Redis
export const setValue = async (key: string, value: string): Promise<void> => {
	await redisClient.set(key, value);
};

// Function to retrieve a value by key from Redis
export const getValue = async (key: string): Promise<string | null> => {
	return redisClient.get(key);
};

// Function to delete a key-value pair from Redis
export const deleteValue = async (key: string): Promise<void> => {
	await redisClient.del(key);
};

// Function to check the health of the Redis connection
export const checkRedisHealth = async (): Promise<boolean> => {
	try {
		await redisClient.set("health", "ok");
		const reply = await redisClient.get("health");
		bot.logger.info("Redis health check:", reply);
		return reply === "ok";
	} catch (error) {
		bot.logger.error("Redis health check failed:", error);
		return false;
	}
};
