import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/Button";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";

const Navbar = async () => {
    const session = await getAuthSession();

    return (
        <div className="fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2">
            <div className="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
                <Link href="/" className="flex gap-2 items-center">
                    {/* hiding only for mobile view ~ md: affects medium and larger screens */}
                    <Icons.logo className="h-8 w-8 sm:h-6 sm:w-8" />
                    <p className="hidden text-zinc-700 text-sm font-medium md:block">Breadit</p>
                </Link>

                {/* search bar */}
                {/* buttonVariants makes the Link look like a button 
                Buttons require user interaction, which would need this to be a client page
                We want to avoid that, so we use Links and make them look like buttons */}
                {session?.user ? (
                    <UserAccountNav user={session.user} />
                ) : (
                    <Link href="/sign-in" className={buttonVariants()}>
                        Sign In
                    </Link>
                )}

            </div>
        </div>)
}

export default Navbar;