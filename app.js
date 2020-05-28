// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const Datastore = require("nedb"), //(require in the database)
  // Security note: the database is saved to the file `datafile` on the local filesystem. It's deliberately placed in the `.data` directory
  // which doesn't get copied if someone remixes the project.
  db = new Datastore({ filename: ".data/datafile", autoload: true }); //initialize the database

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command("/devbot", async ({ ack, payload, context }) => {
  await ack();
  try {
    clearDatabase();
    let idvar = payload.text;
    idvar = idvar.replace("deploy ", "");
    const result = app.client.chat.postMessage({
      token: context.botToken,
      channel: payload.channel_id,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Ready to Deploy Application with id " + idvar + "*"
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              "Do you want to deploy the application with id *_" + idvar + "_*?"
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Cancel"
              },
              style: "danger",
              value: "canceldeploy",
              action_id: "canceldeploy"
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Yes"
              },
              style: "primary",
              value: idvar,
              action_id: "yesdeploy"
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.log(error);
  }
});

app.action("yesdeploy", async ({ ack, body, context }) => {
  await ack();
  try {
    let uservar = "<@" + body.user.id + ">";
    let idvar = body.actions[0].value;
    let obj = require("./json/deploy-blocks.json");
    JSON.stringify(obj);
    let objnew = JSON.stringify(obj).replace(/IDVAR/g, idvar);
    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " " + time;
    objnew = objnew.replace("TIMESTAMP", dateTime);
    objnew = objnew.replace("USER", uservar);
    const result = app.client.chat.update({
      token: context.botToken,
      ts: body.message.ts,
      channel: body.channel.id,
      blocks: objnew
    });
    let storageObj = { name: "storageObj" };
    storageObj.storedblocks = JSON.parse(objnew);
    let storageObj2 = await nextLine(
      storageObj,
      "\n :large_blue_circle:  3. Executing PullRequest",
      false,
      body.message.ts,
      body.channel.id,
      1000
    );
    await db.insert(storageObj2, (err, newDoc) => {
      if (err) console.log("There's a problem with the database: ", err);
      else if (newDoc) console.log("storageObj insert completed");
    });
    setTimeout(() => {
      storageObj2.storedblocks[2].text.text = "Choose an approved PR";
      const prSelector = require("./json/PR-selector");
      storageObj2.storedblocks.push(prSelector);
      const result2 = app.client.chat.update({
        token: context.botToken,
        ts: body.message.ts,
        channel: body.channel.id,
        blocks: storageObj2.storedblocks
      });
    }, 2000);
  } catch (error) {
    console.log(error);
  }
});

app.action("prchosen", async ({ ack, body, context }) => {
  await ack();
  try {
    let storedObj = await queryOne({ name: "storageObj" });
    storedObj.storedblocks[0].text.text =
      storedObj.storedblocks[0].text.text +
      "\n *Release Notes:* <jira.com|ACME-6157> add new Phoenix functionality <github.com|(PR #1593)>";
    storedObj = nextLine(
      storedObj,
      "\n :large_blue_circle:  4. Choosing ChoosePullRequest choice 1593",
      false,
      body.message.ts,
      body.channel.id,
      200
    );
    let storedObj2 = nextLine(
      storedObj,
      "\n :large_blue_circle:  5. Executing CloneRepo",
      false,
      body.message.ts,
      body.channel.id,
      1000
    );
    let storedObj3 = nextLine(
      storedObj2,
      "\n :large_blue_circle:  6. Created git repo: /tmp/ACMEDevBot-1f031139-89eb-4dd8-9f21-dd8bae8d88f74543252932594198521/.git",
      false,
      body.message.ts,
      body.channel.id,
      1200
    );
    let storedObj4 = nextLine(
      storedObj3,
      "\n :large_blue_circle:  7. Executing ACMEDevBot",
      true,
      body.message.ts,
      body.channel.id,
      1500
    );
    let storedObj5 = nextLine(
      storedObj4,
      "\n :large_blue_circle:  8. Set git author to ACMEDevBot <ACMEDevBot@acmeenterprises.com>",
      true,
      body.message.ts,
      body.channel.id,
      2300
    );
    let storedObj6 = nextLine(
      storedObj5,
      "\n :large_blue_circle:  9. Executing CheckoutPullRequest",
      true,
      body.message.ts,
      body.channel.id,
      2800
    );
    let storedObj7 = nextLine(
      storedObj6,
      "\n :large_blue_circle:  10. Checkout pull request refs/heads/ACME-6157",
      true,
      body.message.ts,
      body.channel.id,
      3300
    );
    let storedObj8 = nextLine(
      storedObj7,
      "\n :large_blue_circle:  11. Executing CheckoutReleaseBranch",
      true,
      body.message.ts,
      body.channel.id,
      3800
    );
    let storedObj9 = nextLine(
      storedObj8,
      "\n :large_blue_circle:  12. Checkout release branch refs/heads/ACMEDevBot-1f031139-89eb-4dd8-9f21-dd8bae8d88f7",
      true,
      body.message.ts,
      body.channel.id,
      4200
    );
    let storedObj10 = nextLine(
      storedObj9,
      "\n :large_blue_circle:  13. Executing PullRequestChanges",
      true,
      body.message.ts,
      body.channel.id,
      4800
    );
    setTimeout(() => {
      db.update(
        { name: "storageObj" },
        storedObj10,
        {},
        (err, numReplaced, affectedDocuments) => {
          if (err) console.log("There's a problem with the database: ", err);
          else if (numReplaced) console.log("storedObj10 written to database");
        }
      );
    }, 4900);
    setTimeout(() => {
      let uservar = "<@" + body.user.id + ">";
      let releasebuttons = require("./json/confirm-release-buttons");
      storedObj10.storedblocks.push(releasebuttons);
      let storedObj11 = replaceBody(
        storedObj10,
        "Confirm release of ACME-6157 add new Phoenix functionality\n\nCommits:\n" +
          uservar +
          " - ACME-6157 add new Phoenix functionality\n\nDiff:\nMOD src/Workflow/WorkflowLibrary/WorkflowLibrary.js",
        body.message.ts,
        body.channel.id,
        500
      );
    }, 5500);
  } catch (error) {
    console.error(error);
  }
});

//listener for yes button on confirm release
app.action("confirmrelease", async ({ ack, body, context }) => {
  await ack();
  try {
    let storedObj = await queryOne({ name: "storageObj" });
    let storedObj2 = nextLine(
      storedObj,
      "\n :large_blue_circle:  14. Choosing Confirm choice 1",
      true,
      body.message.ts,
      body.channel.id,
      500
    );
    let storedObj3 = nextLine(
      storedObj2,
      "\n :large_blue_circle:  15. Executing MergePullRequest",
      true,
      body.message.ts,
      body.channel.id,
      1000
    );
    let storedObj4 = nextLine(
      storedObj3,
      "\n :large_blue_circle:  16. Merged PullRequest refs/heads/ACME-6157 into refs/heads/ACMEDevBot-1f031139-89eb-4dd8-9f21-dd8bae8d88f7",
      true,
      body.message.ts,
      body.channel.id,
      1500
    );
    let storedObj5 = nextLine(
      storedObj4,
      "\n :large_blue_circle:  17. Executing BumpPackageVersion",
      true,
      body.message.ts,
      body.channel.id,
      2000
    );
    let storedObj6 = nextLine(
      storedObj5,
      "\n :large_blue_circle:  18. Executing PushReleaseBranch",
      true,
      body.message.ts,
      body.channel.id,
      2500
    );
    let storedObj7 = nextLine(
      storedObj6,
      "\n :large_blue_circle:  19. Pushed Release Branch refs/heads/ACMEDevBot-1f031139-89eb-4dd8-9f21-dd8bae8d88f7 to origin",
      true,
      body.message.ts,
      body.channel.id,
      3000
    );
    let storedObj8 = nextLine(
      storedObj7,
      "\n :large_blue_circle:  20. Executing CircleBuild",
      true,
      body.message.ts,
      body.channel.id,
      3500
    );
    let storedObj9 = nextLine(
      storedObj8,
      "\n :large_blue_circle:  21. Build has not started",
      true,
      body.message.ts,
      body.channel.id,
      4000
    );
    setTimeout(async () => {
      storedObj9.storedblocks.push({
        type: "divider"
      });
      storedObj9.storedblocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":loading:  *Waiting for CircleBuild*  :loading:"
        }
      });
      const result = await app.client.chat.update({
        token: process.env.SLACK_BOT_TOKEN,
        ts: body.message.ts,
        channel: body.channel.id,
        blocks: storedObj9.storedblocks
      });
    }, 4800);
    let storedObj10 = nextLine(
      storedObj9,
      "\n :large_blue_circle:  22. Executing CircleBuild",
      true,
      body.message.ts,
      body.channel.id,
      8800
    );
    setTimeout(() => {
      db.update(
        { name: "storageObj" },
        storedObj10,
        {},
        (err, numReplaced, affectedDocuments) => {
          if (err) console.log("There's a problem with the database: ", err);
          else if (numReplaced) console.log("storedObj10 written to database");
        }
      );
    }, 8800);
    
    setTimeout(async () => {
      storedObj10.storedblocks[4].text.text =
        ":circleci: CircleCI Build <circleci.com|#8281> :circleci: - Not Started\n:loading:  *Waiting for CircleBuild*  :loading:";
      const result = await app.client.chat.update({
        token: process.env.SLACK_BOT_TOKEN,
        ts: body.message.ts,
        channel: body.channel.id,
        blocks: storedObj10.storedblocks
      });
    }, 8900);
    for (let i = 1; i < 8; i++) {
      storedObj10 = await circleTimer(
        storedObj10,
        i*5,
        true,
        body.message.ts,
        body.channel.id,
        8900+(i*5000)
      );
    };
    setTimeout(() => {
      storedObj10.storedblocks[2].text.text = "Deploy to QA?";
      const deployqa = require("./json/deploy-qa");
      storedObj10.storedblocks.pop();
      storedObj10.storedblocks.pop();
      storedObj10.storedblocks.push(deployqa);
      const result2 = app.client.chat.update({
        token: context.botToken,
        ts: body.message.ts,
        channel: body.channel.id,
        blocks: storedObj10.storedblocks
      });
    }, 44000);
  } catch (error) {
    console.error(error);
  }
});

//listener for yes button on deploy to qa
app.action("deployqa", async ({ ack, body, context }) => {
  await ack();
  try {
    let storedObj = await queryOne({ name: "storageObj" });
    storedObj.storedblocks.pop();
    storedObj.storedblocks.pop();
    let storedObj2 = nextLine(
      storedObj,
      "\n :large_blue_circle:  24. Executing DownloadUIArtifact",
      true,
      body.message.ts,
      body.channel.id,
      500
    );
    let storedObj3 = nextLine(
      storedObj2,
      "\n :large_blue_circle:  25. Downloaded Artifact for 8281",
      true,
      body.message.ts,
      body.channel.id,
      1000
    );
    let storedObj4 = nextLine(
      storedObj3,
      "\n :large_blue_circle:  26. Executing ExtractFiles",
      true,
      body.message.ts,
      body.channel.id,
      1500
    );
    let storedObj5 = nextLine(
      storedObj4,
      "\n :large_blue_circle:  27. Unziped Files to /tmp/ACMEDevBot--1f031139-89eb-4dd8-9f21-dd8bae8d88f7-deploy3478279416825419021",
      true,
      body.message.ts,
      body.channel.id,
      2000
    );
    let storedObj6 = nextLine(
      storedObj5,
      "\n :large_blue_circle:  28. Choosing Confirm choice 1",
      true,
      body.message.ts,
      body.channel.id,
      2500
    );
    let storedObj7 = nextLine(
      storedObj6,
      "\n :large_blue_circle:  29. Executing SyncFilesToS3",
      true,
      body.message.ts,
      body.channel.id,
      3000
    );
    let storedObj8 = nextLine(
      storedObj7,
      "\n :large_blue_circle:  30. Synching directory /tmp/ACMEDevBot--1f031139-89eb-4dd8-9f21-dd8bae8d88f7-deploy3478279416825419021 to S3 Bucket\nstatic.qa.acmeenterprises.com",
      true,
      body.message.ts,
      body.channel.id,
      3500
    );
    setTimeout(() => {
      db.update(
        { name: "storageObj" },
        storedObj8,
        {},
        (err, numReplaced, affectedDocuments) => {
          if (err) console.log("There's a problem with the database: ", err);
          else if (numReplaced) console.log("storedObj8 written to database");
        }
      );
    }, 3600);
    setTimeout(() => {
      storedObj8.storedblocks[2].text.text = "Deploy to Prod?";
      const deployprod = require("./json/deploy-prod");
      storedObj8.storedblocks.push(deployprod);
      const result2 = app.client.chat.update({
        token: context.botToken,
        ts: body.message.ts,
        channel: body.channel.id,
        blocks: storedObj8.storedblocks
      });
    }, 4500);
  }catch(error){
    console.error(error);
  }
});

//append to the end of body section of storedBlocks
function nextLine(storedObj, appendage, deletetop, ts, channel, timeout) {
  setTimeout(async () => {
    storedObj.storedblocks[2].text.text = storedObj.storedblocks[2].text.text.replace(
      ":large_blue_circle:",
      ":white_check_mark:"
    );
    storedObj.storedblocks[2].text.text =
      storedObj.storedblocks[2].text.text + appendage;
    let lineIndex = storedObj.storedblocks[2].text.text.search("\n");
    if (deletetop) {
      storedObj.storedblocks[2].text.text = storedObj.storedblocks[2].text.text.substring(
        lineIndex + 1
      );
    }
    const result = await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      ts: ts,
      channel: channel,
      blocks: storedObj.storedblocks
    });
  }, timeout);
  return storedObj;
}

//advance CircleCI timer by 0:05
function circleTimer(storedObj, time, deletetop, ts, channel, timeout) {
  setTimeout(async () => {
    storedObj.storedblocks[4].text.text =
      ":circleci: CircleCI Build <circleci.com|#8281> :circleci: - Running for 00:" +
      time +
      "\n:loading:  *Waiting for CircleBuild*  :loading:";
    const result = await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      ts: ts,
      channel: channel,
      blocks: storedObj.storedblocks
    });
  }, timeout);
  return storedObj;
}

//replace the body section of storedBlocks
function replaceBody(storedObj, newBody, ts, channel, timeout) {
  setTimeout(async () => {
    storedObj.storedblocks[2].text.text = newBody;
    const result = await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      ts: ts,
      channel: channel,
      blocks: storedObj.storedblocks
    });
  }, timeout);
  return storedObj;
}

//look up any one document from a query string
function queryOne(query) {
  return new Promise((resolve, reject) => {
    db.findOne(query, (err, docs) => {
      if (err) console.log("There's a problem with the database: ", err);
      else if (docs) console.log(query + " queryOne run successfully.");
      resolve(docs);
    });
  });
}

//print the whole database (for testing)
function printDatabase() {
  db.find({}, (err, data) => {
    if (err) console.log("There's a problem with the database: ", err);
    else if (data) console.log(data);
  });
}

//clear out the database
function clearDatabase() {
  db.remove({}, { multi: true }, function(err) {
    if (err) console.log("There's a problem with the database: ", err);
    else console.log("database cleared");
  });
}
(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  //printDatabase();
  console.log("⚡️ Bolt app is running!");
})();
