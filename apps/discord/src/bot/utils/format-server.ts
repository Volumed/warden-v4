export const formatServerType = (status: string) => {
	switch (status) {
		case "CHEATING":
			return "Cheating";
		case "LEAKING":
			return "Leaking";
		case "RESELLING":
			return "Reselling";
		case "HACKING":
			return "Hacking";
		case "ADVERTISING":
			return "Advertising";
		case "OTHER":
			return "Other";
		default:
			return status;
	}
};
