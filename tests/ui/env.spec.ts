import { test, expect } from "@playwright/test";

test("API with bearer auth", async () => {
    const apiKey = process.env.API_KEY;

    const res = await fetch("https://httpbin.org/bearer", {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    console.log(body);

    expect(body.authenticated).toBe(true);
});