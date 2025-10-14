import request from "supertest";
import app from "../server.js";

describe("GET /api/jaron-lin", () => {
  it("should return greeting message", async () => {
    const res = await request(app).get("/api/jaron-lin");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Hello, this is Jaron Lin." });
  });
});
