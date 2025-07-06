import { Actor } from "@/core/models";
import di from "@/container";

import { v4 as uuidv4 } from "uuid";
import readlineSync from "readline-sync";

const superAdmin: Actor = {
  id: uuidv4(),
  name: "Temporary Super Admin",
  roles: ["administrator"],
  createdAt: new Date(),
};

async function main() {
  await di.initialize();

  console.log("┌─────────────────────────────┐");
  console.log("│ 🪄 관리자 액터를 생성합니다. │");
  console.log("└─────────────────────────────┘");

  const name = readlineSync.question("이름: ");
  if (!name) throw new Error("이름은 필수 입력입니다.");
  const id = readlineSync.question("ID: ");
  if (!id) throw new Error("ID는 필수 입력입니다.");
  const pw = readlineSync.question("PW: ", { hideEchoBack: true });
  if (!pw) throw new Error("PW는 필수 입력입니다.");

  const actor = await di.services.actor.registerWithIdPw(name, id, pw);
  await di.services.actor.setActorRoles(superAdmin, actor.id, [
    "administrator",
  ]);

  console.log(`\n✨ 등록 완료: ${name} (${id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
