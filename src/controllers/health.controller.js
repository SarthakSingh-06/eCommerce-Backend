import { API_Response } from "../utils/api-response.js";

export function healthController(req, res) {
    return API_Response.ok(res, "OK");
};
