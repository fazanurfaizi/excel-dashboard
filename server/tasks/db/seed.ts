export default defineTask({
  meta: {
    name: "db:seed",
    description: "Run database seeds",
  },
  run({ payload, context }) {
    console.log("Running DB seed task...");
    return { result: "Success" };
  },
});
