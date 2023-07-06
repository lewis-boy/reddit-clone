import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { SubredditSubscriptionSchema } from "@/lib/validators/subreddit"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { subredditId } = SubredditSubscriptionSchema.parse(body)

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    })

    if (!subscriptionExists) {
      return new Response("You are not subscribed to this subreddit", {
        status: 400,
      })
    }

    //check is user is the creator of the subreddit
    const subreddit = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
    })

    if (subreddit) {
      return new Response("You can't unsubscribe from your own subreddit", {
        status: 400,
      })
    }

    await db.subscription.delete({
      where: {
        userId_subredditId: {
          subredditId,
          userId: session.user.id,
        },
      },
    })

    return new Response(subredditId)
  } catch (error) {
    if (error instanceof z.ZodError) {
      //parsing failed and wrong data was sent to us
      //send 422. unprocessable entity // or a bad status code
      return new Response("Invalid request data passed ", { status: 422 })
    }

    return new Response("Could not unsubscribe, please try again later", {
      status: 500,
    })
  }
}
