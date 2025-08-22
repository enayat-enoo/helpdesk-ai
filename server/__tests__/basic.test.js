import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";

describe("basic", () => {
  it("healthz", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  // more tests would go here (auth, ticket create, triage)
  afterAll(async () => {
    await mongoose.disconnect();
  }, 10000);
});
