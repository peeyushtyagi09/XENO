const mongoose = require("mongoose");
const { connectDB } = require("./src/database/db");
const Customer = require("./src/models/Customer.model");
const Segment = require("./src/models/Segment.model");
const Campaign = require("./src/models/Campaign.model");
const CommunicationLog = require("./src/models/Communication_Log.model");

// Mock Gemini if GEMINI_API_KEY is not defined in environment
const geminiService = require("./src/services/gemini.service");

const isRealGemini = !!process.env.GEMINI_API_KEY;

if (!isRealGemini) {
  console.log("⚠️ No GEMINI_API_KEY found. Mocking Gemini API calls for testing...");

  const mockGenerateContent = async (prompt) => {
    let text = "";
    
    // Normalize prompt to handle line breaks and spaces
    const normalizedPrompt = prompt.replace(/\s+/g, " ");

    if (normalizedPrompt.includes("Senior CRM Segmentation Expert")) {
      text = JSON.stringify({
        segmentName: "High Value Delhi Customers",
        filters: {
          minSpent: 10000,
          city: "Delhi",
          minOrders: 2
        }
      });
    } else if (normalizedPrompt.includes("AI Marketing Copilot for a CRM platform")) {
      if (normalizedPrompt.includes("spent more than 5000")) {
        text = JSON.stringify({
          intent: "create_segment",
          confidence: 0.95,
          parameters: {
            query: "spent more than 5000",
            goal: null,
            campaignName: null
          }
        });
      } else if (normalizedPrompt.includes("bring back inactive users")) {
        text = JSON.stringify({
          intent: "create_campaign",
          confidence: 0.98,
          parameters: {
            query: null,
            goal: "bring back inactive users",
            campaignName: null
          }
        });
      } else if (normalizedPrompt.includes("Summer Promo")) {
        text = JSON.stringify({
          intent: "analyze_campaign",
          confidence: 0.92,
          parameters: {
            query: null,
            goal: null,
            campaignName: "Summer Promo"
          }
        });
      } else {
        // Fallback copilot classification
        text = JSON.stringify({
          intent: "create_segment",
          confidence: 0.90,
          parameters: {
            query: "spent more than 5000",
            goal: null,
            campaignName: null
          }
        });
      }
    } else if (normalizedPrompt.includes("senior CRM marketing strategist")) {
      text = JSON.stringify({
        campaignName: "Win-back Campaign",
        audience: "Inactive customers",
        channel: "Email",
        message: "Hey {{name}}, we miss you! Come back for 20% off.",
        reasoning: "Inactive customers respond well to email win-backs."
      });
    } else if (normalizedPrompt.includes("senior CRM marketing consultant")) {
      text = JSON.stringify({
        summary: "Campaign performed reasonably well.",
        strengths: ["Strong delivery rate"],
        issues: ["Low open rate"],
        recommendations: ["Target active segment"],
        nextCampaignIdea: "Follow up with WhatsApp"
      });
    } else {
      // Default fallback
      text = JSON.stringify({ success: true });
    }

    return {
      response: {
        text: () => text
      }
    };
  };

  // Mutate genAI export
  geminiService.genAI = {
    getGenerativeModel: () => {
      return {
        generateContent: mockGenerateContent
      };
    }
  };
} else {
  console.log("✅ GEMINI_API_KEY is defined. Using real Gemini API...");
}

// Require services after overriding/mocking genAI
const aiSegmentService = require("./src/services/aiSegment.service");
const aiCopilotService = require("./src/services/aiCopilot.service");

async function runTests() {
  let tempSegmentId = null;
  let tempCampaignId = null;
  const createdSegmentIds = [];
  const createdCampaignIds = [];
  const createdLogIds = [];

  try {
    // 1. Connect to Database
    await connectDB();
    console.log("Connected to MongoDB for testing.");

    // Ensure we have some customers for testing audience estimation
    const customerCount = await Customer.countDocuments();
    console.log(`Current Customer count in DB: ${customerCount}`);
    if (customerCount === 0) {
      console.log("No customers found! Please run 'node seed.js' first.");
      process.exit(1);
    }

    // 2. Test estimateAudienceCount
    console.log("\n🧪 Testing estimateAudienceCount with minSpent and city...");
    const countSpentCity = await aiSegmentService.estimateAudienceCount({
      minSpent: 5000,
      city: "Delhi"
    });
    console.log(`Audience count for spent >= 5000 in Delhi: ${countSpentCity}`);

    console.log("🧪 Testing estimateAudienceCount with minOrders...");
    const countMinOrders = await aiSegmentService.estimateAudienceCount({
      minOrders: 2
    });
    console.log(`Audience count for minOrders >= 2: ${countMinOrders}`);

    console.log("🧪 Testing estimateAudienceCount with inactiveDays...");
    const countInactive = await aiSegmentService.estimateAudienceCount({
      inactiveDays: 30
    });
    console.log(`Audience count for inactiveDays >= 30: ${countInactive}`);

    // 3. Test AI Segment Builder
    console.log("\n🧪 Testing createSegmentFromQuery...");
    const segmentResult = await aiSegmentService.createSegmentFromQuery(
      "Find high-value customers from Delhi"
    );
    console.log("Segment creation result:", segmentResult);
    if (segmentResult && segmentResult.segmentId) {
      createdSegmentIds.push(segmentResult.segmentId);
      tempSegmentId = segmentResult.segmentId;
    } else {
      throw new Error("Failed to create segment from query");
    }

    // 4. Test AI Copilot - Intent: create_segment
    console.log("\n🧪 Testing AI Copilot: intent = create_segment...");
    const copilotSegmentResult = await aiCopilotService.processCopilotMessage(
      "Find customers who spent more than 5000"
    );
    console.log("Copilot segment result:", copilotSegmentResult);
    if (copilotSegmentResult.result && copilotSegmentResult.result.segmentId) {
      createdSegmentIds.push(copilotSegmentResult.result.segmentId);
    }

    // 5. Test AI Copilot - Intent: create_campaign
    console.log("\n🧪 Testing AI Copilot: intent = create_campaign...");
    const copilotCampaignResult = await aiCopilotService.processCopilotMessage(
      "Create a campaign to bring back inactive users"
    );
    console.log("Copilot campaign result:", copilotCampaignResult);

    // 6. Test AI Copilot - Intent: analyze_campaign
    console.log("\n🧪 Testing AI Copilot: intent = analyze_campaign...");
    
    // Create a dummy campaign in DB for name resolution
    const testSegment = await Segment.create({
      segmentName: "Test Segment for Copilot Analysis",
      description: "Segment for testing",
      criteria: { minSpent: 5000 },
      isActive: true
    });
    createdSegmentIds.push(testSegment._id.toString());

    const testCampaign = await Campaign.create({
      name: "Summer Promo Campaign 2026",
      segmentId: testSegment._id,
      channel: "Email",
      message: "Get 15% off using promo code SUMMER15!",
      status: "Completed",
      audienceCount: 10,
      isDeleted: false
    });
    tempCampaignId = testCampaign._id.toString();
    createdCampaignIds.push(tempCampaignId);

    // Get a couple customer IDs to link communication logs
    const someCustomers = await Customer.find().limit(3);
    for (const cust of someCustomers) {
      const log = await CommunicationLog.create({
        campaignId: testCampaign._id,
        customerId: cust._id,
        status: "delivered",
        channel: "email",
        sentAt: new Date(),
        deliveredAt: new Date()
      });
      createdLogIds.push(log._id.toString());
    }

    const copilotAnalyzeResult = await aiCopilotService.processCopilotMessage(
      "Analyze the Summer Promo campaign"
    );
    console.log("Copilot analyze result:", copilotAnalyzeResult);

    console.log("\n🎉 All tests executed successfully!");

  } catch (error) {
    console.error("\n❌ Test execution failed:", error);
    process.exitCode = 1;
  } finally {
    // Clean up created entities
    console.log("\n🧹 Cleaning up test database records...");
    if (createdLogIds.length > 0) {
      await CommunicationLog.deleteMany({ _id: { $in: createdLogIds } });
      console.log(`Deleted ${createdLogIds.length} test communication logs.`);
    }
    if (createdCampaignIds.length > 0) {
      await Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
      console.log(`Deleted ${createdCampaignIds.length} test campaigns.`);
    }
    if (createdSegmentIds.length > 0) {
      await Segment.deleteMany({ _id: { $in: createdSegmentIds } });
      console.log(`Deleted ${createdSegmentIds.length} test segments.`);
    }

    // Close mongoose connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

runTests();
