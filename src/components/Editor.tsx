'use client'

import { FC, useCallback, useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useForm } from 'react-hook-form'
import { PostCreationRequest, PostValidator } from '@/lib/validators/post'
import { zodResolver } from '@hookform/resolvers/zod'
import type EditorJS from '@editorjs/editorjs'
import { uploadFiles } from '@/lib/uploadthing'
import { toast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'

interface EditorProps {
    subredditId: string
}

const Editor: FC<EditorProps> = ({ subredditId }) => {
    //this is gonna be used for client-side validation
    const { register, handleSubmit, formState: { errors } } = useForm<PostCreationRequest>({
        resolver: zodResolver(PostValidator),
        defaultValues: {
            subredditId,
            title: '',
            content: null
        }
    })

    const ref = useRef<EditorJS>()
    const _titleRef = useRef<HTMLTextAreaElement>(null)
    const [isMounted, setIsMounted] = useState<boolean>(false)
    const pathname = usePathname()
    const router = useRouter()



    const initializeEditor = useCallback(async () => {
        const EditorJS = (await import('@editorjs/editorjs')).default
        const Header = (await import('@editorjs/header')).default
        const Embed = (await import('@editorjs/embed')).default
        const Table = (await import('@editorjs/table')).default
        const List = (await import('@editorjs/list')).default
        const Code = (await import('@editorjs/code')).default
        const LinkTool = (await import('@editorjs/link')).default
        const InlineCode = (await import('@editorjs/inline-code')).default
        const ImageTool = (await import('@editorjs/image')).default

        //it means the editor is not initialized, and we have the green light to go initialize it
        if (!ref.current) {
            const editor = new EditorJS({
                holder: 'editor',
                onReady() {
                    //to prevent reinitialization , because it will think there isnt an editor initialized when it checks the ref
                    ref.current = editor
                },
                placeholder: 'Type here to write your post....',
                inlineToolbar: true,
                //Nothing is in here by default
                data: { blocks: [] },
                tools: {
                    header: Header,
                    //allows us to paste links, and preview the metadata and the image for the link
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: '/api/link',
                        }
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                //editor JS automatically passes this file when someone tries
                                //to upload a file
                                //so we are gonna handle the uploading file logic ourselves
                                async uploadByFile(file: File) {
                                    const [res] = await uploadFiles([file], 'imageUploader')

                                    return {
                                        success: 1,
                                        file: {
                                            url: res.fileUrl
                                        },
                                    }
                                }
                            }
                        }
                    },

                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    table: Table,
                    embed: Embed,
                }
            })
        }

    }, [])

    useEffect(() => {
        //if we are on the client side
        if (typeof window !== 'undefined') {
            setIsMounted(true)
        }
    }, [])

    useEffect(() => {
        if (Object.keys(errors).length) {
            for (const [_key, value] of Object.entries(errors)) {
                toast({
                    title: 'Something went wrong',
                    description: (value as { message: string }).message,
                    variant: 'destructive'
                })
            }
        }
    }, [errors])

    useEffect(() => {
        const init = async () => {
            //this takes away the focus
            await initializeEditor()

            //setTimeout is just gonna move the function inside to the end of the callstack
            setTimeout(() => {
                //set focus to title
                _titleRef.current?.focus()
            }, 0)
        }

        if (isMounted) {
            init()

            return () => {
                ref.current?.destroy()
                ref.current = undefined
            }
        }
    }, [isMounted, initializeEditor])

    const { mutate: createPost } = useMutation({
        mutationFn: async ({ title, content, subredditId }: PostCreationRequest) => {
            const payload: PostCreationRequest = {
                subredditId,
                title,
                content,
            }
            const { data } = await axios.post('/api/subreddit/post/create', payload)
            return data
        },
        onError: () => {
            //because this is on a page that only users can access this
            //we know they are authorized, so the error can be anything and not very important
            return toast({
                title: 'Something went wrong',
                description: 'Your post was not published, please try again later',
                variant: 'destructive'
            })
        },
        onSuccess: () => {
            // r/mycommunity/submit -> r/mycommunity
            const newPathname = pathname.split('/').slice(0, -1).join('/')
            router.push(newPathname)

            router.refresh()

            return toast({
                description: 'Your post was successfully published'
            })
        }
    })

    async function onSubmit(data: PostCreationRequest) {
        //saves current state of editor. save() comes from editorJS
        const blocks = await ref.current?.save()
        const payload: PostCreationRequest = {
            title: data.title,
            content: blocks,
            subredditId,
        }

        createPost(payload)
    }


    if (!isMounted) {
        return null
    }

    const { ref: titleRef, ...rest } = register('title')

    return (
        <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <form id='subreddit-post-form' className="w-fit" onSubmit={handleSubmit(onSubmit)}>
                <div className="prose prose-stone dark:prose-invert">
                    <TextareaAutosize
                        ref={(e) => {
                            titleRef(e)

                            //@ts-ignore
                            _titleRef.current = e
                        }}
                        {...rest}
                        placeholder='Title'
                        className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
                    />
                    <div id='editor' className='min-h-[500px]' />
                </div>
            </form>

        </div>
    )
}

export default Editor