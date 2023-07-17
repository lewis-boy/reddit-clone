'use client'

import { FC, useCallback, useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from './ui/Command'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Prisma, Subreddit } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import debounce from 'lodash.debounce'

interface SearchBarProps {

}

const SearchBar: FC<SearchBarProps> = ({ }) => {
    const [input, setInput] = useState<string>('')
    const router = useRouter()


    const { data: queryResults, refetch, isFetched, isFetching } = useQuery({
        queryFn: async () => {
            if (!input) return []

            const { data } = await axios.get(`api/search?q=${input}`)
            return data as (Subreddit & {
                _count: Prisma.SubredditCountOutputType
            })[]
        },
        queryKey: ['search-query'],
        //we only want to fetch when we actually type rather when it renders
        enabled: false,
    })

    //debouncing prevents spamming database every time we type
    //it only sends request if we stop typing for 300 miliseconds
    const request = debounce(() => {
        refetch()
    }, 300)
    const debounceRequest = useCallback(() => {
        request()
    }, [])

    return (
        <Command className='relative rounded-lg border max-w-lg z-50 overflow-visible'>
            <CommandInput
                className='outline-none border-none focus:border-none focus:outline-none ring-0'
                placeholder='Search communities...'
                value={input}
                onValueChange={(text) => {
                    setInput(text)
                    debounceRequest()
                }}

            />

            {input.length > 0 ? (
                <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'>
                    {isFetched && <CommandEmpty>No results found</CommandEmpty>}
                    {(queryResults?.length ?? 0) > 0 ? (
                        <CommandGroup heading='Communities'>
                            {queryResults?.map((subreddit) => (
                                <CommandItem
                                    value={subreddit.name}
                                    key={subreddit.id}
                                    onSelect={(e) => {
                                        router.push(`/r/${e}`)
                                        router.refresh()
                                    }}
                                >
                                    <Users className='mr-2 h-4 w-4' />
                                    <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : null}
                </CommandList>
            ) : null}

        </Command>
    )
}

export default SearchBar