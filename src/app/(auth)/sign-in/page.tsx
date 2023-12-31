import SignIn from '@/components/SignIn';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';

const page: FC = () => {
    return (
        <div className='absolute inset-0'>
            <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-20">
                {/* buttonVariants makes the Link look like a button 
                Buttons require user interaction, which would need this to be a client page
                We want to avoid that, so we use Links and make them look like buttons */}
                <Link href='/' className={cn(buttonVariants({ variant: 'ghost' }), 'self-start -mt-20')}>
                    <ChevronLeft className='mr-2 h-4 w-4' />Home
                </Link>
                <SignIn />
            </div>
        </div>)
}

export default page