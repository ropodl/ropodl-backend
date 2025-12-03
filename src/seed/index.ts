import { db } from "../db/db.js";
import { userSchema } from "../schema/users.js";

const main = async() => {
    console.log("this is a test")
    await db.insert(userSchema).values({
        email:'as',
        fullname: "asd",
        username: "asd",
        avatar: "asd",
    })
    
}

main();