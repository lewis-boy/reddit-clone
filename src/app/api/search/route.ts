import { db } from "@/lib/db"
import { z } from "zod"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get("q")

    if (!q) return new Response("Invalid query", { status: 400 })

    const results = await db.subreddit.findMany({
      where: {
        name: {
          startsWith: q,
        },
      },
      include: {
        _count: true,
      },
      take: 5,
    })

    return new Response(JSON.stringify(results))
  } catch (error) {
    if (error instanceof z.ZodError) {
      //parsing failed and wrong data was sent to us
      //send 422. unprocessable entity // or a bad status code
      return new Response("Invalid request data passed ", { status: 422 })
    }

    return new Response(
      "Could not register your vote, please try again later",
      {
        status: 500,
      }
    )
  }
}
