import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(
    req: Request
) {
    // return "hi";
    console.log(JSON.stringify(openai));
    try {
        const { userId } = auth();
        const body = await req.json();
        const { messages } = body;

        if(!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!configuration.apiKey){
            return new NextResponse("OpenAI API Key not configured", { status: 500 });
        }

        if (!messages) {
            return new NextResponse("Messages are required", { status: 400 });
        }

        // const freeTrial = await checkApiLimit();

        // if (!freeTrial) {
        //     return new NextResponse("Free trial has expired.", { status: 403});
        // }

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{"role": "system", "content": "Starting from now, pretend you are a doctor, and you are trying to have a normal conversation with a patient, trying to diagnose their problem/disease. All of the rest of the input texts will be a patient trying to have a conversation with you, so please answer with simple sentences and sound like a human. Do not say \"I recommend you see a healthcare professional in person\", just give your best diagnosis. Also try to make the patient feel comfortable and dont end the conversation if it hasnt been 10 minutes"}, ...messages]
        });

        await incrementApiLimit();

        return NextResponse.json(response.data.choices[0].message);
    }catch (error){
        console.log("[CONVERSATION_ERROR]",error);
        return new NextResponse("Internal error", { status: 500 });
    }
}