import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { SubredditSchema } from "@/lib/validators/subreddit"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    //first: is the user logged in?
    const session = await getAuthSession()
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    //second: Never trust the client. Take the body and parse it to a Schema or the Object that you are expecting
    const body = await req.json()
    const { name } = SubredditSchema.parse(body)

    //third: Check if the subreddit already exists, before trying to create it
    const subredditExists = await db.subreddit.findFirst({
      where: {
        name,
      },
    })

    if (subredditExists) {
      return new Response("subreddit already exists", { status: 409 })
      //409 means conflict, name conflict
    }

    //fourth: Now we can create the subreddit
    //        And we can also create the subscription Link as well
    const subreddit = await db.subreddit.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    })
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: subreddit.id,
      },
    })
    return new Response(subreddit.name)
  } catch (error) {
    if (error instanceof z.ZodError) {
      //parsing failed and wrong data was sent to us
      //send 422. unprocessable entity // or a bad status code
      return new Response(error.message, { status: 422 })
    }

    return new Response("Could not create subreddit", { status: 500 })
  }
}
