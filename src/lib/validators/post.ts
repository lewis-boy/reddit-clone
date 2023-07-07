import { z } from "zod"

//the editor content has a very specific format
//so that's why we use .any()
export const PostValidator = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be longer that 3 characters" })
    .max(128, { message: "Title must be at most 128 characters" }),
  subredditId: z.string(),
  content: z.any(),
})

export type PostCreationRequest = z.infer<typeof PostValidator>
