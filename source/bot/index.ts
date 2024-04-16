import { env } from "node:process";
import { FileAdapter } from "@grammyjs/storage-file";
import { config as dotenv } from "dotenv";
import { Bot, session } from "grammy";
import { MenuMiddleware } from "grammy-inline-menu";
import { generateUpdateMiddleware } from "telegraf-middleware-console-time";

// import { html as format } from "telegram-format";
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

// Define a simple in-memory storage for tracking context
// const contextStore = new Map<number, string>(); // Map user IDs to previous messages

bot.use(
	session({
		initial: (): Session => ({}),
		storage: new FileAdapter(),
	}),
);

// bot.use(async (ctx: MyContext, next) => {
// 	// Check if the user has sent a text message
// 	if (ctx.message && ctx.message.text) {
// 		const userId = ctx.message.from?.id || 0;
// 		const userInput = ctx.message.text;
// 		const pattern = /^0x([a-fA-F0-9]{40})$/;

// 		// Retrieve previous message from context store
// 		const previousMessage = contextStore.get(userId);

// 		// Process user input based on context
// 		let response = "";
// 		console.log(previousMessage);
// 		if (previousMessage === "/follow") {
// 			if (pattern.test(userInput)) {
// 				console.log(userInput);
// 				response = `You typed valid wallet address: ${userInput}. Is it right?(yes or no)`;
// 				contextStore.set(userId, response);
// 			} else {
// 				response = `Invalid wallet address. Please go back to menu and try again.`;
// 				contextStore.set(userId, response);
// 			}
// 		} else {
// 			console.log(previousMessage);
// 			response = `I'm not sure how to respond to "${userInput}". Can you provide more details?`;
// 			contextStore.set(userId, response);
// 		}
// 		// else if (previousMessage.findIndex("") !== -1) {
// 		// 	console.log(previousMessage);
// 		// 	response = `I'm not sure how to respond to "${userInput}". Can you provide more details?`;
// 		// 	contextStore.set(userId, response);
// 		// }

// 		// Reply with the processed response
// 		await ctx.reply(response);
// 	}

// 	// Continue processing other middleware and handlers
// 	await next();
// });

bot.use(i18n.middleware());

if (env["NODE_ENV"] !== "production") {
	// Show what telegram updates (messages, button clicks, ...) are happening (only in development)
	bot.use(generateUpdateMiddleware());
}

bot.command("help", async (ctx) => ctx.reply(ctx.t("help")));

bot.command("html", async (ctx) => {
	await ctx.reply(
		'<b>Hi!</b> <i>Welcome</i> to <a href="https://grammy.dev">grammY</a>. Click the button below:',
		{
			parse_mode: "HTML",
			reply_markup: {
				inline_keyboard: [
					[{ text: "Input Text", callback_data: "input_text" }],
				],
			},
		},
	);
});

const menuMiddleware = new MenuMiddleware("/", menu);

bot.command("start", async (ctx) => menuMiddleware.replyToContext(ctx));
bot.command("follow", async (ctx) =>
	menuMiddleware.replyToContext(ctx, "/follow/"),
);
bot.use(menuMiddleware.middleware());
bot.hears(/^0x[a-fA-F0-9]{40}$/, (ctx) => {
	console.log(ctx.match[0]);

	ctx.reply("Valid");
});
bot.on("message:text", (ctx) =>
	ctx.reply(`Invalid address. Type only Address.`),
);
// False positive as bot is not a promise
// eslint-disable-next-line unicorn/prefer-top-level-await
bot.catch((error) => {
	console.error("ERROR on handling update occured", error);
});

export async function start(): Promise<void> {
	// The commands you set here will be shown as /commands like /start or /magic in your telegram client.
	await bot.api.setMyCommands([
		{ command: "start", description: "open the menu" },
		{ command: "follow", description: "follow by telegram" },
		{ command: "html", description: "some html _mode example" },
		{ command: "help", description: "show the help" },
	]);

	await bot.start({
		onStart(botInfo) {
			console.log(new Date(), "Bot starts as", botInfo.username);
		},
	});
}
