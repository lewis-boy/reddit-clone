'use client'

import { useCustomToast } from '@/hooks/use-custom-toast'
import { usePrevious } from '@mantine/hooks'
import { VoteType } from '@prisma/client'
import { FC, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { PostVoteRequest } from '@/lib/validators/vote'
import axios, { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'

interface PostVoteClientProps {
    postId: string
    initialVotesAmt: number
    initialVote?: VoteType | null
}

const PostVoteClient: FC<PostVoteClientProps> = ({ postId, initialVotesAmt, initialVote }) => {

    const { loginToast } = useCustomToast()
    const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt)
    const [currentVote, setCurrentVote] = useState(initialVote)
    const prevVote = usePrevious(currentVote)

    //initialVote may begin undefined, but is later populated if there is an initial vote
    //so this ensures a synchronization with the server part of this component
    useEffect(() => {
        setCurrentVote(initialVote)
    }, [initialVote])

    const { mutate: vote } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: PostVoteRequest = {
                postId,
                voteType
            }

            await axios.patch('/api/subreddit/post/vote', payload)

        },
        onError: (err, voteType) => {
            if (voteType === 'UP') {
                setVotesAmt((prev) => prev - 1)
            } else {
                setVotesAmt((prev) => prev + 1)
            }

            //reset current vote
            setCurrentVote(prevVote)

            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast();
                }
            }

            return toast({
                title: 'Something went wrong and caught in the PostVoteClient',
                description: 'Your vote was not registered. Please try again',
                variant: 'destructive'
            })
        },
        onMutate: (voteType: VoteType) => {
            //as soon as it happens, before it is resolved/settled, this function is fired
            if (currentVote === voteType) {
                setCurrentVote(undefined)
                if (voteType === 'UP') setVotesAmt((prev) => prev - 1)
                else if (voteType === 'DOWN') setVotesAmt((prev) => prev + 1)
            } else {
                setCurrentVote(voteType)
                if (voteType === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
                else if (voteType === 'DOWN') setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
            }
        }
    })


    return (
        <div className='flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0'>
            <Button size='sm' variant='ghost' aria-label='upvote'>
                <ArrowBigUp onClick={() => vote('UP')} className={cn('h-5 w-5 text-zinc-700', {
                    'text-emerald-500 fill-emerald-500': currentVote === 'UP'
                })} />
            </Button>

            <p className='text-center py-2 font-medium text-sm text-zinc-900'>
                {votesAmt}
            </p>

            <Button size='sm' variant='ghost' aria-label='downvote'>
                <ArrowBigDown onClick={() => vote('DOWN')} className={cn('h-5 w-5 text-zinc-700', {
                    'text-red-500 fill-red-500': currentVote === 'DOWN'
                })} />
            </Button>
        </div>
    )
}

export default PostVoteClient