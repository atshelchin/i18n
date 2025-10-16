import { deLocalizeUrl } from '$lib/index.js';
export const reroute = (request: { url: URL }) => {
	console.log(123, deLocalizeUrl(request.url).pathname);
	return deLocalizeUrl(request.url).pathname;
};
