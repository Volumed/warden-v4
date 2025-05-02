export const formatStatus = (status: string) => {
	switch (status) {
		case "APPEALED":
			return "Appealed";
		case "BLACKLISTED":
			return "Blacklisted";
		case "PERM_BLACKLISTED":
			return "Permanently Blacklisted";
		case "WHITELISTED":
			return "Whitelisted";
		default:
			return status;
	}
};
