import swaggerJsdoc from "swagger-jsdoc";
import  swaggerUi from "swagger-ui-express";
import { type Express, type Request, type Response } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TruFin Installment Tracker API",
      version: "1.0.0",
      description: "API documentation for TruFin backend",
    },
    servers: [{ url: "http://localhost:5151" }],
    components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],  // applies to all routes globally
    
  },
  apis:["./src/routes/**/*.{ts,js}"],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
    console.log("📄 Mounting Swagger at /docs");
    
    // Serve raw swagger JSON
    app.get("/docs.json", (_req: Request, res: Response) => {
      res.json(swaggerSpec);
    });
  
    // Serve swagger UI via CDN
    app.get("/docs", (_req: Request, res: Response) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>TruFin API Docs</title>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" >
          </head>
          <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
            <script>
              SwaggerUIBundle({
                url: "/docs.json",
                dom_id: '#swagger-ui',
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
                layout: "BaseLayout"
              })
            </script>
          </body>
        </html>
      `);
    });
  }