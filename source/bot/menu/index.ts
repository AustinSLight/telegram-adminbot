import { MenuTemplate } from "grammy-inline-menu";
import type { MyContext } from "../my-context.js";

export const menu = new MenuTemplate<MyContext>((ctx) =>
	ctx.t("welcome", {
		name: ctx.from!.first_name
	}),
);
menu.url({
	text: "Astra Dao Launchpad(test net)",
	url: "https://next.test.astradao.org/launchpad",
});
menu.url({
	text: "Buy Astra Dao (test net)",
	url: "https://next.test.astradao.org/how-to-buy",
});
menu.url({
	text: "Astra Dao Owner(test net)",
	url: "https://t.me/astraTokenTelegramBot",
});

menu.url({
	text:  "✅Follow",
	url: 'https://t.me/astraTokenTelegramBot'
});
