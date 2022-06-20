// try to make a login and log out system with localFS

import { router, server, MYfs} from "./../appWraperrr/bundler_";
import fs from 'fs';

router.get("", (data, {html}) => {
    fs.readFile("public/login.html", "utf8", (err, content)=>{
        html(content);
    });
});

// create user (name is uid)
router.post("api/users", (data, {json}) => {
    // const username: string = data.payload['name' as keyof ];
});

// delete user

// get user by name




server.init();