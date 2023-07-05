import { z } from "zod"

export const SubredditSchema = z.object({
  name: z.string().min(3).max(21),
})

export const SubredditSubscriptionSchema = z.object({
  subredditId: z.string(),
})

export type CreateSubredditPayload = z.infer<typeof SubredditSchema>
export type SubscribeToSubredditPayload = z.infer<
  typeof SubredditSubscriptionSchema
>
