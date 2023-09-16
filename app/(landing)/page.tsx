import { Button } from "@/components/ui/button";
import Link from "next/link";

const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function addUser() {
    const user = await prisma.user.create( {
        data: {
            email: 'myemail@mail.com',
            name: 'Myname',
            Role: 'PATIENT',
            conversation: [""],
            },
    });
}



const LandingPage = () => {
    return(
        <div>
            Landing Page (Protected)
            <div>
                <Link href="/sign-in">
                    <Button >
                        Login
                    </Button>
                </Link>
                <Link href="/sign-up">
                    <Button>
                        Register
                    </Button>
                </Link>
            </div>
            
        </div>
    );
}


export default LandingPage;