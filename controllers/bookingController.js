const redisClient = require("../redisClient");

exports.bookSeat = async (req, res) => {

    let { seatId, user } = req.body;
    seatId = seatId.trim().toUpperCase();

    const lockKey = `lock:${seatId}`;
    const seatKey = `seat:${seatId}`;
    const bookingKey = `booking:${seatId}`;

    try {

        const lock = await redisClient.set(lockKey, user, {
            NX: true,
            EX: 10
        });

        if (!lock) {
            return res.status(400).json({
                message: "Seat is being booked by another user"
            });
        }

        const seatStatus = await redisClient.get(seatKey);

        if (seatStatus === "booked") {

            await redisClient.del(lockKey);

            return res.status(400).json({
                message: "Seat already booked"
            });
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        const bookingId = "BOOK-" + Date.now();

        await redisClient.set(seatKey, "booked");

        await redisClient.set(
            bookingKey,
            JSON.stringify({
                bookingId,
                seat: seatId,
                user
            })
        );

        await redisClient.del(lockKey);

        res.json({
            success: true,
            bookingId,
            seat: seatId,
            user
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};


// NEW FUNCTION → GET SEAT STATUS

exports.getSeats = async (req, res) => {

    try {

        const seats = {};
        const seatIds = ["A1", "A2", "A3", "A4", "A5"];

        for (const seat of seatIds) {

            const status = await redisClient.get(`seat:${seat}`);

            seats[seat] = status === "booked" ? "booked" : "available";
        }

        res.json(seats);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};