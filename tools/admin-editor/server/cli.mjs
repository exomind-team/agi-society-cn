import { seedV7 } from "./seed-v7.mjs";
import path from "node:path";
import { ContentStore } from "./store.mjs";
import { createLocalServer } from "./http.mjs";
const [command = "help", rootArg = "./local-editor-data", portArg = "8787"] = process.argv.slice(2);
const reviewWorkflow = command === "serve-review-demo";
const store = new ContentStore(path.resolve(rootArg), { reviewWorkflow });
if (command === "init-v7-fixture") {
  console.log(await seedV7(store));
} else if (command === "init-demo") {
  console.log(await store.initialize({ "content/wiki/editor-demo.md": "# 在线编辑演示\n\n这是演示资料，不是官网正式人物或学术资料。\n\n保存草稿后，比较变化，再保存为正式版本。\n", "content/about/workflow-demo.md": "# 维护流程演示\n\n管理员先编辑文字，图片与排版留到后续阶段。\n" }));
} else if (command === "serve" || reviewWorkflow) {
  await store.list();
  const port = Number(portArg);
  const server = createLocalServer(store, { port, reviewWorkflow });
  server.on("error", (error) => {
    console.error("服务器启动失败：", error.message);
    process.exitCode = 1;
  });
  server.listen(port, "127.0.0.1", () => console.log(reviewWorkflow
    ? `本机审核流程模拟：http://127.0.0.1:${port} （角色仅在页面模拟，不是身份认证，不可公开暴露）`
    : `本机管理员原型：http://127.0.0.1:${port} （无生产身份系统，不可公开暴露）`));
} else {
  console.log("node server/cli.mjs init-v7-fixture [专用数据目录]\nnode server/cli.mjs init-demo [专用数据目录]\nnode server/cli.mjs serve [专用数据目录] [端口，默认 8787]\nnode server/cli.mjs serve-review-demo [已有演示数据目录] [端口]\n仅本机试用；审核演示角色未经认证；不会修改官网、推送 GitHub 或创建登录凭据。");
}
