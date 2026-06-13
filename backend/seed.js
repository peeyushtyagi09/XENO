const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const { connectDB } = require("./src/database/db");

const CustomerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    city: String,
    totalSpent: Number,
    lastOrderDate: Date,
});

const Customer = mongoose.model("Customer", CustomerSchema);

async function seedCustomers() {
    try {
        await connectDB();
        console.log("✅ Successfully connected to the database.");

        await Customer.deleteMany();
        const customers = [];

        for (let i = 0; i < 100; i++) {
            customers.push({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phone: faker.phone.number("##########"),
                city: faker.location.city(),
                totalSpent: faker.number.int({
                    min: 1000,
                    max: 50000,
                }),
                lastOrderDate: faker.date.recent({ days: 100 }),
            });
        }

        await Customer.insertMany(customers);

        console.log("100 customers inserted");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seedCustomers();