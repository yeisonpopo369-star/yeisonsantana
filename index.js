const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot activo");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor listo en puerto " + PORT);
});
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require("discord.js");

const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ]
});

// ====== CONFIGURA ESTO ======
const CANAL_LOGS = "1473354424062840948";
const ROL_ESPERA = "1472264909072105675";
const ROL_WHITELIST = "1465705032946024610";
const ROL_REPROBADO = "1473145509362401462";
// =============================

const rutaArchivo = "./formularios.json";

function cargarDatos() {
  if (!fs.existsSync(rutaArchivo)) {
    fs.writeFileSync(rutaArchivo, "{}");
  }
  return JSON.parse(fs.readFileSync(rutaArchivo));
}

function guardarDatos(datos) {
  fs.writeFileSync(rutaArchivo, JSON.stringify(datos, null, 2));
}

let formularios = cargarDatos();

// ===== PREGUNTAS (NO MODIFICADAS) =====
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

client.once("ready", () => {
  console.log(`✅ Bot listo como ${client.user.tag}`);
});

// ===== COMANDO =====
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
});

// ===== INTERACCIONES =====
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  // INICIAR PROCESO
  if (interaction.customId === "iniciar_dm") {

    try {
      const miembro = await interaction.guild.members.fetch(interaction.user.id);
      await miembro.roles.add(ROL_ESPERA);

      const fila = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("comenzar_formulario")
          .setLabel("🚀 Toca para Iniciar")
          .setStyle(ButtonStyle.Success)
      );

      const embed = new EmbedBuilder()
        .setTitle("⚡ WHITELIST WESTSIDE RP")
        .setDescription(
`Bienvenido al proceso oficial de Whitelist.

❗ Responde con seriedad.
❗ No copies respuestas.
❗ Proceso individual.

Presiona el botón para comenzar.`
        )
        .setColor("#8C1F2C");

      await interaction.user.send({ embeds: [embed], components: [fila] });
      await interaction.reply({ content: "📩 Te envié un mensaje privado.", ephemeral: true });

    } catch (error) {
      await interaction.reply({ content: "❌ No puedo enviarte DM. Activa tus mensajes privados.", ephemeral: true });
    }
  }

  // COMENZAR FORMULARIO
  if (interaction.customId === "comenzar_formulario") {

    formularios[interaction.user.id] = {
      paso: 0,
      respuestas: []
    };

    guardarDatos(formularios);

    const embedPregunta = new EmbedBuilder()
      .setTitle("📋 Whitelist Westside RP")
      .setDescription(preguntas[0])
      .setColor("#8C1F2C")
      .setFooter({ text: `Pregunta 1 de ${preguntas.length}` });

    await interaction.update({
      embeds: [embedPregunta],
      components: []
    });
  }

  // ===== BOTONES STAFF =====

  // APROBAR
  if (interaction.customId.startsWith("aprobar_")) {

    const userId = interaction.customId.split("_")[1];
    const miembro = await interaction.guild.members.fetch(userId);

    await miembro.roles.remove(ROL_ESPERA);
    await miembro.roles.add(ROL_WHITELIST);

    delete formularios[userId];
    guardarDatos(formularios);

    await interaction.update({
      content: "✅ Usuario Aprobado",
      embeds: [],
      components: []
    });
  }

  // REPROBAR
  if (interaction.customId.startsWith("reprobar_")) {

    const userId = interaction.customId.split("_")[1];
    const miembro = await interaction.guild.members.fetch(userId);

    await miembro.roles.remove(ROL_ESPERA);
    await miembro.roles.add(ROL_REPROBADO);

    await interaction.update({
      content: "❌ Usuario Reprobado",
      embeds: [],
      components: []
    });
  }

  // APROBAR + MENSAJE
  if (interaction.customId.startsWith("aprobarmsg_")) {

    const userId = interaction.customId.split("_")[1];
    const miembro = await interaction.guild.members.fetch(userId);

    await miembro.roles.remove(ROL_ESPERA);
    await miembro.roles.add(ROL_WHITELIST);

    await miembro.send("🎉 ¡Felicidades! Tu whitelist fue aprobada. Bienvenido a la ciudad.");

    delete formularios[userId];
    guardarDatos(formularios);

    await interaction.update({
      content: "✅ Usuario aprobado y notificado.",
      embeds: [],
      components: []
    });
  }

  // REPROBAR + MOTIVO
  if (interaction.customId.startsWith("reprobarmotivo_")) {

    const userId = interaction.customId.split("_")[1];

    await interaction.reply({
      content: "✍️ Escribe el motivo del rechazo en este canal.",
      ephemeral: true
    });

    const filtro = m => m.author.id === interaction.user.id;

    const collector = interaction.channel.createMessageCollector({
      filter: filtro,
      max: 1,
      time: 60000
    });

    collector.on("collect", async (msg) => {

      const motivo = msg.content;
      const miembro = await interaction.guild.members.fetch(userId);

      await miembro.roles.remove(ROL_ESPERA);
      await miembro.roles.add(ROL_REPROBADO);

      await miembro.send(`❌ Tu whitelist fue rechazada.\n\n📌 Motivo:\n${motivo}`);

      await msg.delete();

      await interaction.editReply({
        content: "❌ Usuario reprobado y motivo enviado."
      });
    });
  }
});

// ===== RESPUESTAS DM =====
client.on("messageCreate", async (message) => {

  if (message.channel.type !== ChannelType.DM) return;
  if (message.author.bot) return;

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
      new ButtonBuilder()
        .setCustomId(`aprobar_${message.author.id}`)
        .setLabel("✅ Aprobar")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`reprobar_${message.author.id}`)
        .setLabel("❌ Reprobar")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`aprobarmsg_${message.author.id}`)
        .setLabel("📩 Aprobar + Mensaje")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`reprobarmotivo_${message.author.id}`)
        .setLabel("📝 Reprobar + Motivo")
        .setStyle(ButtonStyle.Secondary)
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
});

process.on("unhandledRejection", console.error);

console.log("TOKEN length:", process.env.TOKEN?.length);

client.login(process.env.TOKEN)
  .then(() => console.log("LOGIN PROMESA OK"))
  .catch(err => {
    console.error("ERROR EN LOGIN:");
    console.error(err);
  });

client.on("error", console.error);