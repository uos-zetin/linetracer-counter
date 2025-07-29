import { Actor } from "@/core/models";
import di from "@/container";

import { v4 as uuidv4 } from "uuid";
import * as readline from "readline";

const superAdmin: Actor = {
  id: uuidv4(),
  name: "Temporary Super Admin",
  roles: ["administrator"],
  createdAt: new Date(),
};

function createQuestion(
  prompt: string,
  hideInput: boolean = false
): Promise<string> {
  return new Promise((resolve) => {
    if (hideInput) {
      let input = "";
      process.stdout.write(prompt);

      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding("utf8");

      const onData = (char: string) => {
        switch (char) {
          case "\n":
          case "\r":
          case "\u0004": // EOF
            stdin.setRawMode(false);
            stdin.pause();
            stdin.removeListener("data", onData);
            console.log();
            resolve(input);
            break;
          case "\u0003": // Ctrl + C
            process.exit();
            break;
          case "\u007f": // Backspace
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write("\b \b");
            }
            break;
          default: // Normal Input
            input += char;
            process.stdout.write("*");
            break;
        }
      };

      stdin.on("data", onData);
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

async function main() {
  await di.initialize();

  console.log("┌──────────────────────────────┐");
  console.log("│  Create Super Administrator  │");
  console.log("└──────────────────────────────┘");

  const name = await createQuestion("Name: ");
  if (!name) throw new Error("Name is required");
  const id = await createQuestion("Username: ");
  if (!id) throw new Error("Username is required");
  const pw = await createQuestion("Password: ", true);
  if (!pw) throw new Error("Password is required");

  const actor = await di.services.actor.registerWithIdPw(name, id, pw);
  await di.services.actor.setActorRoles(superAdmin, actor.id, [
    "administrator",
  ]);

  console.log(`\nCreated: ${name} (${id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
