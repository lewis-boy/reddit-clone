import MiniCreatePost from '@/components/MiniCreatePost'
import PostFeed from '@/components/PostFeed'
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { FC } from 'react'

interface PageProps {
    params: {
        slug: string
    }
}

const page = async ({ params }: PageProps) => {
    const { slug } = params
    //we want to change up what is displayed based on whether they are authenticated or not
    const session = await getAuthSession()

    const subreddit = await db.subreddit.findFirst({
        where: {
            name: slug,
        },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subreddit: true
                },
                take: INFINITE_SCROLLING_PAGINATION_RESULTS
            }
        }
    })

    if (!subreddit) {
        //throw a 404 when no subreddit with that name exists
        return notFound()
    }

    return (
        <>
            <h1 className='font-bold text-3xl md:text-4xl h-14'>
                r/{subreddit.name}
            </h1>
            <MiniCreatePost session={session} />
            {/* TODO: Show posts in user feed */}
            <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />
        </>
    )
}

export default page