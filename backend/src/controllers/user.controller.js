import { ok } from "../utils/apiResponse.js";

export function me(req, res) {
  return ok(res, req.user, "User profile");
}
