require("dotenv").config();

const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");
const Groq = require("groq-sdk");

console.log("========== STARTING BOT ==========");
console.log("Node:", process.version);
console.log("TOKEN exists:", !!process.env.TOKEN);
console.log("TOKEN length:", process.env.TOKEN?.length || 0);
console.log("GROQ exists:", !!process.env.GROQ_API_KEY);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const personality = fs.readFileSync("./prompts/personality.txt", "utf8");

const ALLOWED_CHANNEL = "CHANNEL_ID"; // Replace with your allowed channel ID 

client.once("clientReady", () => {
  console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== ALLOWED_CHANNEL) return;
  if (!message.mentions.has(client.user)) return;

  const prompt = message.content
    .replace(new RegExp(`<@!?${client.user.id}>`, "g"), "")
    .trim();

  if (!prompt) {
    return message.reply("Arre bhai, mention karke chup kyun ho gaya? 💀");
  }

  try {
    await message.channel.sendTyping();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 1.4,
      top_p: 0.95,
      max_tokens: 350,
      messages: [
        { role: "system", content: personality },
        { role: "user", content: prompt },
      ],
    });

    await message.reply(
      completion.choices?.[0]?.message?.content ??
      "Processor chai pe gaya hai."
    );

  } catch (err) {
    console.error(err);
    await message.reply("Groq Error: " + err.message);
  }
});

client.login(process.env.TOKEN);