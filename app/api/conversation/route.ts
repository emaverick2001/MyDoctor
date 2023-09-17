import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai =  new OpenAIApi(configuration);

export async function POST(
    req: Request
) {
    // return "hi";
    console.log(JSON.stringify(openai));
    try {
        const { userId } = auth();
        console.log(userId);
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
            messages: [{"role": "system", "content": "Starting from now, pretend you are a doctor, and you are trying to have a normal conversation with a patient. during the first few conversataion exchanges, the patient is going to give you a name and tell you your characteristics. Follow these characteristics and start talking like a doctor immediately. Do not say \"I will play the role of ..\". Become the doctor the patient gives you and try to have a conversation with them. Trying to diagnose their problem/disease. All of the rest of the input texts will be a patient trying to have a conversation with you, so please answer with simple sentences and sound like a human. Do not be too empathetic, but try to be concise and professional. Do not say \"...see a healthcare professional…\", just give your best diagnosis. Do not end the role playing before finishing 20 conversations. Use professional medical terms. Do not include this '[Patient's Characteristic]' "}, ...messages]
        });

        await incrementApiLimit();

        return NextResponse.json(response.data.choices[0].message);
    }catch (error: any){
        console.log("[CONVERSATION_ERROR]",error);
        return new NextResponse(error.message, { status: 500 });
    }
}
