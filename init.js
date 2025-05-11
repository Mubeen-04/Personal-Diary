const mongoose = require("mongoose");
const Chat = require("./models/chat");

main()
    .then(() => {
        console.log("Connection Successful");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://localhost:27017/whatsapp");
}

const allChats = [
    { from: "alice", to: "bob", msg: "Hey Bob, how's it going?"},
    { from: "bob", to: "alice", msg: "Hi Alice, I'm doing great. How about you?"},
    { from: "alice", to: "bob", msg: "All good here, just catching up on some work."},
    { from: "john", to: "doe", msg: "Doe, did you check the report I sent?"},
    { timestamps: { createdAt: 'created_at', updatedAt: false } } // Disable `updatedAt`
];

console.log(allChats.length); // Should be 4  



Chat.insertMany(allChats);
