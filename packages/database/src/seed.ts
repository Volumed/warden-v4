import "dotenv/config";
import { db } from "./index";
import { badServers } from "./schemas/bad-servers";
import { imports } from "./schemas/imports";
import { users } from "./schemas/users";

async function main() {
	const user: typeof users.$inferInsert = {
		id: "542799191282417684",
		appeals: 0,
		first_appeal: null,
		last_appeal: null,
		status: "WHITELISTED",
		type: "OTHER",
	};

	const server1: typeof badServers.$inferInsert = {
		id: "860760302227161118",
		name: "Test Server",
		type: "OTHER",
	};

	const server2: typeof badServers.$inferInsert = {
		id: "813030955598086174",
		name: "Test Server 2",
		type: "OTHER",
	};

	const server3: typeof badServers.$inferInsert = {
		id: "1364048999266521260",
		name: "Test Server 3",
		type: "OTHER",
	};

	const server4: typeof badServers.$inferInsert = {
		id: "1012753553418354748",
		name: "Test Server 4",
		type: "OTHER",
	};

	const server5: typeof badServers.$inferInsert = {
		id: "577993482761928734",
		name: "Test Server 5",
		type: "OTHER",
	};

	const importData1: typeof imports.$inferInsert = {
		userId: "542799191282417684",
		serverId: "860760302227161118",
		roles: ["Test Role", "Test Role 2"],
		type: "OTHER",
		appealed: false,
	};

	const importData2: typeof imports.$inferInsert = {
		userId: "542799191282417684",
		serverId: "813030955598086174",
		roles: ["Test Role", "Test Role 2"],
		type: "LEAKER",
		appealed: false,
	};

	const importData3: typeof imports.$inferInsert = {
		userId: "542799191282417684",
		serverId: "1364048999266521260",
		roles: ["Test Role", "Test Role 2"],
		type: "CHEATER",
		appealed: false,
	};

	const importData4: typeof imports.$inferInsert = {
		userId: "542799191282417684",
		serverId: "1012753553418354748",
		roles: ["Test Role", "Test Role 2"],
		type: "SUPPORTER",
		appealed: false,
	};

	const importData5: typeof imports.$inferInsert = {
		userId: "542799191282417684",
		serverId: "577993482761928734",
		roles: ["Test Role", "Test Role 2"],
		type: "OWNER",
		appealed: false,
	};

	await db.insert(users).values(user);
	console.log("New user created!");
	await db.insert(badServers).values(server1);
	await db.insert(badServers).values(server2);
	await db.insert(badServers).values(server3);
	await db.insert(badServers).values(server4);
	await db.insert(badServers).values(server5);
	console.log("Servers created!");
	await db.insert(imports).values(importData1);
	await db.insert(imports).values(importData2);
	await db.insert(imports).values(importData3);
	await db.insert(imports).values(importData4);
	await db.insert(imports).values(importData5);
	console.log("New imports created!");
}

main();
