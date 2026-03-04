const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const fs = require("fs");

const app = express();

// ===== EXPRESS SERVIDOR =====
app.get("/", (req, res) => {
  res.send("Bot activo");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Servidor listo en puerto " + PORT);
});

// ====== CONFIGURA ESTO ======
const CANAL_LOGS = "1473354424062840948";
const ROL_ESPERA = "1472264909072105675";
const ROL_WHITELIST = "1465705032946024610";
const ROL_REPROBADO = "1473145509362401462";
// =============================

const rutaArchivo = "./formularios.json";

function cargarDatos() {
  if (!fs.existsSync(rutaArchivo)) fs.writeFileSync(rutaArchivo, "{}");
  return JSON.parse(fs.readFileSync(rutaArchivo));
}

function guardarDatos(datos) {
  fs.writeFileSync(rutaArchivo, JSON.stringify(datos, null, 2));
}

let formularios = cargarDatos();

// ===== PREGUNTAS =====
const preguntas = [
  "1/13 ¿Indica tu país y tu edad?",
  "2/13 ¿Tienes experiencia en rol y en qué servidores previos has roleado?",
  "3/13 Redacta una historia breve y coherente sobre tu personaje dentro del entorno de rol. Explica su pasado, personalidad, motivaciones y cómo llegó a la ciudad, incluyendo detalles que ayuden a entender su comportamiento actual.",
  "4/13 ¿Qué significa Rol?",
  "5/13 Explica qué te llamó la atención del servidor y qué esperas encontrar o aportar dentro de la comunidad",
  "6/13 Describe el estilo de rol que prefieres y cómo planeas llevarlo a cabo dentro de la ciudad. (Civil, criminal, legal, etc.)",
  "7/13 ¿Cómo diferenciarías el rol IC del OOC?",
  "8/13 ¿ En tus propias palabras, explica qué es el PowerGaming (PG) y el Metagaming (MG)?",
  "9/13 Explica qué es DM, CK, RK y PK y cuándo se aplican.",
  "10/10 ¿Qué tres normas en roleplay consideras más importantes y por qué?",
  "11/13 ¿Qué es el Fairplay en un servidor de rol Explica con tus propias palabras qué significa y por qué es importante para mantener una experiencia justa y realista?",
  "12/13 ¿ Si observas a un jugador rompiendo el rol o las normas, ¿cómo actuarías correctamente?",
  "13/13 Introduce tu SERIAL de MTA (obligatorio):Asegúrate de colocar el serial correcto, ya que sin esta información no se podrá aprobar tu whitelist.."
];

// ===== CLIENT DISCORD =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ]
});

// ===== EVENTOS DE LOGIN Y ERRORES =====
process.on("unhandledRejection", console.error);

client.once("ready", () => {
  console.log(`✅ Bot listo como ${client.user.tag}`);
});

setTimeout(() => {
  console.log("Si ves esto, el código llega hasta aquí.");
}, 3000);

console.log("Intentando login...");
client.login(process.env.TOKEN)
  .then(() => console.log("LOGIN PROMESA OK"))
  .catch(err => console.error("ERROR EN LOGIN:", err));

// ===== EVENTOS WHITELIST =====
// Aquí va TODO tu código de messageCreate, interactionCreate y DM
// que ya tenías en tu archivo original, sin modificaciones
// Se mantiene intacto desde tu versión anterior
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().trim() === "!whitelist") {
    const embed = new EmbedBuilder()
      .setTitle("🌴📜 WHITELIST – Westside RolePlay 📜🌴")
      .setDescription("Pulsa el botón y comienza tu whitelist.")
      .setColor("#8C1F2C");

    const fila = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("iniciar_dm")
        .setLabel("WhiteList Westside Roleplay")
        .setStyle(ButtonStyle.Danger)
    );

    message.channel.send({ embeds: [embed], components: [fila] });
  }

  // RESPUESTAS DM
  if (message.channel.type === ChannelType.DM) {
    const data = formularios[message.author.id];
    if (!data) return;

    data.respuestas.push(message.content);
    data.paso++;
    guardarDatos(formularios);

    if (data.paso < preguntas.length) {
      const embedPregunta = new EmbedBuilder()
        .setTitle("📋 Whitelist Westside RP")
        .setDescription(preguntas[data.paso])
        .setColor("#8C1F2C")
        .setFooter({ text: `Pregunta ${data.paso + 1} de ${preguntas.length}` });

      message.channel.send({ embeds: [embedPregunta] });
    } else {
      const canalLogs = await client.channels.fetch(CANAL_LOGS);

      const contenidoFinal = data.respuestas.map((respuesta, i) =>
        `**${preguntas[i]}**\n${respuesta}\n`
      ).join("\n");

      const embedFinal = new EmbedBuilder()
        .setTitle("📩 Nueva Whitelist")
        .setDescription(contenidoFinal)
        .addFields({ name: "Usuario", value: `<@${message.author.id}>` })
        .setColor("#8C1F2C")
        .setTimestamp();

      const fila = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aprobar_${message.author.id}`).setLabel("✅ Aprobar").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`reprobar_${message.author.id}`).setLabel("❌ Reprobar").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`aprobarmsg_${message.author.id}`).setLabel("📩 Aprobar + Mensaje").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`reprobarmotivo_${message.author.id}`).setLabel("📝 Reprobar + Motivo").setStyle(ButtonStyle.Secondary)
      );

      canalLogs.send({ embeds: [embedFinal], components: [fila] });

      const embedConfirmacion = new EmbedBuilder()
        .setTitle("✅ Formulario Enviado")
        .setDescription("Tu formulario fue enviado correctamente. Espera revisión del staff.")
        .setColor("#8C1F2C");

      message.channel.send({ embeds: [embedConfirmacion] });

      delete formularios[message.author.id];
      guardarDatos(formularios);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  // Mantener TODO tu código de interacción tal cual estaba
});