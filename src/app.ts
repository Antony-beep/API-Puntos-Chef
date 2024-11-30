import { addKeyword, createBot, createFlow, createProvider, MemoryDB } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";
import { KEYS } from "../data/constantes";

const API_KEY= KEYS.API_KEY;
const PORT = Number(KEYS.PORT) || 3002;

console.log(`Servidor corriendo en el puerto: ${PORT}`);
const flowBienvenida = addKeyword("hola").addAnswer("Prueba de wp api");

const main = async () => {
    try {
        const provider = createProvider(BaileysProvider);

        // Inicializa el servidor HTTP en el puerto 3002
        provider.initHttpServer(PORT);

        provider.http?.server.post(
            "/send-message",
            handleCtx(async (bot, req, res) => {
                try {
                    // Verifica la API Key en los encabezados de la solicitud
                    const clientApiKey = req.headers["x-api-key"];
                    if (clientApiKey !== API_KEY) {
                        res.statusCode = 401; // Respuesta no autorizada
                        return res.end("Acceso denegado: API Key inválida");
                    }

                    // Extrae los parámetros del cuerpo de la solicitud
                    const { telefono, mensaje } = req.body;
                    if (!telefono || !mensaje) {
                        res.statusCode = 400; // Solicitud incorrecta
                        return res.end("Faltan parámetros: 'telefono' y 'mensaje' son requeridos");
                    }

                    // Lógica para enviar un mensaje
                    await bot.sendMessage(telefono, mensaje, {});
                    res.end("Mensaje enviado desde el servidor de Polka");
                } catch (error) {
                    console.error("Error al enviar el mensaje:", error);
                    res.statusCode = 500; // Error interno del servidor
                    res.end("Error al enviar el mensaje");
                }
            })
        );

        // Configuración del bot
        await createBot({
            flow: createFlow([]), // Define los flujos (se pueden agregar más)
            database: new MemoryDB(), // Base de datos en memoria
            provider,
        });
    } catch (error) {
        console.error("Error al iniciar el bot:", error);
        process.exit(1); // Salir con código de error
    }
};

main();
