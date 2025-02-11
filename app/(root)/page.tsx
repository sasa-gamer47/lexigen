// import { createUser } from "@/lib/actions/user.actions";
// import { connectToDatabase } from "@/lib/database";
// import Image from "next/image";

// export default function Home() {

//   async function newUser() {

//     console.log('called');
    
    
//     const user = await createUser({
//         clerkId: '123',
//         username: 'test',
//         email: 'test@gmail.com',
//         photo: 'test.png'
//     })

//     console.log('user ', user);
    

//     return user
// }

// // newUser()

//   return (
//    <div>p</div>
//   );
// }


import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <div>Home page content.</div>
    </div>
  );
}
