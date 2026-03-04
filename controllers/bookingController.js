const redisClient = require("../redisClient");
const seats = require("../data/seats");

exports.bookSeat = async (req, res) => {

    let { seatId, user } = req.body;

    // Normalize seatId (remove spaces, uppercase)
    seatId = seatId.trim().toUpperCase();

    const lockKey = `lock:${seatId}`;

    try {

        // Check if seat exists
        if (!(seatId in seats)) {
            return res.status(400).json({
                message: "Invalid seat ID"
            });
        }

        // Try to acquire Redis lock
        const lock = await redisClient.set(lockKey, user, {
            NX: true,
            EX: 10
        });

        if (!lock) {
            return res.status(400).json({
                message: "Seat is being booked by another user"
            });
        }

        // Check if seat already booked
        if (seats[seatId] === true) {

            await redisClient.del(lockKey);

            return res.status(400).json({
                message: "Seat already booked"
            });
        }

        // Simulate booking processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mark seat as booked
        seats[seatId] = true;

        // Generate booking ID
        const bookingId = "BOOK-" + Date.now();

        // Release Redis lock
        await redisClient.del(lockKey);

        res.json({
            success: true,
            bookingId: bookingId,
            seat: seatId,
            user: user
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};