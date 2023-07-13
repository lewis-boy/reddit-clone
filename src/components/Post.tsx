import { formatTimeToNow } from '@/lib/utils'
import { Post, User, Vote } from '@prisma/client'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { FC, useRef } from 'react'
import EditorOutput from './EditorOutput'
import PostVoteClient from './post-vote/PostVoteClient'

type PartialVote = Pick<Vote, 'type'>

interface PostProps {
    subredditName: string
    post: Post & {
        author: User
        votes: Vote[]
    }
    commentAmt: number
    votesAmt: number
    currentVote?: PartialVote
}

const Post: FC<PostProps> = ({ subredditName, post, commentAmt, votesAmt, currentVote }) => {

    const postRef = useRef<HTMLDivElement>(null)

    return (
        <div className='rounded-md bg-white shadow'>
            <div className='px-6 py-4 flex justify-between'>
                {/* TODO PostVotes */}
                <PostVoteClient initialVotesAmt={votesAmt} postId={post.id} initialVote={currentVote?.type} />

                <div className='w-0 flex-1'>
                    <div className='max-h-40 mt-1 text-xs text-gray-500'>
                        {subredditName ? (
                            <>
                                {/* we want a hard reset, so we are using an A tag rather than a Link */}
                                <a
                                    className='underline text-zinc-900 text-sm underline-offset-2'
                                    href={`/r/${subredditName}`}
                                >
                                    r/{subredditName}
                                </a>
                                <span className='px-1'>-</span>
                            </>
                        ) : (
                            null
                        )}
                        <span>Posted by u/{post.author.name}</span>{' '}
                        {formatTimeToNow(new Date(post.createdAt))}
                    </div>
                    {/* we want a hard reset to refresh the comments since fetched server-side */}
                    <a href={`/r/${subredditName}/post/${post.id}`}>
                        <h1 className='text-lg font-semibold py-2 leading-6 text-gray-900'>
                            {post.title}
                        </h1>
                    </a>
                    {/* the purpose of this ref is to dynamically track its height */}
                    <div ref={postRef} className='relative text-sm max-h-40 w-full overflow-clip'>
                        <EditorOutput content={post.content} />
                        {postRef.current?.clientHeight === 160 ? (
                            <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent'></div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className='bg-gray-50 z-20 text-sm p-4 sm:px-6 '>
                <a href={`/r/${subredditName}/post/${post.id}}`} className='w-fit flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4' /> {commentAmt} comments
                </a>
            </div>
        </div>
    )
}

export default Post