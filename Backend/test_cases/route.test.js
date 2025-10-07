import request from "supertest";
import app from "../server.js";

describe("GET /api/tim-lee", () => {
  it("should return greeting message", async () => {
    const res = await request(app).get("/api/tim-lee");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Hello this is Tim Lee" });
  });
});