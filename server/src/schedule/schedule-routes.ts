import express from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { AuthorizePayload, DeleteScheduleItemPayload, GetSchedulePayload, SetSchedulePayload } from '../../../shared/src/types';
import { crispyDB } from '../database/db';
import { updateTwitchCategoryIDCache } from '../twitch/twitch';
dotenv.config();
const scheduleRouter = express.Router();

const SCHEDULE_SECRET_PASSWORD = process.env.SCHEDULE_SECRET_PASSWORD || '';

if (!SCHEDULE_SECRET_PASSWORD) {
    throw new Error(`\`SCHEDULE_SECRET_PASSWORD\` is not set in the server's environment variables.`);
}

// In production, we should this hashed value somewhere secure...
const saltRounds = 10;
export const hashedSecretPassword = bcrypt.hashSync(SCHEDULE_SECRET_PASSWORD, saltRounds);


scheduleRouter.post('/authorize', async (req, res) => {
    const payload: AuthorizePayload = req.body;

    if (!(payload && payload.password)) {
        return res.status(400).send('Invalid payload');
    }

    const password = payload.password;
    // Perform password validation here
    const isPasswordValid = await bcrypt.compare(password, hashedSecretPassword);

    if (isPasswordValid) {
        return res.status(200).send("Authorized");
    } else {
        console.warn(`Someone at ${req.ip} tried and failed to authorize.`);
        return res.status(401).send('Unauthorized');
    }
})

scheduleRouter.post('/get', async (req, res) => {
    const payload: GetSchedulePayload = req.body;

    if (!(payload && payload.scheduleStartDate)) {
        return res.status(400).send('Invalid payload');
    }

    const password = payload.password;
    const isPasswordValid = await bcrypt.compare(password, hashedSecretPassword);

    if (!isPasswordValid) {
        console.warn(`Someone at ${req.ip} tried and failed to import the schedule.`);
        return res.status(401).send('Unauthorized');
    }


    try {
        // Fetch schedules from the database
        const startDate = new Date(payload.scheduleStartDate);
        const endDate = new Date(startDate);

        // Get the day of the week (0 - Sunday, 1 - Monday, ..., 6 - Saturday)
        const startDayOfWeek = startDate.getDay();
        const sixDaysLater = startDayOfWeek + 6;
        endDate.setDate(endDate.getDate() + sixDaysLater);
        // Set the time to 23:59:59.999
        endDate.setHours(23, 59, 59, 999);

        const stmt = crispyDB.prepare(`SELECT * FROM schedules WHERE date(startDateTimeRFC3339) BETWEEN date(?) AND date(?) ORDER BY startDateTimeRFC3339`);
        const rows = await new Promise<any[]>((resolve, reject) => {
            stmt.all(startDate.toISOString(), endDate.toISOString(), (err: Error | null, rows: any[]) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching schedules');
    }
})

scheduleRouter.post('/set', async (req, res) => {
    const payload: SetSchedulePayload = req.body;

    if (!(payload && payload.schedules && Array.isArray(payload.schedules))) {
        return res.status(400).send('Invalid payload');
    }

    const password = payload.password;
    const isPasswordValid = await bcrypt.compare(password, hashedSecretPassword);

    if (!isPasswordValid) {
        console.warn(`Someone at ${req.ip} tried and failed to update the schedule.`);
        return res.status(401).send('Unauthorized');
    }

    try {
        for (const schedule of payload.schedules) {
            const stmt = crispyDB.prepare(`REPLACE INTO schedules (id, startDateTimeRFC3339, endDateTimeRFC3339, ianaTimeZoneName, game, description, iconUrl) VALUES (?, ?, ?, ?, ?, ?, ?)`);

            await new Promise<void>((resolve, reject) => {
                stmt.run(
                    schedule.id,
                    schedule.startDateTimeRFC3339,
                    schedule.endDateTimeRFC3339,
                    schedule.ianaTimeZoneName,
                    schedule.game,
                    schedule.description || null,
                    schedule.iconUrl,
                    (err: Error) => {
                        if (err) {
                            console.error(err.message);
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        }

        updateTwitchCategoryIDCache();

        res.status(200).send('CrispyDB Schedules updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating schedules');
    }
})

scheduleRouter.post('/delete', async (req, res) => {
    const payload: DeleteScheduleItemPayload = req.body;

    if (!(payload && payload.id && payload.password)) {
        return res.status(400).send('Invalid payload');
    }

    const password = payload.password;
    const isPasswordValid = await bcrypt.compare(password, hashedSecretPassword);

    if (!isPasswordValid) {
        console.warn(`Someone at ${req.ip} tried and failed to delete a schedule item.`);
        return res.status(401).send('Unauthorized');
    }

    try {
        const stmt = crispyDB.prepare(`DELETE FROM schedules WHERE id = ?`);

        await new Promise<void>((resolve, reject) => {
            stmt.run(payload.id, (err: Error | null) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const logMsg = `Schedule item with ID ${payload.id} deleted successfully`;
        res.status(200).send(logMsg);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting schedule item');
    }
});

export default scheduleRouter;
