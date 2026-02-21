import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NightMode {
    startTime: bigint;
    endTime: bigint;
    muteReminders: boolean;
    enabled: boolean;
}
export interface WaterEntry {
    timestamp: Time;
    amount: bigint;
}
export type Time = bigint;
export interface WeightEntry {
    weight: number;
    timestamp: Time;
}
export interface WaterDataView {
    themeMode: string;
    dailyGoal: bigint;
    wakeUpTime?: bigint;
    sleepTime?: bigint;
    weightHistory: Array<WeightEntry>;
    nightMode: NightMode;
    entries: Array<WaterEntry>;
    language: string;
    reminderMode: string;
    currentCount?: bigint;
    units: string;
    reminders: Array<Reminder>;
    reminderSound: string;
    missedReminderAlerts: boolean;
}
export interface Reminder {
    id: bigint;
    alertType: string;
    daysOfWeek: Array<boolean>;
    time: bigint;
    vibration: boolean;
    enabled: boolean;
    sound: boolean;
}
export interface backendInterface {
    addReminder(userId: bigint, time: bigint, daysOfWeek: Array<boolean>, sound: boolean, vibration: boolean, alertType: string): Promise<bigint>;
    addWeightEntry(userId: bigint, weight: number): Promise<void>;
    getAdvancedSettings(userId: bigint): Promise<{
        themeMode: string;
        wakeUpTime?: bigint;
        sleepTime?: bigint;
        language: string;
        reminderMode: string;
        units: string;
        reminderSound: string;
        missedReminderAlerts: boolean;
    }>;
    getCurrentDayIntake(userId: bigint): Promise<bigint>;
    getDailySummary(userId: bigint): Promise<{
        total: bigint;
        goal: bigint;
    }>;
    getDrinkLog(userId: bigint): Promise<Array<WaterEntry>>;
    getMonthlySummary(userId: bigint): Promise<bigint>;
    getNightMode(userId: bigint): Promise<NightMode>;
    getProgress(userId: bigint): Promise<WaterDataView>;
    getReminders(userId: bigint): Promise<Array<Reminder>>;
    getWeeklySummary(userId: bigint): Promise<bigint>;
    getWeightHistory(userId: bigint): Promise<Array<WeightEntry>>;
    incrementWaterIntake(userId: bigint, amount: bigint): Promise<void>;
    setAdvancedSettings(userId: bigint, reminderSound: string, reminderMode: string, missedReminderAlerts: boolean, units: string, themeMode: string, language: string, wakeUpTime: bigint | null, sleepTime: bigint | null): Promise<void>;
    setDailyGoal(userId: bigint, goal: bigint): Promise<void>;
    setNightMode(userId: bigint, enabled: boolean, startTime: bigint, endTime: bigint, muteReminders: boolean): Promise<void>;
    toggleReminder(userId: bigint, reminderId: bigint, enabled: boolean): Promise<void>;
    updateReminder(userId: bigint, reminderId: bigint, time: bigint, daysOfWeek: Array<boolean>, sound: boolean, vibration: boolean, alertType: string): Promise<void>;
    updateSleepWakeTimes(userId: bigint, wakeUpTime: bigint | null, sleepTime: bigint | null): Promise<void>;
}
