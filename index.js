// https://pastebin.com/XHCbmy29 - code without autorenew function
// https://pastebin.com/DXhYZyX7 - with autorenew
require('dotenv').config();
const { Client, GatewayIntentBits, WebhookClient, Embed } = require('discord.js');
const fs = require('fs');
const threeCommasAPI = require('3commas-api-node')
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
    color: 0x0079BF, 
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
 
 
const Data = JSON.parse(fs.readFileSync('users.json', 'utf8'));
 
var getSubscriptionDate = (_user_id) => {
  if (Data.hasOwnProperty(_user_id)) {
    return Data[_user_id].subscription_date;
  } else {
    return "User id not found";
  }
};
 
 
const getRemainingDays = (_user_id) => {
  var subscription_date = getSubscriptionDate(_user_id);
  if (subscription_date !== "User id not found") { 
    var parts = subscription_date.split("-");
    var formatted_date = parts[1] + "/" + parts[2] + "/" + parts[0];
    var end_date = new Date(formatted_date); 
    end_date.setDate(end_date.getDate() + 30); 
 
    var now = new Date().getTime();
    var remaining = end_date.getTime() - now;
 
    var days = Math.floor(remaining / (1000 * 60 * 60 * 24));
 
    return days > 0 ? days : 0;
  } else {
    return 0;
  }
}
 
const autoRenew = () => {
  fs.readFile('users.json', 'utf8', (err, userData) => {
    if (err) {
      console.error(err);
      return;
    }
    
    let users = JSON.parse(userData);
    
    for (let id in users) {
      let user = users[id];
      let remainingDays = getRemainingDays(user.subscription_date);

      if (remainingDays <= 0) {
        if (user.renew == 1) {
          user.deposits -= 49;
          let endDate = new Date(user.subscription_date);
          endDate.setMonth(endDate.getMonth() + 1);
          user.subscription_date = endDate.toISOString().slice(0, 10);
          bot.sendMessage(id, "Your subscription has been renewed and $49 has been deducted from your wallet.");
        } else {
          bot.stop(id);
          bot.sendMessage(id, "Your subscription has ended. Thank you for using our service.");
        }
      }
    }

    let newuserData = JSON.stringify(users, null, 2);

    fs.writeFile('users.json', newuserData, (err) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log('User data updated successfully');
    });
  });
}


const getDepositAmount = (_user_id) => {
  if (Data.hasOwnProperty(_user_id)) {
    const deposits = Data[_user_id].deposits;
    const total = deposits.reduce((a, b) => a + b, 0);
    return total;
  } else {
    return 0;
  }
}
 
 
const getTotalPoolBalance = () => {
  let total = 0;
  for (let user_id in Data) {
    total += getDepositAmount(user_id);
  }
  return total;
}
 
 
const createWalletEmbed = (user, data, msg) => {
  if (!user || !data || !msg || typeof user !== 'object' || typeof data !== 'object' || typeof msg !== 'object') {
    throw new Error('Expected three objects.');
  }
 
  var days_left = getRemainingDays(user.id);
  var subscription_date = getSubscriptionDate(user.id);
  var end_date = new Date(subscription_date); 
  end_date.setDate(end_date.getDate() + 30);
  if (days_left < 3) {
    msg.reply('Make sure to renew your subscription if not opted for auto-subscribe, else your services will be stopped!');
  }
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
			value: 'Premium Plan',
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
    if (msg.content === '~updates') {
      const user = msg.author;
      const botID = Data[user.id].botID;
      const data = await botShow(botID[0]);
      console.log('botShow data:', data);
 
      if (data) {
        webhook.send({ embeds: [createEmbed(data)] });
      } else {
        console.error('Error: Invalid or missing data:', data);
        msg.reply('Error: Invalid or missing data.');
      }
    }
 
    else if (msg.content === '~progress') {
      const user = msg.author;
      // console.log('msg:', msg);
      const botID = Data[user.id].botID;
      const data = await botShow(botID[0]);
      console.log('botShow data:', data);
 
      if (data) {
        console.log('user value:', user);
        const embed = createWalletEmbed(user, data, msg);
        webhook.send({ embeds: [embed] });
        //msg.reply(message);
      } else {
        console.error('Error: Invalid or missing data:', data);
        msg.reply('Error: Invalid or missing data.');
      }
    }
 
    else {
      msg.reply('Invalid command');
    }
  }); 
 
client.login(process.env.TOKEN)