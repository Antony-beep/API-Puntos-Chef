import { addKeyword, createBot, createFlow, createProvider, MemoryDB } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";
import { KEYS } from "../data/constantes";

const API_KEY = KEYS.API_KEY;
const PORT = Number(KEYS.PORT) || 3002;
const QR_PASSWORD = KEYS.QR_PASSWORD ; // Contraseña para acceder a /qr

const flowBienvenida = addKeyword("hola").addAnswer("Prueba de wp api");

console.log("PASSWORD DE QR ES :"+QR_PASSWORD)

const main = async () => {
    try {
        const provider = createProvider(BaileysProvider);
        provider.initHttpServer(PORT);

        // Middleware para verificar la contraseña
        provider.http?.server.use((req, res, next) => {
            if (req.url.startsWith("/qr")) {
                // Verifica la contraseña en el encabezado o en los parámetros de consulta
                const password = req.headers["x-password"] || req.query.pass;
                if (password !== QR_PASSWORD) {
                    res.statusCode = 401; // No autorizado
                    res.end("Acceso denegado: Contraseña incorrecta");
                    return; // Finaliza la ejecución del middleware
                }
            }
            next(); // Continua al siguiente middleware o manejador de rutas
        });

        // Ruta protegida
        

        // Configuración de otras rutas
        provider.http?.server.post(
            "/send-message",
            handleCtx(async (bot, req, res) => {
                try {
                    const clientApiKey = req.headers["x-api-key"];
                    if (clientApiKey !== API_KEY) {
                        res.statusCode = 401;
                        return res.end("Acceso denegado: API Key inválida");
                    }

                    const { telefono, mensaje } = req.body;
                    if (!telefono || !mensaje) {
                        res.statusCode = 400;
                        return res.end("Faltan parámetros: 'telefono' y 'mensaje' son requeridos");
                    }

                    await bot.sendMessage(telefono, mensaje, {});
                    res.end("Mensaje enviado desde el servidor de Polka");
                } catch (error) {
                    console.error("Error al enviar el mensaje:", error);
                    res.statusCode = 500;
                    res.end("Error al enviar el mensaje");
                }
            })
        );

        await createBot({
            flow: createFlow([]),
            database: new MemoryDB(),
            provider,
        });
    } catch (error) {
        console.error("Error al iniciar el bot:", error);
        process.exit(1);
    }
};

main();