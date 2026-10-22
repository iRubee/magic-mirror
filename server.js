const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const dotenv = require("dotenv");

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const rootDirectory = __dirname;
const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
};

function sendJson(response, statusCode, body) {
    response.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
    });
    response.end(JSON.stringify(body));
}

async function handleWeather(response, requestUrl) {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const city = requestUrl.searchParams.get("q");

    if (!apiKey) {
        sendJson(response, 500, { error: "OPENWEATHERMAP_API_KEY is not configured." });
        return;
    }

    if (!city) {
        sendJson(response, 400, { error: "A city is required." });
        return;
    }

    const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
    weatherUrl.searchParams.set("q", city);
    weatherUrl.searchParams.set("appid", apiKey);
    weatherUrl.searchParams.set("units", "metric");
    weatherUrl.searchParams.set("lang", "it");

    try {
        const weatherResponse = await fetch(weatherUrl);
        const body = await weatherResponse.text();
        response.writeHead(weatherResponse.status, {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
        });
        response.end(body);
    } catch (error) {
        console.error("Weather request failed:", error);
        sendJson(response, 502, { error: "Unable to contact the weather service." });
    }
}

function serveStaticFile(response, pathname) {
    const requestedPath = pathname === "/" ? "/index.html" : pathname;
    const filePath = path.resolve(rootDirectory, `.${requestedPath}`);

    if (!filePath.startsWith(rootDirectory + path.sep)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(error.code === "ENOENT" ? 404 : 500);
            response.end(error.code === "ENOENT" ? "Not found" : "Internal server error");
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        response.writeHead(200, {
            "Content-Type": contentTypes[extension] || "application/octet-stream",
        });
        response.end(content);
    });
}

const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);

    if (request.method !== "GET") {
        response.writeHead(405, { Allow: "GET" });
        response.end("Method not allowed");
        return;
    }

    if (requestUrl.pathname === "/api/weather") {
        handleWeather(response, requestUrl);
        return;
    }

    serveStaticFile(response, requestUrl.pathname);
});

server.listen(port, () => {
    console.log(`Magic Mirror available at http://localhost:${port}`);
});
