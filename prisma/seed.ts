import { db as prisma } from "../src/lib/db";
import bcryptjs from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.evaluationResult.deleteMany({});
  await prisma.evaluationRun.deleteMany({});
  await prisma.testCase.deleteMany({});
  await prisma.promptVersion.deleteMany({});
  await prisma.prompt.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Demo User
  const hashedPassword = bcryptjs.hashSync("demo1234", 12);
  const user = await prisma.user.create({
    data: {
      id: "demo-user-id",
      email: "demo@demo.com",
      password: hashedPassword,
      name: "Prasun Anand",
      role: "owner",
    },
  });
  console.log("Seeded User:", user.email);

  // 2. Create Demo Project
  const project = await prisma.project.create({
    data: {
      id: "demo-project-id",
      name: "AI Support Workspace",
      description: "Prompt optimization for customer service bots & auto-responders",
      ownerId: user.id,
    },
  });
  console.log("Seeded Project:", project.name);

  // 3. Create Demo Prompt
  const prompt = await prisma.prompt.create({
    data: {
      id: "demo-prompt-id",
      name: "Support Email Responder",
      description: "Generates custom support replies with client branding, constraints, and variable insertion",
      projectId: project.id,
    },
  });
  console.log("Seeded Prompt:", prompt.name);

  // 4. Create Prompt Versions
  const v1 = await prisma.promptVersion.create({
    data: {
      id: "prompt-v1-id",
      versionNumber: 1,
      templateText: "You are a customer support agent. Answer the following client email:\n\n{{email_content}}",
      variables: JSON.stringify(["email_content"]),
      commitMessage: "Initial baseline prompt structure",
      createdById: user.id,
      promptId: prompt.id,
    },
  });

  const v2 = await prisma.promptVersion.create({
    data: {
      id: "prompt-v2-id",
      versionNumber: 2,
      templateText: "You are a polite, helpful customer support agent at DesignHero. Write a short support response. Add a signature 'DesignHero Support Team'.\n\nClient email:\n{{email_content}}",
      variables: JSON.stringify(["email_content"]),
      commitMessage: "Added signature and company branding guidelines",
      createdById: user.id,
      promptId: prompt.id,
    },
  });

  const v3 = await prisma.promptVersion.create({
    data: {
      id: "prompt-v3-id",
      versionNumber: 3,
      templateText: "You are a professional, empathetic customer support agent at DesignHero. Follow these rules:\n1. Keep response under 150 words.\n2. Start with 'Hi {{customer_name}},'.\n3. Suggest a solution to the client's problem: {{email_content}}.\n4. Close with a polite greeting and sign off as 'DesignHero Support Team'.\n\nDraft response inside <response> tags.",
      variables: JSON.stringify(["customer_name", "email_content"]),
      commitMessage: "Strict structure with XML tags, customer name parameter, and word constraint limits",
      createdById: user.id,
      promptId: prompt.id,
    },
  });
  console.log("Seeded Prompt Versions v1, v2, v3");

  // 5. Create Test Cases
  const tc1 = await prisma.testCase.create({
    data: {
      id: "test-case-1",
      name: "Subscription Billing Charge",
      variables: JSON.stringify({
        customer_name: "Sarah",
        email_content: "I was charged twice for my subscription this month. Can you please check and refund the second charge?",
      }),
      expectedOutput: "A polite refund confirmation with reassurance of processing timelines (3-5 days).",
      projectId: project.id,
    },
  });

  const tc2 = await prisma.testCase.create({
    data: {
      id: "test-case-2",
      name: "Dashboard Login Bug",
      variables: JSON.stringify({
        customer_name: "Michael",
        email_content: "Whenever I try to log in, I get a blank screen. I have tried clearing my cache but it still doesn't work.",
      }),
      expectedOutput: "Clear troubleshooting instructions (cache, cookies, browser compatibility) and request for console logs.",
      projectId: project.id,
    },
  });

  const tc3 = await prisma.testCase.create({
    data: {
      id: "test-case-3",
      name: "Export to CSV Feature Request",
      variables: JSON.stringify({
        customer_name: "Elena",
        email_content: "Do you support exporting metrics dashboards to CSV? If not, is this feature on your roadmap?",
      }),
      expectedOutput: "Acknowledgment of the feature request, confirmation that CSV export is indeed on the roadmap, and instructions on how to use it once deployed.",
      projectId: project.id,
    },
  });
  console.log("Seeded Test Cases");

  // 6. Create Evaluation Runs and Results
  // V1 Eval Run
  const run1 = await prisma.evaluationRun.create({
    data: {
      id: "eval-run-v1",
      name: "V1 Run - Baseline",
      status: "COMPLETED",
      promptVersionId: v1.id,
    },
  });

  await prisma.evaluationResult.create({
    data: {
      evaluationRunId: run1.id,
      testCaseId: tc1.id,
      output: "Hello Sarah, I will look into your double charge and refund it right away. Thank you, Support.",
      latencyMs: 780,
      inputTokens: 25,
      outputTokens: 28,
      cost: 0.0001,
      scores: JSON.stringify({ Relevance: 0.6, Accuracy: 0.7, Readability: 0.5, CoreScores: 0.6 }),
      status: "SUCCESS",
    },
  });

  await prisma.evaluationResult.create({
    data: {
      evaluationRunId: run1.id,
      testCaseId: tc2.id,
      output: "Hello Michael, Sorry about the blank screen. Please try another browser. Support.",
      latencyMs: 690,
      inputTokens: 27,
      outputTokens: 18,
      cost: 0.00008,
      scores: JSON.stringify({ Relevance: 0.5, Accuracy: 0.4, Readability: 0.5, CoreScores: 0.45 }),
      status: "SUCCESS",
    },
  });

  await prisma.evaluationResult.create({
    data: {
      evaluationRunId: run1.id,
      testCaseId: tc3.id,
      output: "Hello Elena, No we don't have CSV exports yet, but it is on the roadmap. Thanks.",
      latencyMs: 820,
      inputTokens: 21,
      outputTokens: 22,
      cost: 0.00009,
      scores: JSON.stringify({ Relevance: 0.75, Accuracy: 0.7, Readability: 0.6, CoreScores: 0.71 }),
      status: "SUCCESS",
    },
  });

  // V2 Eval Run
  const run2 = await prisma.evaluationRun.create({
    data: {
      id: "eval-run-v2",
      name: "V2 Run - Branding Guidelines",
      status: "COMPLETED",
      promptVersionId: v2.id,
    },
  });

  await prisma.evaluationResult.create({
    data: {
      evaluationRunId: run2.id,
      testCaseId: tc1.id,
      output: "Hi Sarah,\n\nWe apologize for the double subscription charge on your account. I have investigated and issued a refund for the extra invoice. It will take 3-5 business days to post to your bank.\n\nBest regards,\nDesignHero Support Team",
      latencyMs: 980,
      inputTokens: 42,
      outputTokens: 52,
      cost: 0.00021,
      scores: JSON.stringify({ Relevance: 0.88, Accuracy: 0.85, Readability: 0.8, CoreScores: 0.84 }),
      status: "SUCCESS",
    },
  });

  await prisma.evaluationResult.create({
    data: {
      evaluationRunId: run2.id,
      testCaseId: tc2.id,
      output: "Hi Michael,\n\nI am sorry you are experiencing a blank screen when logging in. This is usually due to a browser cache problem. Please try clearing your cache, opening an incognito tab, or testing on another browser.\n\nBest regards,\nDesignHero Support Team",
      latencyMs: 1120,
      inputTokens: 44,
      outputTokens: 58,
      cost: 0.00024,
      scores: JSON.stringify({ Relevance: 0.8, Accuracy: 0.75, Readability: 0.78, CoreScores: 0.77 }),
      status: "SUCCESS",
    },
  });

  await prisma.evaluationResult.create({
    data: {
      evaluationRunId: run2.id,
      testCaseId: tc3.id,
      output: "Hi Elena,\n\nThank you for checking! Currently, we do not support exporting dashboards directly to CSV, but this is a priority feature on our active roadmap for Q3. We will notify you once it goes live.\n\nBest regards,\nDesignHero Support Team",
      latencyMs: 1040,
      inputTokens: 38,
      outputTokens: 54,
      cost: 0.00021,
      scores: JSON.stringify({ Relevance: 0.9, Accuracy: 0.9, Readability: 0.85, CoreScores: 0.88 }),
      status: "SUCCESS",
    },
  });

  // V3 Eval Run
  const run3 = await prisma.evaluationRun.create({
    data: {
      id: "eval-run-v3",
      name: "V3 Run - Constraint Optimizations",
      status: "COMPLETED",
      promptVersionId: v3.id,
    },
  });

  await prisma.evaluationResult.create({
    data: {
      evaluationRunId: run3.id,
      testCaseId: tc1.id,
      output: "<response>\nHi Sarah,\n\nI understand you were charged twice for your subscription this month. I sincerely apologize for the error. I have processed a refund for the second transaction, which will show in your account in 3 to 5 business days.\n\nPlease let me know if you have other questions!\n\nBest regards,\nDesignHero Support Team\n</response>",
      latencyMs: 1350,
      inputTokens: 78,
      outputTokens: 75,
      cost: 0.00035,
      scores: JSON.stringify({ Relevance: 0.98, Accuracy: 0.96, Readability: 0.94, CoreScores: 0.96 }),
      status: "SUCCESS",
    },
  });

  await prisma.evaluationResult.create({
    data: {
      evaluationRunId: run3.id,
      testCaseId: tc2.id,
      output: "<response>\nHi Michael,\n\nI am sorry to hear you are hitting a blank screen during login. Since cache clearing did not work, please try:\n1. Open an incognito browser tab.\n2. Ensure your browser is fully updated.\n3. Send us a screenshot of your browser console log (F12) if the issue persists so our engineers can inspect it.\n\nBest regards,\nDesignHero Support Team\n</response>",
      latencyMs: 1420,
      inputTokens: 80,
      outputTokens: 88,
      cost: 0.00039,
      scores: JSON.stringify({ Relevance: 0.95, Accuracy: 0.94, Readability: 0.96, CoreScores: 0.95 }),
      status: "SUCCESS",
    },
  });

  await prisma.evaluationResult.create({
    data: {
      evaluationRunId: run3.id,
      testCaseId: tc3.id,
      output: "<response>\nHi Elena,\n\nThank you for reaching out! Direct CSV export of metrics dashboards is not supported today, but it is one of our most requested features and is currently scheduled on our roadmap for release next month. I will keep your ticket open and update you the moment it is live.\n\nBest regards,\nDesignHero Support Team\n</response>",
      latencyMs: 1290,
      inputTokens: 74,
      outputTokens: 82,
      cost: 0.00036,
      scores: JSON.stringify({ Relevance: 0.98, Accuracy: 0.98, Readability: 0.95, CoreScores: 0.97 }),
      status: "SUCCESS",
    },
  });

  console.log("Seeded Evaluation Runs & Results successfully!");
  console.log("Seed complete! Run: demo@demo.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
