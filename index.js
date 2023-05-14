// https://pastebin.com/XHCbmy29 - code without autorenew function
// https://pastebin.com/DXhYZyX7 - with autorenew
//  code-
// latest code- https://pastebin.com/5fwx0Vmx
// https://pastebin.com/8grr9gnR
//  users.json file-
// https://pastebin.com/inG0zTkU
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const axios = require('axios');
const cryptojs = require('crypto-js'); 
const { Client, GatewayIntentBits, WebhookClient, Embed } = require('discord.js');
const { readFileSync, writeFileSync } = require('fs');
const threeCommasAPI = require('3commas-api-node');
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });
const webhook = new WebhookClient({ id: process.env.WEBHOOK_ID, token: process.env.WEBHOOK_TOKEN });
const api = new threeCommasAPI({
    apiKey: process.env.APIKEYS,
    apiSecret: process.env.SECRET
  })


const botShow = async (id) => {
    let data = await api.botShow(id);
    return data;
  };

  // const API_KEY = process.env.BinanceAPI;
  // const SECRET_KEY = process.env.BinanceSECRET;
   
  // const ENDPOINT = 'https://fapi.binance.com/fapi/v1/exchangeInfo';
   
  // const options = {
  //   method: 'GET',
  //   headers: {
  //     'X-MBX-APIKEY': API_KEY,
  //   },
  // };
   
  // async function getTopPositiveUSDTMFutures24H() {
  //   try {
  //     const response = await fetch(ENDPOINT + '?contractType=PERPETUAL', options);
  //     if (response.ok) {
  //       const data = await response.json();
  //       const symbols = data.symbols;
  //       let pairs = [];
  //       for (let symbol of symbols) {
  //         let symbolName = symbol.symbol;
  //         if (!symbolName.endsWith('USDT')) continue;
  //         const tickerResponse = await fetch(
  //           `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbolName}`,
  //           options
  //         );
  //         if (tickerResponse.ok) {
  //           const tickerData = await tickerResponse.json();
  //           let changePercent = parseFloat(tickerData.priceChangePercent);
  //           pairs.push({ symbolName, changePercent });
  //         } else {
  //           console.error(`Ticker response status: ${tickerResponse.status}`);
  //           console.error(`Ticker response body: ${await tickerResponse.text()}`);
  //         }
  //       }
  //       pairs = pairs.filter((pair) => pair.changePercent > 0);
  //       const topPositive = pairs
  //         .sort((a, b) => b.changePercent - a.changePercent)
  //         .slice(0, 10);
  //       return topPositive;
  //     } else {
  //       console.error(`Response status: ${response.status}`);
  //       console.error(`Response body: ${await response.text()}`);
  //       throw new Error('Bad response');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
   
  // async function runCode() {
  //   try {
  //     const data = await getTopPositiveUSDTMFutures24H();
  //     if (data) {
  //       console.log(
  //         `Top 10 pairs whose 24h change % is positive for USDT-M futures:`
  //       );
  //       data.forEach((pair) =>
  //         console.log(`${pair.symbolName}: ${pair.changePercent}%`)
  //       );
  //     } else {
  //       console.log('No data available');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
   
  // runCode();
  // setInterval(runCode, 60 * 60 * 1000);


// this works

const API_KEY = process.env.BinanceAPI;
const SECRET_KEY = process.env.BinanceSECRET;

const ENDPOINT = 'https://fapi.binance.com/fapi/v1/exchangeInfo';

const options = {
  method: 'GET',
  headers: {
    'X-MBX-APIKEY': API_KEY
  }
};

async function getTopPositiveUSDTMFutures24H() {
  try {
    const response = await fetch(ENDPOINT + '?contractType=PERPETUAL', options);
    if (response.ok) {
      const data = await response.json();
      const symbols = data.symbols;
      let pairs = [];
      for (let symbol of symbols) {
        let symbolName = symbol.symbol;
        if (!symbolName.endsWith('USDT')) continue;
        const tickerResponse = await fetch(
          `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbolName}`,
          options
        );
        if (tickerResponse.ok) {
          const tickerData = await tickerResponse.json();
          let changePercent = parseFloat(tickerData.priceChangePercent);
          pairs.push({ symbolName, changePercent });
        } else {
          console.error(`Ticker response status: ${tickerResponse.status}`);
          console.error(`Ticker response body: ${await tickerResponse.text()}`);
        }
      }
      pairs = pairs.filter((pair) => pair.changePercent > 0);
      const topPositive = pairs
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 10);
      return topPositive;
    } else {
      console.error(`Response status: ${response.status}`);
      console.error(`Response body: ${await response.text()}`);
      throw new Error('Bad response');
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateBotPairs(pairs, botID) {
  try {
    const bot = await api.botShow(botID);
    if (bot && bot.is_enabled) {
      const currentPairs = bot.pairs;
      console.log(bot.strategy_list)
      console.log(`Previous pairs of bot ${botID}: ${currentPairs}`);
      const newPairs = pairs
        .map((pair) =>
          `USDT_${pair.symbolName.trim().replace(/USDT$/, "")}`
        )
        .join(", ");
      if (newPairs != currentPairs) {
        // Add the mandatory parameters here
        let obj = {...bot};
        obj.bot_id = botID;
        obj.pairs = newPairs;
        const updatedBot = await api.botUpdate({
          bot_id: botID,
          pairs: newPairs,
          name: bot?.name,
          strategy: bot.strategy,
          strategy_list: [{"strategy":"manual"}],                       
          base_order_volume: bot.base_order_volume,
          take_profit: bot.take_profit,
          safety_order_volume: bot.safety_order_volume,
          martingale_volume_coefficient: bot.martingale_volume_coefficient,
          martingale_step_coefficient: bot.martingale_step_coefficient,
          max_safety_orders: bot.max_safety_orders,
          active_safety_orders_count: bot.active_safety_orders_count,
          safety_order_step_percentage: bot.safety_order_step_percentage,
          take_profit_type: bot.take_profit_type,
          trailing_enabled: bot.trailing_enabled,
          trailing_deviation: bot.trailing_deviation
        });
        console.log(updatedBot);
        if (updatedBot) {
          console.log(
            `Bot ${botID} was updated with new pairs: ${newPairs}`
          );
        } else {
          console.log(`Bot ${botID} update failed.`);
        }
      } else {
        console.log(
          `Bot ${botID} already has the same pairs: ${currentPairs}`
        );
      }
    } else {
      console.log(`Bot ${botID} does not exist or is not active.`);
    }
  } catch (error) {
    console.error(error);
    console.log("Something went wrong.");
  }
}


async function runCode() {
  try {
    const data = await getTopPositiveUSDTMFutures24H();
    if (data) {
      console.log(
        `Top 10 pairs whose 24h change % is positive for USDT-M futures:`
      );
      data.forEach((pair) =>
        console.log(`${pair.symbolName}: ${pair.changePercent}%`)
      );
      const users = require("./users.json");
      Object.keys(users).forEach(async user => {
        let botID = users[user].botID;
        await updateBotPairs(data, botID);
      });
    } else {
      console.log('No data available');
    }
  } catch (error) {
    console.error(error);
  }
}

runCode();

setInterval(runCode, 60 * 60 * 1000);






 
 
  const botDisable = async (id) => {
    let data = await api.botDisable(id);
    return data;
  };

  const botEnable = async (id) => {
    let data = await api.botEnable(id);
    return data;
  };
 
  const createBar = (percentage) => {
    const length = 34;
    const char = '█';
    const space = ' ';
    let bar = '';
    let max; 
    if (percentage >= 0) {
      max = 1.2; 
    } else {
      max = 30; 
    }
    let fill = Math.round((percentage / Math.abs(max)) * length);
    if (fill > length) {
      fill = length; 
    }
    if (fill < -35) {
      fill = length;
    }
    if (percentage >= 0) {
      bar += char.repeat(Math.min(fill, length)) + space.repeat(Math.max(length - fill, 0));
    } else {
      bar += space.repeat(Math.max(length - Math.abs(fill), 0)) + char.repeat(Math.min(Math.abs(fill), length));
    }
    return bar;
  };
 
 
const createEmbed = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Expected an object.');
  }
  const embed = {
    color: 0xF2CFAF, 
    title: 'BeyondMatrix BOT',  
    timestamp: new Date().toISOString(), 
    footer: { text: 'Updates beyond the matrix \u{1F48E} ', iconURL: 'https://cdn.discordapp.com/attachments/1091698540331405322/1100501863218020442/bm.jpg' }, 
    fields: [] 
  };
  if (data.active_deals.length === 0) {
    embed.fields.push({ name: `Current deals \n\n`, value: `**No deals running**` });
  } else
  data.active_deals.forEach((deal, index) => {
    let value = `\`\`\`css\n${index + 1}) ${deal.bot_name}\n\n`;
    value += `Coin: ${deal.pair}\n`;
    value += `Current PnL: $${deal.actual_usd_profit}\n`;
    value += `Current Price: ${deal.current_price}\n`;
    value += `Take Profit Price: ${deal.take_profit_price}\n`;
    value += `Stop Loss Price: ${deal.stop_loss_price}\n`;
    value += `Bought Amount: ${deal.bought_amount}\n`;
    value += `Safety Order Count: ${deal.completed_safety_orders_count}\n\n`;
    value += 'PnL\n\n';
    value += `${deal.pair} ${deal.actual_profit_percentage}%\n\`\`\``;
    value += ``;
    value += `\`\`\`css\n${createBar(deal.actual_profit_percentage)}\n\`\`\``;
 
    embed.fields.push({ name: `Current deals \n\n`,  value: value });
  });
 
  return embed;
};
 
 
let Data = JSON.parse(fs.readFileSync('users.json', 'utf8'));

fs.watchFile('users.json', (curr, prev) => {
  Data = JSON.parse(fs.readFileSync('users.json', 'utf8'));
});


const getSubscriptionDate=(userID)=> {
  let users = require("./users.json");
  if (users[userID]) {
    return users[userID].subscription_date;
  } else {
    return null;
  }
}


const getDepositAmount = (_user_id) => {
  if (Data.hasOwnProperty(_user_id)) {
    const deposits = Data[_user_id].deposits;
    if (Array.isArray(deposits)) {
      const total = deposits.reduce((a, b) => a + b, 0);
      return total;
    } else {
      return deposits;
    }
  } else {
    return 0;
  }
}

 
const manualrenewal=(message) => {
  let userID = message.author.id;
  let users = require("./users.json");
  if (users[userID]) {
    if (users[userID].auto_renew) {
      const embed = {
        color: 0xF2CFAF,
        title: 'Subscription Status',
        description: 'Your subscription is set to auto-renewal mode. Please disable auto-renewal mode first to access manual renewal services.',
        timestamp: new Date()
      };
      
      message.reply({ embeds: [embed] });
          } else {
      if (users[userID].deposits >= 49) {
        users[userID].deposits -= 49;
        let date = new Date(users[userID].subscription_date);
        date.setDate(date.getDate() + 30);
        users[userID].subscription_date = date.toISOString().slice(0, 10);
        users[userID].last_renewal_date = new Date().toISOString().slice(0, 10);
        users[userID].manual = true;
        users[userID].auto_renew = false;
        writeFileSync("./users.json", JSON.stringify(users, null, 2));
        const embed = {
          color: 0xF2CFAF,
          title: "Subscription Renewed",
          fields: [
            {
              name: "New Subscription Date",
              value: users[userID].subscription_date,
              inline: true,
            },
            {
              name: "Remaining Deposits",
              value: users[userID].deposits + "$",
              inline: true,
            },
          ],
          timestamp: new Date(),
        };
        
        message.reply({ embeds: [embed] });
              } else {
                const embed = {
                  color: 0xF2CFAF,
                  title: "Error",
                  description: "You do not have enough deposits to renew your subscription. Please deposit more funds.",
                  timestamp: new Date(),
                };
                
                message.reply({ embeds: [embed] });
                      }
    }
  } else {
    const embed = {
      color: 0xF2CFAF,
      title: "Registration Required",
      description: "You are not a registered user. Please register first.",
      timestamp: new Date(),
    };
    
    message.reply({ embeds: [embed] });
      }
}


const autorenew = (message, userID) => {
  let users = require("./users.json");
  if (users[userID]) {
    if (users[userID].auto_renew) {
      const subscriptionDate = new Date(users[userID].subscription_date);
      const daysInMonth = 30;
      const expirationDate = new Date(subscriptionDate.getTime() + daysInMonth * 24 * 60 * 60 * 1000);
      const today = new Date();
      const timeDiff = expirationDate.getTime() - today.getTime();
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const embed = {
        color: 0xF2CFAF,
        title: 'Subscription Renewal',
        description: `Renewal is already on auto-renew mode. Your subscription will automatically renew in around ${daysUntilExpiration} day(s).`,
        timestamp: new Date(),
      };
      
      message.reply({ embeds: [embed] });
          } else if (users[userID].deposits >= 49) {
      users[userID].auto_renew = true;
      fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
      const embed = {
        color: 0xF2CFAF,
        title: 'Subscription Renewal',
        description: 'Auto-renewal has been activated for your subscription.',
        timestamp: new Date()
      };
      
      message.reply({ embeds: [embed] });
          } else if (users[userID].deposits < 49) {
      client.users.fetch(userID).then(user => {
        const embed = {
          color: 0xF2CFAF,
          title: "Insufficient Deposits",
          description: "You do not have enough deposits to renew your subscription automatically. Please deposit more funds or renew manually.",
          timestamp: new Date()
        };
        
        user.send({ embeds: [embed] });
              });
    }
  } else {
    console.log("User not found: " + userID);
  }
};


const checkAndRenew = async () => {
  let users = require("./users.json");
  for (let userID in users) {
    const user = client.users.cache.get(userID);
    const subscriptionDate = new Date(users[userID].subscription_date);
    const daysInMonth = 30;
    const expirationDate = new Date(subscriptionDate.getTime() + daysInMonth * 24 * 60 * 60 * 1000);
    const today = new Date();
    const timeDiff = expirationDate.getTime() - today.getTime();
    const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (users[userID].auto_renew) {
      users[userID].subscription_date = expirationDate.toISOString().slice(0, 10);
      users[userID].last_renewal_date = new Date().toISOString().slice(0, 10);
      users[userID].deposits -= 49;
      fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
      if (user) {
        const embed = {
          color: 0xF2CFAF,
          title: 'Subscription Renewed',
          description: `Your subscription has been automatically renewed for 30 days. Your new expiration date is ${users[userID].subscription_date}. Your remaining deposits are ${users[userID].deposits}$.`,
          timestamp: new Date(),
        };
        try {
          await user.send({ embeds: [embed] });
        } catch (error) {
          console.error(`Error sending message to user ${user.id}: ${error}`);
        }
      }
    } else if (daysUntilExpiration === 1 && !users[userID].auto_renew) {
      if (user) {
        const embed = {
          color: 0xF2CFAF,
          title: 'Subscription Renewal Reminder',
          description: 'Make sure to renew your subscription if auto-renew is not enabled, else your services will be stopped in a day. You can ignore this message if already renewed.',
          timestamp: new Date(),
        };
        try {
          await user.send({ embeds: [embed] });
        } catch (error) {
          console.error(`Error sending message to user ${user.id}: ${error}`);
        }
      }
    } else if (daysUntilExpiration <= 0) {
      if (!users[userID].auto_renew) {
        if (user) {
          const embed = {
            color: 0xF2CFAF,
            title: "Subscription Ended",
            description: "Your subscription has ended. Please contact moderators to continue using the service.",
            timestamp: new Date()
          };
          try {
            await user.send({ embeds: [embed] });
          } catch (error) {
            console.error(`Error sending message to user ${user.id}: ${error}`);
          }
        }
        await botDisable(userID);
      }
    }
  }
};

setInterval(checkAndRenew, 21600000);


const disableautorenew = (message) => {
  let userID = message.author.id;
  let users = require("./users.json");
  if (users[userID]) {
    if (!users[userID].auto_renew) {
      const embed = {
        color: 0xF2CFAF,
        title: 'Auto Renewal Mode',
        description: 'Auto renewal mode is already disabled for your subscription.',
        timestamp: new Date()
      };
      
      message.reply({ embeds: [embed] });
          } else {
      users[userID].auto_renew = false;
      writeFileSync("./users.json", JSON.stringify(users, null, 2));
      const embed = {
        color: 0xF2CFAF,
        title: 'Subscription Mode Change',
        description: 'Your subscription mode has been changed to **manual**.',
        fields: [
          {
            name: 'Renewal',
            value: 'You will have to renew your subscription manually before it expires.',
          },
          {
            name: 'Current Subscription Date',
            value: users[userID].subscription_date,
          },
        ],
        timestamp: new Date(),
      };
      
      message.reply({ embeds: [embed] });
          }
  } else {
    const embed = {
      color: 0xF2CFAF,
      title: 'Registration',
      description: 'You are not a registered user. Please register first.',
      timestamp: new Date(),
    };
    
    message.reply({ embeds: [embed] });
      }
}


const renewstatus=(message)=> {
  let userID = message.author.id;
  let users = require("./users.json");
  if (users[userID]) {
    if (users[userID].auto_renew) {
      const embed = {
        color: 0xF2CFAF,
        title: 'Subscription Details',
        description: `Your subscription is on auto renew mode. You will be charged 49$ from your deposits and your subscription date will be extended by 30 days automatically every month. Your current subscription date is ${users[userID].subscription_date}.`,
        timestamp: new Date()
      };
      
      message.reply({ embeds: [embed] });
          } else {
            const embed = {
              color: 0xF2CFAF,
              title: 'Subscription Details',
              description: `Your subscription is on manual mode. You will have to renew your subscription manually before it expires. Your current subscription date is ${users[userID].subscription_date}.`
            };
            
            message.reply({ embeds: [embed] });
                }
  } else {
    message.reply("You are not a registered user. Please register first.");
  }
}


const getTotalPoolBalance = () => {
  let total = 0;
  for (let user_id in Data) {
    total += getDepositAmount(user_id);
  }
  return total;
}
 

const checkAndWarn = (userID) => {
  let users = require("./users.json");
  if (users[userID] && users[userID].manual && !users[userID].auto_renew) {
    const subscriptionDate = new Date(users[userID].subscription_date);
    const daysInMonth = 30;
    const expirationDate = new Date(subscriptionDate.getTime() + daysInMonth * 24 * 60 * 60 * 1000);
    const today = new Date();
    const timeDiff = expirationDate.getTime() - today.getTime();
    const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (daysUntilExpiration <= 3) {
      const user = client.users.cache.get(userID);
      if (user) {
        const embed = {
          color: 0xF2CFAF,
          title: "Subscription Renewal",
          description:
            "Make sure to renew your subscription if auto-renew is not enabled, else your services will be stopped. You can ignore this message if already renewed.",
          timestamp: new Date()
        };
        
        user.send({ embeds: [embed] });
              }
    }
  }
}

const checkAndWarnAll = () => {
  let users = require("./users.json");
  for (let userID in users) {
    checkAndWarn(userID);
  }
}

setInterval(checkAndWarnAll, 86400000);


const createWalletEmbed = (user, data, msg) => {
  if (!user || !data || !msg || typeof user !== 'object' || typeof data !== 'object' || typeof msg !== 'object') {
    throw new Error('Expected three objects.');
  }
 
  var subscription_date = getSubscriptionDate(user.id);
  var end_date = new Date(subscription_date);
  end_date.setDate(end_date.getDate() + 30);
  var today = new Date();
  var difference = end_date.getTime() - today.getTime();
  var days_left = Math.ceil(difference / (1000 * 60 * 60 * 24));

  const walletEmbed = {
    color: 0xF2CFAF,
    title: 'Wallet Details',
    description: 'Here are your updated wallet details:',
    thumbnail: {
      url: user.avatarURL(), 
    },
 
	fields: [         
		{
			name: 'Deposit Amount',
			value: `$${getDepositAmount(user.id)}`,
			inline: true,
		},           
    {
      name: 'Finished Deals Profit USDT',
      value: `$${(data.finished_deals_profit_usd * getDepositAmount(user.id) / getTotalPoolBalance()).toFixed(2)}`,
      inline: true,
    },
    {
      name: 'Profit %',
      value: `${((data.finished_deals_profit_usd / getTotalPoolBalance()) * 100).toFixed(2)}%`,
      inline: true,
    },
    {
      name: 'Total Wallet Amount',
      value: `$${getDepositAmount(user.id) + (data.finished_deals_profit_usd * getDepositAmount(user.id) / getTotalPoolBalance())}`,
      inline: true,
    },
    {
      name: 'Finished Deals Count',
      value: data.finished_deals_count,
      inline: true,
    },            
		{
      name: 'Days Left',
      value: days_left.toString(), 
      inline: true,
    },
    {
      name: 'Subscription Ending On',
      value: end_date.toDateString(), 
      inline: true,
    },
		{
			name: 'Membership Details',
			value: 'Cuming soon',
			inline: true,
		},
    {
      name: '\u200b',
      value: '\u200b',
      inline: false,
    },          
    {
      name: 'Deposit/Withdrawal',
      value: 'To deposit or withdraw funds, please open a ticket. Moderator will get to you shortly.',
      inline: false,
    },
	],
	timestamp: new Date().toISOString(),
	footer: {
		text: 'Fantastic progress \u{2728}',
		icon_url: 'https://cdn.discordapp.com/attachments/1091698540331405322/1100501863218020442/bm.jpg',
	}
};
 return walletEmbed;
}
 
 
client.on('ready', () => {
  console.log(`${client.user.username} is ready to roll!`);
 });
 
 client.on('messageCreate', async (msg) => {
  console.log(msg.content);
  if (msg.author.bot || !msg.content.startsWith('~')) return;
 
  const category_Id = process.env.categoryID;
  console.log('category ID:', category_Id);
  const channel = await client.channels.fetch(msg.channel.id);
  console.log('channel object:', channel);
  const ignoredChannelId = '1104100645235068949';
  if (channel.id === ignoredChannelId) return;

  if (channel.parentId !== category_Id) return;
 
  if (msg.content === '~updates') {
  const user = msg.author;
  const botID = Data[user.id].botID;
  const data = await botShow(botID[0]);
  console.log('botShow data:', data);
 
  
    if (data) {
    msg.channel.send({ embeds: [createEmbed(data)] });
    } else {
    console.error('Error: Invalid or missing data:', data);
    msg.reply('Error: Invalid or missing data.');
    }
    }  
  else if (msg.content === '~progress') {
      const user = msg.author;
      const botID = Data[user.id].botID;
      const data = await botShow(botID[0]);
      console.log('botShow data:', data);
  
      if (data) {
        const embed = createWalletEmbed(user, data, msg);
        msg.channel.send({ embeds: [embed] });
      } else {
        console.error('Error: Invalid or missing data:', data);
        msg.reply('Error: Invalid or missing data.');
      }
    }
  
  else if (msg.content === '~manuallyrenew') {
      manualrenewal(msg, msg.author.id);
    }
    
  else if (msg.content === '~autorenew') { 
      autorenew(msg, msg.author.id);
    }
    
  else if (msg.content === '~disableautorenew') {
       disableautorenew(msg, msg.author.id);
    }

  else if (msg.content === '~renewstatus') {
       renewstatus(msg, msg.author.id);
    }
    
  else if (msg.content === '~help') {
      const embed = {
        color: 0xB7BF96,
        title: 'Bot Commands',
        fields: [
          {
            name: '~updates',
            value: 'Shows the latest updates of the BeyondMatrix bot deals.',
          },
          {
            name: '~progress',
            value: 'Shows your wallet progress.',
          },
          {
            name: '~manuallyrenew',
            value: 'Manually renew your subscription in one go.',
          },
          {
            name: '~autorenew',
            value: 'Enable automatic renewal of your subscription within 24hrs.',
          },
          {
            name: '~disableautorenew',
            value: 'Disable automatic renewal of your subscription.',
          },
          {
            name: '~renewstatus',
            value: 'Check the status of your subscription renewal.',
          },
          {
            name: '\u200b',
            value: '\u200b',
            inline: false,
          }, 
        ],
        timestamp: new Date(),
      };
    
      msg.channel.send({ embeds: [embed] });
    }
    
  else {
      msg.reply('Invalid command');
    }
  });
  
 
client.login(process.env.TOKEN)
