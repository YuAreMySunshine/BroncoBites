import request from "supertest";
import app from "../server.js";

describe("GET /api/javi-wu", () => {
  it("should return greeting message", async () => {
    const res = await request(app).get("/api/javi-wu");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Hello this is Javi Wu" });
  });
});