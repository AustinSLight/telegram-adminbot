export const followAddressforDB = async (followData: any) => {
	const response = await fetch(
		// `${process.env.NEXT_PUBLIC_API_URL}/launchpads/update?id=${launchpadId}`,
		`http://127.0.0.1:4000/launchpads/follow`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(followData),
		},
	);
  console.log('-----.',response.ok)

	return response;
};
