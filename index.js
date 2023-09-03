// https://pastebin.com/XHCbmy29 - code without autorenew function
// https://pastebin.com/DXhYZyX7 - with autorenew
// i have this code-
// latest code- 
// https://pastebin.com/Zw3jnLCv
// and this .env file-
// https://pastebin.com/cRweKkJp
// and this users.json file-
// https://pastebin.com/DgpQKtwq
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const cron = require('node-cron');
var schedule = require('node-schedule');
const { addMonths } = require("date-fns");
const axios = require('axios');
const ta = require('technicalindicators');
const cryptojs = require('crypto-js'); 
const { Client, GatewayIntentBits, WebhookClient, Embed } = require('discord.js');
const { readFileSync, writeFileSync } = require('fs');
const threeCommasAPI = require('3commas-api-node');
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });
const webhook = new WebhookClient({ id: process.env.WEBHOOK_ID, token: process.env.WEBHOOK_TOKEN });
client.login(process.env.TOKEN)
const api = new threeCommasAPI({
    apiKey: process.env.APIKEYS,
    apiSecret: process.env.SECRET
  })


const botShow = async (id) => {
    let data = await api.botShow(id);
    return data;
  };


async function get3CommasMarketPairs() {
  try {
    const response = await axios.get('https://api.3commas.io/public/api/ver1/market_pairs');
    const marketPairs = response.data;

    return marketPairs;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to retrieve 3commas market pairs');
  }
}
  
 
const API_KEY = process.env.BinanceAPI;
const SECRET_KEY = process.env.BinanceSECRET;

const ENDPOINT = 'https://fapi.binance.com/fapi/v1/exchangeInfo';

const options = {
  method: 'GET',
  headers: {
    'X-MBX-APIKEY': API_KEY
  }
};

async function getTopUSDTMFutures24H() {
  try {
    const response = await fetch(ENDPOINT + '?contractType=PERPETUAL', options);
    if (response.ok) {
      const data = await response.json();
      const symbols = data.symbols;
      let pairs = [];
      let blacklist = ['GMXUSDT','IDUSDT','LTCUSDT','MAGICUSDT','MAVUSDT','MASKUSDT','BATUSDT','EDUUSDT','RNDRUSDT','DODOXUSDT','ARKMUSDT','BATUSDT','RADUSDT','IOTAUSDT','IDEXUSDT','PENDLEUSDT','HOOKUSDT','SUIUSDT','SFPUSDT','XEMUSDT','DARUSDT','LRCUSDT','INJUSDT','SNXUSDT','RUNEUSDT','FXSUSDT','IOSDTUSDT','HFTUSDT','ATAUSDT','ALICEUSDT','HOTUSDT','LITUSDT','CTKUSDT','BALUSDT','BAKEUSDT','UNIUSDT','UNFIUSDT','IOTXUSDT','LPTUSDT','XTZUSDT','XLMUSDT','BNXUSDT','TLMUSDT','THETAUSDT','ONTUSDT','ACHUSDT','LEVERUSDT','AVAXUSDT','AXSUSDT','FOOTBALLUSDT','FLOWUSDT','XMRUSDT','SOLUSDT','ZILUSDT','RADUSDT','STMXUSDT','YFIUSDT','CVXUSDT','SPELLUSDT','SUSHIUSDT','COMBOUSDT','OMGUSDT','API3USDT','XVSUSDT','COTIUSDT','CKBUSDT','SKLUSDT','DGBUSDT','TRBUSDT','DEFIUSDT','AAVEUSDT','RSRUSDT','KEYUSDT','PEOPLEUSDT','CTSIUSDT','ZRXUSDT','IMXUSDT','CHRUSDT','ZECUSDT','ZENUSDT', 'ENSUSDT', 'ARUSDT','CRVUSDT','RENUSDT', 'CELOUSDT', 'EOSUSDT', 'AUDIOUSDT', 'PERPUSDT', 'REEFUSDT', 'LUNA2USDT', '1000XECUSDT', 'MINAUSDT', 'OGNUSDT', 'BLZUSDT', 'DENTUSDT', 'CHZUSDT', 'KNCUSDT', 'NEOUSDT', 'LQTYUSDT', 'TUSDT', 'SSVUSDT', '1INCHUSDT', 'CELRUSDT', 'DUSKUSDT', 'FLMUSDT', 'HBARUSDT', 'C98USDT', 'MKRUSDT', 'KAVAUSDT', 'HIGHUSDT', 'ONEUSDT', 'NKNUSDT', 'ICXUSDT', 'QNTUSDT', 'BELUSDT', 'AMBUSDT', 'ANTUSDT', 'BANDUSDT', 'WOOUSDT', 'ASTRUSDT', 'TRUUSDT', 'ALGOUSDT', 'JASMYUSDT', 'GTCUSDT', 'RVNUSDT', 'GALUSDT', 'MTLUSDT', 'BUSDUSDT', 'USDCUSDT','BTCDOMUSDT', 'BLURUSDT', '1000LUNCUSDT', '1000FLOKIUSDT', '1000PEPEUSDT', '1000SHIBUSDT'];
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
      pairs = pairs.filter((pair) => !blacklist.includes(pair.symbolName));
      pairs = pairs.filter((pair) => pair.changePercent > 4.5 && pair.changePercent < 12);

      const topPositive = pairs
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 10);

        const updatedTopPositive = await Promise.all(
          topPositive.map(async (pair) => {
            const symbolName = pair.symbolName;
            const historyResponse = await fetch(
              `https://api.binance.com/api/v3/klines?symbol=${symbolName}&interval=1d&limit=7`,
              options
            );
        
            if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              const closePrices = historyData.map((data) => parseFloat(data[4]));
        
              const percentChange7d = ((closePrices[closePrices.length - 1] - closePrices[0]) / closePrices[0]) * 100;
        
              if (Math.abs(percentChange7d) > 7) {
                return null;
              }
        
              return { symbolName, changePercent: pair.changePercent, percentChange7d };
            } else {
              console.error(`History response status: ${historyResponse.status}`);
              console.error(`History response body: ${await historyResponse.text()}`);
              return null;
            }
          })
        );
        
      const filteredTopPositive = updatedTopPositive.filter((pair) => pair !== null);

      return filteredTopPositive;
    } else {
      console.error(`Response status: ${response.status}`);
      console.error(`Response body: ${await response.text()}`);
      throw new Error('Bad response');
    }
  } catch (error) {
    console.error(error);
  }
}




const getBotIds = () => {
  const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));

  let botIds = [];

  for (let key of Object.keys(users)) {
    let userBotIds = users[key];

    if (key === 'customBots') {
      userBotIds = users.customBots;
    } else {
      userBotIds = users[key].botID;
    }

    botIds = [...botIds, ...userBotIds];
  }

  return botIds;
};


// const getMRIDs = () => {
//   const users = require('./users.json');
//   const mrids = [];
//   for (let user in users) {
//     if (users[user].MRID) { 
//       mrids.push(...users[user].MRID); 
//     }
//   }
//   return mrids;
// };
const checkPairsAndToggleBots = async () => {
  const pairs = await getTopUSDTMFutures24H();
  const numPairs = pairs.length;

  const botIds = getBotIds();

  console.log(`Number of pairs: ${numPairs}`);

  for (let id of botIds) {
    if (numPairs < 5) {
      await botDisable(id);
      console.log(`Bot ${id} disabled.`);
    } else if (numPairs >= 5) {
      await botEnable(id);
      console.log(`Bot ${id} enabled.`);
    }
  }
};
async function updateBotPairs(pairs, botID, leverage) { 
  try {
    const bot = await api.botShow(botID);
    if (bot && bot.is_enabled) {
      const currentPairs = bot.pairs;
      // console.log(`Previous pairs of bot ${botID}: ${currentPairs}`);
 
      const baseCurrency = currentPairs.length > 0 ? currentPairs[0].split("_")[0] : null;
      const newPairs = pairs
        .map((pair) => {
          const base = pair.symbolName.trim().replace(/USDT$/, "");
          return `${baseCurrency}_${base}`;
        })
        .join(", ");
 
      if (newPairs !== currentPairs) {
        const updatedBotParams = {
          name: bot.name,
          pairs: JSON.stringify(newPairs.split(", ")), 
          base_order_volume: bot.base_order_volume,
          take_profit: bot.take_profit,
          safety_order_volume: bot.safety_order_volume,
          martingale_volume_coefficient: bot.martingale_volume_coefficient,
          martingale_step_coefficient: bot.martingale_step_coefficient,
          max_safety_orders: bot.max_safety_orders,
          max_active_deals: JSON.stringify(bot.max_active_deals),
          active_safety_orders_count: bot.active_safety_orders_count,
          safety_order_step_percentage: bot.safety_order_step_percentage,
          take_profit_type: bot.take_profit_type,
          strategy_list: JSON.stringify(bot.strategy_list),
          bot_id: botID,
          leverage_type: 'cross',
          leverage_custom_value: bot.leverage_custom_value        
        };
 
        const updatedBot = await api.botUpdate(updatedBotParams);
 
        console.log("Updated bot:", updatedBot);
        if (updatedBot) {
          console.log(`Bot ${botID} was updated with new pairs: ${bot.pairs}`);
        } else {
          console.log(`Bot ${botID} update failed.`);
        }
      } else {
        console.log(`Bot ${botID} already has the same pairs: ${bot.pairs}`);
      }
    } else {
      console.log(`Bot ${botID} does not exist or is not active.`);
    }
  } catch (error) {
    console.error(error);
    console.log("Something went wrong.");
  }
}

// const apiUrl = 'https://fapi.binance.com/fapi/v1/ticker/24hr';


// const checkBTCAndToggleBots = async () => {
//   try {
//     const response = await fetch(`${apiUrl}?symbol=BTCUSDT&interval=4h`);
//     const data = await response.json();

//     const priceChangePercent = parseFloat(data.priceChangePercent);
//     console.log(`BTC price change percent: ${priceChangePercent}%`);

//     const users = require('./users.json');
//     const mrids = getMRIDs(users); 
//     for (let mrid of mrids) {
//       if (priceChangePercent < -2) {
//         await botDisable(mrid); 
//         console.log(`Bot ${mrid} disabled.`);
//       } else {
//         await botEnable(mrid);
//         console.log(`Bot ${mrid} enabled.`);
//         await runCode();
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };


async function updateCustomBots(customBots) {
  try {
    const data = await getTopUSDTMFutures24H();
    if (data) {
      customBots.forEach(async (user) => { 
        let botID = user.botID; 
        let leverage = user.leverage; 
        await updateBotPairs(data, botID, leverage); 
      });
    } else {
      console.log('No data available');
    }
  } catch (error) {
    console.error(error);
  }
}


async function runCode() {
  try {
    const data = await getTopUSDTMFutures24H();
    if (data) {
      console.log(
        `Pairs whose 24h change % is positive for USDT-M futures:`
      );
      data.forEach((pair) =>
        console.log(`${pair.symbolName}: ${pair.changePercent}% (7d Change: ${pair.percentChange7d}%)`)
      );
      const users = require('./users.json');
      Object.keys(users).forEach(async (user) => {
        let botID = users[user].botID;
        let depositAmount = users[user].deposits;
        let leverage = users[user].leverage; 
        await updateBotPairs(data, botID, depositAmount, leverage); 
      });
      await updateCustomBots(users.customBots); 
      await checkPairsAndToggleBots();
      // await checkBTCAndToggleBots();
    } else {
      console.log('No data available');
    }
  } catch (error) {
    console.error(error);
  }
}

runCode();

setInterval(runCode, 2 * 60 * 1000);


async function getDeals(bot_id, scope) {
  try {
    console.log('Fetching deals for bot ID:', bot_id);
    const data = await api.makeRequest("GET", `/public/api/ver1/deals?bot_id=${bot_id}&scope=${scope}`);
    // console.log('Deals:', data); 
    if (data === false) {
      console.log('No data found for this bot ID:', bot_id);
      return [];
    } else {
      return data;
    }
  } catch (error) {
    console.error('Error fetching deals:', error.message);
    return [];
  }
}


async function updateDealTp(deal_id, botId, new_take_profit_percentage) {
  try {
    console.log(`Updating deal tp for deal ID ${deal_id} with new take profit percentage ${new_take_profit_percentage}`);
    const deals = await getDeals(botId, 'active');
    const dealToUpdate = deals.find(deal => deal.id === deal_id);
    if (dealToUpdate) {
      const safetyOrdersCount = Number(dealToUpdate.completed_safety_orders_count);
      console.log(`Deal ${dealToUpdate.id} has reached ${safetyOrdersCount} safety order${safetyOrdersCount > 1 ? 's' : ''}.`);

      await api.makeRequest("POST", `/public/api/ver1/deals/${deal_id}/update_tp?`, { deal_id, new_take_profit_percentage });

      console.log(`Successfully updated take profit percentage for deal ${dealToUpdate.id} to ${new_take_profit_percentage}`);
    } else {
      console.log(`Deal with ID ${deal_id} not found or not active.`);
    }
  } catch (error) {
    console.error('Error updating deal tp:', error.message);
  }
}


async function updateAllDeals() {
  try {
    console.log('Updating all deals...');
    const botIds = getBotIds();
    // console.log('Bot IDs:', botIds);

    for (const botId of botIds) {
      const deals = await getDeals(botId, 'active');
      console.log(`Total Deals for Bot ID ${botId}:`, deals.length);

      for (const deal of deals) {
        let new_take_profit_percentage;
        switch (Number(deal.completed_safety_orders_count)) {
            case 10:
              new_take_profit_percentage = 0.15;
            break;
            case 9:
              new_take_profit_percentage = 0.25;
            break;
            case 8:
              new_take_profit_percentage = 0.47;
            break; 
            default:
              new_take_profit_percentage = 1.1;
        }
      await updateDealTp(deal.id, botId, new_take_profit_percentage);
      }
    }
  } catch (error) {
    console.error('Error updating deals:', error.message);
  }
}

updateAllDeals();
setInterval(updateAllDeals, 2 * 60 * 1000);


const botDisable = async (id) => {
  if (!id) {
    console.error('Error: Invalid or missing bot ID:', id);
    return null;
  }
  let data = await api.botDisable(id);
  return data;
};


const botEnable = async (id) => {
  if (!id) {
    console.error('Error: Invalid or missing bot ID:', id);
    return null;
  }
  let data = await api.botEnable(id);
  return data;
};
 
 
let Data = JSON.parse(fs.readFileSync('./users.json', 'utf8'));

fs.watchFile('./users.json', (curr, prev) => {
  Data = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
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


const getLeverage = (_user_id) => {
  if (Data.hasOwnProperty(_user_id)) {
    return Data[_user_id].leverage;
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


var users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));

var today = new Date();
console.log(today)

function daysBetween(date1, date2) {
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();


  var difference_ms = Math.abs(date1_ms - date2_ms);

  return Math.round(difference_ms / (1000 * 60 * 60 * 24));
}


function add30Days(date) {
  var newDate = new Date(date.getTime());

  newDate.setDate(newDate.getDate() + 30);

  return newDate;
}

function checkAutoRenew(users) {
  for (var userID in users) {
    let user = users[userID];

    if (user.auto_renew) {
      var subscriptionDate = new Date(user.last_renewal_date);

      var remainingDays = daysBetween(today, subscriptionDate);

      if (remainingDays > 27) {
        var newSubscriptionDate = add30Days(subscriptionDate);

        user.deposits -= 49;

        user.subscription_date = newSubscriptionDate.toISOString().slice(0,10); 
        user.last_renewal_date = today.toISOString().slice(0,10); 

        client.users.fetch(userID).then(function(discordUser) {
          discordUser.send({
            embeds: [
              {
                color: 0xF2CFAF,
                title: 'Subscription Renewed',
                description: 'Your subscription has been automatically renewed for 30 days.',
                fields: [
                  { name: 'New subscription date', value: user.subscription_date },
                  { name: 'New deposits', value: user.deposits }
                ],
                timestamp: new Date()
              }
            ]
          });
                  }).catch(function(error) {
          console.error(error);
        });
      }
    }
  }

  fs.writeFileSync('./users.json', JSON.stringify(users, null, 2), 'utf8');
}


checkAutoRenew(users);

var job = schedule.scheduleJob('0 0 * * *', function() {
  console.log('Checking auto renew...');
  checkAutoRenew(users);
});


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
            "Make sure to renew your subscription, else your services will be stopped. You can ignore this message if already renewed.",
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


const createBar = (percentage) => {
  const length = 34;
  const char = '█';
  const space = ' ';
  let bar = '';
  let max; 
  if (percentage >= 0) {
    max = 1.2; 
  } else {
    max = 5; 
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


// A function to split a long string into chunks of a given size
const splitString = (str, size) => {
  const chunks = [];
  let index = 0;
  while (index < str.length) {
    chunks.push(str.slice(index, index + size));
    index += size;
  }
  return chunks;
};

// A function to create an embed with a given data object
const createEmbed = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Expected an object.');
  }
  const embed = {
    color: 0xF2CFAF,
    title: 'BeyondMatrix BOT',
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Updates beyond the matrix \u{1F48E} ',
      iconURL: 'https://cdn.discordapp.com/attachments/1091698540331405322/1100501863218020442/bm.jpg',
    },
    fields: [],
  };
  // Loop through the active deals and add them to the embed fields
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
    
    // Check if the value is longer than the limit
    if (value.length > 1024) {
      // Split the value into chunks of 1024 characters
      const chunks = splitString(value, 1024);
      // Add each chunk as a separate field
      chunks.forEach((chunk, i) => {
        embed.fields.push({
          name: i === 0 ? `Deal ${index + 1}` : '\u200B', // Use a blank name for subsequent fields
          value: chunk,
        });
      });
    } else {
      // Add the value as a single field
      embed.fields.push({
        name: `Deal ${index + 1}`,
        value: value,
      });
    }
  });
  return embed;
};



const createWalletEmbed = (user, data, data2, msg) => {
  if (!user || !data || !data2 || !msg || typeof user !== 'object' || typeof data !== 'object' || typeof data2 !== 'object' || typeof msg !== 'object') {
    throw new Error('Expected four objects.');
  }  
  
  const botId = botShow && botShow.id; // Check if botShow exists before accessing its properties

  const finishedDealsProfitUSD = Number(data.finished_deals_profit_usd) + Number(data2.finished_deals_profit_usd); // Add the profit from both bots
  console.log('finishedDealsProfitUSD:', finishedDealsProfitUSD);

  const depositAmount = getDepositAmount(user.id);
  console.log('depositAmount:', depositAmount);

  const finishedDealsProfitUSDT = (finishedDealsProfitUSD * depositAmount / depositAmount).toFixed(2);
  console.log('finishedDealsProfitUSDT:', finishedDealsProfitUSDT);

  const profitPercentage = ((finishedDealsProfitUSD / depositAmount) * 100).toFixed(2);
  console.log('profitPercentage:', profitPercentage);

  const profitPercentageBot1 = ((data.finished_deals_profit_usd / (depositAmount+data2.finished_deals_profit_usd)) * 100).toFixed(2);
  console.log('profitPercentageBot1:', profitPercentageBot1);

  const profitPercentageBot2 = ((data2.finished_deals_profit_usd / depositAmount) * 100).toFixed(2);
  console.log('profitPercentageBot2:', profitPercentageBot2);

  const totalWalletAmount = depositAmount + (finishedDealsProfitUSD * depositAmount / depositAmount);
  console.log('totalWalletAmount:', totalWalletAmount);

  const leverage = getLeverage(user.id);

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
        value: `$${finishedDealsProfitUSDT}`,
        inline: true,
      },
      {
        name: 'Profit %',
        value: `${profitPercentage}%`,
        inline: true,
      },
      {
        name: 'Total Wallet Amount',
        value: `$${totalWalletAmount}`,
        inline: true,
      },
      {
        name: 'Finished Deals Count',
        value: Number(data.finished_deals_count) + Number(data2.finished_deals_count), 
        inline: true,
      },
      {
        name: 'Leverage Used',
        value: leverage.toString(),
        inline: true,
      },
      {
        name: 'Subscription Ending On',
        value: end_date.toDateString(), 
        inline: true,
      },
      {
        name: 'Days Left',
        value: days_left.toString(), 
        inline: true,
      },
      {
        name: 'Membership Details',
        value: 'Coming soon!',
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },          
      {
        name: `BeyondMatrix deals`,
        value: `Finished Deals Profit USDT: $${(data.finished_deals_profit_usd * depositAmount / depositAmount).toFixed(2)}\nFinished Deals Count: ${data.finished_deals_count}`,
        inline: false,
      },
      {
        name: `MatrixRebound deals (${data2.name})`,
        value: `Finished Deals Profit USDT: $${(data2.finished_deals_profit_usd * depositAmount / depositAmount).toFixed(2)}\nFinished Deals Count: ${data2.finished_deals_count}`,
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

 
client.on('ready', async () => {
  console.log(`${client.user.username} is ready to roll!`);

  const commandData = [
  {
    name: 'updates',
    description: 'Shows running deals of your bot',
    type: 1, 
    default_permission: true 
  },
  {
    name: 'progress',
    description: 'Shows user wallet and sub details',
    type: 1, 
    default_permission: true 
  },
  // {
  //   name: 'enablebot',
  //   description: 'Use this to turn on your bot💦',
  //   type: 1, 
  //   default_permission: true 
  // },
  // {
  //   name: 'disablebot',
  //   description: 'Use this to turn that bitch off',
  //   type: 1, 
  //   default_permission: true 
  // }
];

  const guildId = '1091629368557699144'; 
  await client.application.commands.set(commandData, guildId);

  // console.log('Command registered!');
});


client.on('interactionCreate', async interaction => {
  const category_Id = process.env.categoryID;
  const ignoredChannelId = '1117530441025593414';

  const channel = await client.channels.fetch(interaction.channel.id);

  if (channel.id === ignoredChannelId) return;
  if (channel.parentId !== category_Id) return;
  if (interaction.isCommand()) {
    if (interaction.commandName === 'updates') {
      const user = interaction.user;
      const botID = Data[user.id].botID;
      const MRID = Data[user.id].MRID;
      const data = await botShow(botID[0]);
      const data2 = await botShow(MRID[0]);
      console.log('botShow data:', data);
      console.log('botShow data2:', data2);
      
      if (data && data2) {
        interaction.reply({ embeds: [createEmbed(data, data2)] });
      } else {
        console.error('Error: Invalid or missing data:', data, data2);
        interaction.reply('Error: Invalid or missing data.');
      }
    } else if (interaction.commandName === 'progress') {
      const user = interaction.user;
      const botID = Data[user.id].botID;
      const MRID = Data[user.id].MRID;
      const data = await botShow(botID[0]);
      const data2 = await botShow(MRID[0]);
      console.log('botShow data:', data);
      console.log('botShow data2:', data2);

      if (data && data2) {
        const embed = createWalletEmbed(user, data, data2, interaction);
        interaction.reply({ embeds: [embed] });
      } else {
        console.error('Error: Invalid or missing data:', data, data2);
        interaction.reply('Error: Invalid or missing data.');
      }
    } 
    else if (interaction.commandName === 'substatus') {
      renewstatus(interaction, interaction.user.id);
    } 
    // else if (interaction.commandName === 'enablebot') {
    //   const user = interaction.user;
    //   const botID = Data[user.id].botID[0];
    //   const initialBotData = await botShow(botID);
    //   console.log('initialBotData:', initialBotData);
      
    //   const response = await botEnable(botID, false);
    //   // console.log('botEnable response:', response);
      
    //   const updatedBotData = await botShow(botID);
    //   console.log('updatedBotData:', updatedBotData);
      
    //   if (response.message) {
    //     interaction.reply(response.message);
    //   } else if (initialBotData && initialBotData.is_enabled) {
    //     interaction.reply('Bot is already enabled.');
    //   } else if (updatedBotData && updatedBotData.is_enabled) {
    //     interaction.reply('Bot has been enabled successfully.');
    //   } else {
    //     interaction.reply('Error: Failed to enable the bot.');
    //   }
    // } 
    // else if (interaction.commandName === 'disablebot') {
    //   const user = interaction.user;
    //   const botID = Data[user.id].botID[0];
    //   const initialBotData = await botShow(botID);
    //   console.log('initialBotData:', initialBotData);
      
    //   const response = await botDisable(botID, true);
    //   console.log('botDisable response:', response);
      
    //   const updatedBotData = await botShow(botID);
    //   console.log('updatedBotData:', updatedBotData);
      
    //   if (response.message) {
    //     interaction.reply(response.message);
    //   } 
    //   else if (initialBotData && !initialBotData.is_enabled) {
    //     interaction.reply('Bot is already disabled.');
    //   } 
    //   else if (updatedBotData && !updatedBotData.is_enabled) {
    //     interaction.reply('Bot has been disabled successfully.');
    //   } 
    //   else {
    //     interaction.reply('Error: Failed to disable the bot.');
    //   }
    // }
  }
});


//  client.on('messageCreate', async (msg) => {
//   // console.log(msg.content);
//   if (msg.author.bot || !msg.content.startsWith('~')) return;
 
//   const category_Id = process.env.categoryID;
//   // console.log('category ID:', category_Id);
//   const channel = await client.channels.fetch(msg.channel.id);
//   // console.log('channel object:', channel);
//   const ignoredChannelId = '1117530441025593414';
//   if (channel.id === ignoredChannelId) return;

//   if (channel.parentId !== category_Id) return;
 
//   if (msg.content === '~updates') {
//     const user = msg.author;
//     const botID = Data[user.id].botID;
//     const MRID = Data[user.id].MRID;
//     const data = await botShow(botID[0]);
//     const data2 = await botShow(MRID[0]);
//     console.log('botShow data:', data);
//     console.log('botShow data2:', data2);
   
    
//       if (data && data2) {
//       msg.channel.send({ embeds: [createEmbed(data, data2)] });
//       } 
//       else {
//       console.error('Error: Invalid or missing data:', data, data2);
//       msg.reply('Error: Invalid or missing data.');
//       }
//       }  
//   else if (msg.content === '~progress') {
//         const user = msg.author;
//         const botID = Data[user.id].botID;
//         const MRID = Data[user.id].MRID;
//         const data = await botShow(botID[0]);
//         const data2 = await botShow(MRID[0]);
//         console.log('botShow data:', data);
//         console.log('botShow data2:', data2);
    
//         if (data && data2) {
//           const embed = createWalletEmbed(user, data, data2, msg);
//           msg.channel.send({ embeds: [embed] });
//         } else {
//           console.error('Error: Invalid or missing data:', data, data2);
//           msg.reply('Error: Invalid or missing data.');
//         }
//   }
  
//   // else if (msg.content === '~manuallyrenew') {
//   //     manualrenewal(msg, msg.author.id);
//   //   }
    
//   // else if (msg.content === '~autorenew') { 
//   //     autorenew(msg, msg.author.id);
//   //   }
    
//   // else if (msg.content === '~disableautorenew') {
//   //      disableautorenew(msg, msg.author.id);
//   //   }

//   else if (msg.content === '~substatus') {
//        renewstatus(msg, msg.author.id);
//     }
  
//     else if (msg.content === '~enablebot') {
//       const user = msg.author;
//       const botID = Data[user.id].botID[0];
//       const initialBotData = await botShow(botID);
//       console.log('initialBotData:', initialBotData);
      
//       const response = await botEnable(botID, false);
//       // console.log('botEnable response:', response);
      
//       const updatedBotData = await botShow(botID);
//       console.log('updatedBotData:', updatedBotData);
      
//       if (response.message) {
//         msg.reply(response.message);
//       } else if (initialBotData && initialBotData.is_enabled) {
//         msg.reply('Bot is already enabled.');
//       } else if (updatedBotData && updatedBotData.is_enabled) {
//         msg.reply('Bot has been enabled successfully.');
//       } else {
//         msg.reply('Error: Failed to enable the bot.');
//       }
//     }
    
//     else if (msg.content === '~disablebot') {
//       const user = msg.author;
//       const botID = Data[user.id].botID[0];
//       const initialBotData = await botShow(botID);
//       console.log('initialBotData:', initialBotData);
      
//       const response = await botDisable(botID, true);
//       console.log('botDisable response:', response);
      
//       const updatedBotData = await botShow(botID);
//       console.log('updatedBotData:', updatedBotData);
      
//       if (response.message) {
//         msg.reply(response.message);
//       } else if (initialBotData && !initialBotData.is_enabled) {
//         msg.reply('Bot is already disabled.');
//       } else if (updatedBotData && !updatedBotData.is_enabled) {
//         msg.reply('Bot has been disabled successfully.');
//       } else {
//         msg.reply('Error: Failed to disable the bot.');
//       }
//     }
    
    
    
      
//   else if (msg.content === '~help') {
//       const embed = {
//         color: 0xB7BF96,
//         title: 'Bot Commands',
//         fields: [
//           {
//             name: '~updates',
//             value: 'Shows the latest updates of the BeyondMatrix bot deals.',
//           },
//           {
//             name: '~progress',
//             value: 'Shows your wallet progress.',
//           },
//           // {
//           //   name: '~manuallyrenew',
//           //   value: 'Manually renew your subscription in one go.',
//           // },
//           // {
//           //   name: '~autorenew',
//           //   value: 'Enable automatic renewal of your subscription within 24hrs.',
//           // },
//           // {
//           //   name: '~disableautorenew',
//           //   value: 'Disable automatic renewal of your subscription.',
//           // },
//           {
//             name: '~substatus',
//             value: 'Check the status of your subscription renewal.',
//           },
//           {
//             name: '~enablebot',
//             value: 'Enable your bot.',
//           },
//           {
//             name: '~disablebot',
//             value: 'Disable your bot.',
//           },
//           {
//             name: '\u200b',
//             value: '\u200b',
//             inline: false,
//           }, 
//         ],
//         timestamp: new Date(),
//       };
    
//       msg.channel.send({ embeds: [embed] });
//     }
    
//   else {
//       msg.reply('Invalid command');
//     }
//   });
  
 
