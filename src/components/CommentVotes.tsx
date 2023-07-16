'use client'

import { useCustomToast } from '@/hooks/use-custom-toast'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CommentVoteRequest } from '@/lib/validators/vote'
import { usePrevious } from '@mantine/hooks'
import { CommentVote, VoteType } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { FC, useState } from 'react'
import { Button } from './ui/Button'


//MOST COPIED FROM POSTVOTECLIENT COMPONENT

interface CommentVotesProps {
    commentId: string
    initialVotesAmt: number
    initialVote?: Pick<CommentVote, 'type'>
}

const CommentVotes: FC<CommentVotesProps> = ({ commentId, initialVotesAmt, initialVote }) => {

    const { loginToast } = useCustomToast()
    const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt)
    const [currentVote, setCurrentVote] = useState(initialVote)
    const prevVote = usePrevious(currentVote)

    //initialVote may begin undefined, but is later populated if there is an initial vote
    //so this ensures a synchronization with the server part of this component

    const { mutate: vote } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: CommentVoteRequest = {
                commentId,
                voteType
            }

            await axios.patch('/api/subreddit/post/comment/vote', payload)

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
                title: 'Something went wrong and caught in the CommentVotes',
                description: 'Your vote was not registered. Please try again',
                variant: 'destructive'
            })
        },
        onMutate: (voteType: VoteType) => {
            //as soon as it happens, before it is resolved/settled, this function is fired
            if (currentVote?.type === voteType) {
                setCurrentVote(undefined)
                if (voteType === 'UP') setVotesAmt((prev) => prev - 1)
                else if (voteType === 'DOWN') setVotesAmt((prev) => prev + 1)
            } else {
                setCurrentVote({ type: voteType })
                if (voteType === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
                else if (voteType === 'DOWN') setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
            }
        }
    })


    return (
        <div className='flex gap-1'>
            <Button size='sm' variant='ghost' aria-label='upvote'>
                <ArrowBigUp onClick={() => vote('UP')} className={cn('h-5 w-5 text-zinc-700', {
                    'text-emerald-500 fill-emerald-500': currentVote?.type === 'UP'
                })} />
            </Button>

            <p className='text-center py-2 font-medium text-sm text-zinc-900'>
                {votesAmt}
            </p>

            <Button size='sm' variant='ghost' aria-label='downvote'>
                <ArrowBigDown onClick={() => vote('DOWN')} className={cn('h-5 w-5 text-zinc-700', {
                    'text-red-500 fill-red-500': currentVote?.type === 'DOWN'
                })} />
            </Button>
        </div>
    )
}

export default CommentVotes