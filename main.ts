import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "Weather Server",
    version: "1.0.0",
});

server.tool(
    "getWeather",
    "Get the current weather for a given city",
    {
        city: z.string().describe("The name of the city to get the weather for"),

    },
    async ({city}) => {
        //get coordinates for the city
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`)
        const data = await response.json();

        if (data.results.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No results found for city "${city}".`
                    }
                ]
            }
        }

        const { latitude, longitude } = data.results[0];
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
        const weatherData = await weatherResponse.json();

        const temperatureCelsius = weatherData.current_weather.temperature;
        const temperatureFahrenheit = (temperatureCelsius * 9/5) + 32;
        
        return {
            content: [
                {
                    type: "text",
                    text: `The current weather in ${city} is ${temperatureCelsius}°C or ${temperatureFahrenheit.toFixed(0)}°F.`
                }
            ]
        }
});

const transport = new StdioServerTransport()
server.connect(transport);