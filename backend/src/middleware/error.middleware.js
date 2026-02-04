import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err);

  let status = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof ZodError) {
    status = 400;
    message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  }

  res.status(status).json({
    success: false,
    message,
  });
}
