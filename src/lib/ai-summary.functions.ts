import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { streamText, Output } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ situation: z.string().trim().min(10).max(4000) });
const Summary = z.object({
  resumo: z.string(),
  prioridade: z.enum(["baixa", "media", "alta"]),
  proximos_passos: z.array(z.string()),
  mensagem_sugerida: z.string(),
});

export const summarizeSituation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso restrito à administração.");
    const key = process.env["OPENAI_API_KEY"];
    if (!key) throw new Error("Serviço de IA não configurado.");

    const openai = createOpenAI({
      apiKey: key,
    });
    try {
      const result = streamText({
        model: openai.responses(process.env["OPENAI_MODEL"] ?? "gpt-4.1-mini"),
        output: Output.object({ schema: Summary }),
        system:
          "Você é assistente de atendimento da Saturnina, marca premium de beleza feminina. Responda em português do Brasil, com tom acolhedor, elegante e objetivo. Resuma a situação em até 3 frases, defina a prioridade, liste de 3 a 5 próximos passos práticos e curtos para a equipe, e sugira uma mensagem breve para enviar à cliente (WhatsApp). Não invente preços, políticas ou dados não informados.",
        prompt: data.situation,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const out = await result.output;
      return { ...out, proximos_passos: out.proximos_passos.slice(0, 6) };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("402"))
        throw new Error("Créditos de IA esgotados. Adicione créditos ao workspace.");
      if (msg.includes("429"))
        throw new Error("Muitas solicitações. Aguarde um instante e tente novamente.");
      console.error(e);
      throw new Error("Não foi possível gerar o resumo agora.");
    }
  });
