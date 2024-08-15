import fetch from "node-fetch";
import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let app = express();
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/src/:folder/:file", function (req, res) {
  res.sendFile(`${__dirname}/public/src/${req.params.folder}/${req.params.file}`);
});
app.get("/get_aura/:user", async function (req, res) {
  let response = await fetch(`https://api.photop.live/user?name=${req.params.user}`);
  if (response.status == 200) {
    const data = await response.json();
    const aura = calcAura(data);
    res.send({aura: aura, rank: getRank(aura)});
  } else {
    res.send("Error");
  }
});
var auraCalc = {
  name: function (i) {
    return (2*Math.pow(20-i.length, 1.33));
  },
  roles_num: function (i) {
    if (i == null) {
      return 0;
    }
    if (typeof i == "object") {
      return (25*Math.pow(i.length, 1.5));
    }
    return 25;
  },
  roles_specific: function (i) {
    if (i == null) {
      return 0;
    }
    var roleAuras = {
      Admin: 200,
      Bot: 0,
      "Bug Hunter": 100,
      Contributor: 50,
      Developer: 100,
      Moderator: 150,
      Owner: 300,
      Partner: 85,
      Tester: 60,
      "Trial Moderator": 80,
      Verified: 85
    };
    if (typeof i == "object") {
      var totalToReturn = 0;
      for (var j in i) {
        totalToReturn += (roleAuras[i[j]] != null ? roleAuras[i[j]] : 0);
      }
      return totalToReturn;
    }
    return roleAuras[i];
  },
  creation: function (i) {
    return (Math.sqrt((Date.now()-i)/31536000000)*100);
  },
  pics: function (i) {
    if (i == null) {
      return 0;
    }
    var toReturn = 0;
    toReturn += (i.ProfilePic != null)*10;
    toReturn += (i.ProfileBanner != null)*10;
    return toReturn;
  },
  social: function (i) {
    if (i == null) {
      return 0;
    }
    var toReturn = 0;
    toReturn += Math.pow(Math.sqrt(i.Followers), 1.75);
    toReturn += Math.pow(Math.sqrt(i.Following), 1.3);
    if (i.Followers > i.Following) {
      toReturn *= 1.1;
    }
    if (i.Socials == undefined) {
      return toReturn;
    }
    toReturn += Math.pow(Math.sqrt(Object.keys(i.Socials).length), 3.7066);
    return toReturn;
  },
  url: function (i) {
    if (i == null) {
      return 0;
    }
    return (2.5*Math.pow(20-i.length, 1.33));
  },
  premium: function (i, a) {
    if (i == null) {
      return 0;
    }
    if (i.Expires*1000 > Date.now()) {
      return a*0.1;
    }
    return 0;
  }
}
function calcAura(o) {
  var Aura = 0;
  Aura += auraCalc.name(o.User);
  Aura += auraCalc.roles_num(o.Role);
  Aura += auraCalc.roles_specific(o.Role);
  Aura += auraCalc.creation(o.CreationTime);
  Aura += auraCalc.pics(o.Settings);
  Aura += auraCalc.social(o.ProfileData);
  Aura += auraCalc.url(o.CustomURL);
  Aura += auraCalc.premium(o.Premium, Aura);
  return Math.floor(Aura);
}
var AuraRanks = ["E", "E+", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+"];
for (var Rank = 0; Rank <= 29; Rank++) {
  AuraRanks.push("A" + Rank);
}
for (Rank = 0; Rank <= 9; Rank++) {
  AuraRanks.push("S" + Rank);
}
for (Rank = 0; Rank <= 49; Rank++) {
  AuraRanks.push("∞" + Rank);
}
function getRank(a) {
  var threshold = 0;
  var index = 0;
  while (a > threshold) {
    threshold = threshold*1.1 + 30;
    index++;
  }
  return AuraRanks[index];
}
app.listen(3000);