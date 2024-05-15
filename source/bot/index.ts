import { env } from "node:process";
import { FileAdapter } from "@grammyjs/storage-file";
import { config as dotenv } from "dotenv";
import { Bot, session } from "grammy";
import { MenuMiddleware } from "grammy-inline-menu";
import { generateUpdateMiddleware } from "telegraf-middleware-console-time";
import { i18n } from "../translation.js";
import { menu } from "./menu/index.js";
import type { MyContext, Session } from "./my-context.js";

dotenv(); // Load from .env file
const token = env["BOT_TOKEN"];
if (!token) {
	throw new Error(
		"You have to provide the bot-token from @BotFather via environment variable (BOT_TOKEN)",
	);
}

const bot = new Bot<MyContext>(token);


bot.use(
	session({
		initial: (): Session => ({}),
		storage: new FileAdapter(),
	}),
);

bot.use(i18n.middleware());

if (env["NODE_ENV"] !== "production") {
	// Show what telegram updates (messages, button clicks, ...) are happening (only in development)
	bot.use(generateUpdateMiddleware());
}

const menuMiddleware = new MenuMiddleware("/", menu);

bot.command("start", async (ctx) => menuMiddleware.replyToContext(ctx));
bot.use(menuMiddleware.middleware());


// Listen for new members joining the group
bot.on("message", async (ctx) => {
	if (ctx.message?.new_chat_members) {
		// Iterate over each new member
		for (const member of ctx.message.new_chat_members) {
			// Check if the new member is the bot itself
			if (member.id === ctx.me.id) {
				// Skip if the bot itself joined the group
				continue;
			}
			menuMiddleware.replyToContext(ctx)
		}
	}
});

// False positive as bot is not a promise
// eslint-disable-next-line unicorn/prefer-top-level-await
bot.catch((error) => {
	console.error("ERROR on handling update occured", error);
});

export async function start(): Promise<void> {
	// The commands you set here will be shown as /commands like /start or /magic in your telegram client.
	await bot.api.setMyCommands([
		{ command: "start", description: "open the menu" },
	]);

	await bot.start({
		onStart(botInfo) {
			console.log(new Date(), "Bot starts as", botInfo.username);
		},
	});
}
